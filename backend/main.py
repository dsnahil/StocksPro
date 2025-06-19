import os
import requests
import pandas as pd
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from newsapi import NewsApiClient
from dotenv import load_dotenv

load_dotenv()

FMP_API_KEY = os.getenv("FMP_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
if not FMP_API_KEY:
    raise RuntimeError("FMP_API_KEY must be set in your .env")
if not NEWS_API_KEY:
    raise RuntimeError("NEWS_API_KEY must be set in your .env")

SP500_CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "sp500.csv")
STOCKS_DF = pd.read_csv(SP500_CSV_PATH)

app = FastAPI(title="StocksPro API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# News API
newsapi = NewsApiClient(api_key=NEWS_API_KEY)


class StockAnalysisRequest(BaseModel):
    ticker: str
    shares: int
    average_price: float


class StockAnalysisResponse(BaseModel):
    summary: str
    key_drivers: List[str]
    recommendation: str
    rationale: str
    disclaimer: str
    data_timestamp: str


class StockSuggestion(BaseModel):
    symbol: str
    name: str
    exchange: str


def calculate_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    # RSI
    delta = df["Close"].diff()
    gain = delta.where(delta > 0, 0).rolling(window=14).mean()
    loss = -delta.where(delta < 0, 0).rolling(window=14).mean()
    rs = gain / loss
    df["RSI"] = 100 - (100 / (1 + rs))

    # Moving averages
    df["MA50"] = df["Close"].rolling(window=50).mean()
    df["MA200"] = df["Close"].rolling(window=200).mean()

    return df


def get_news_sentiment(ticker: str):
    try:
        articles = newsapi.get_everything(
            q=ticker,
            language="en",
            sort_by="relevancy",
            from_param=(datetime.now() - timedelta(days=14)).strftime("%Y-%m-%d"),
        )
        return articles.get("articles", [])
    except Exception:
        return []


@app.get("/search_stocks", response_model=List[StockSuggestion])
async def search_stocks(query: str = Query(..., min_length=2)):
    q = query.lower()
    mask = (
        STOCKS_DF["Symbol"].str.lower().str.startswith(q)
        | STOCKS_DF["Security"].str.lower().str.startswith(q)
    )
    suggestions = []
    for _, row in STOCKS_DF[mask].head(10).iterrows():
        suggestions.append(
            StockSuggestion(
                symbol=row["Symbol"],
                name=row["Security"],
                exchange="S&P 500",
            )
        )
    return suggestions


@app.post("/analyze", response_model=StockAnalysisResponse)
async def analyze_stock(req: StockAnalysisRequest):
    ticker = req.ticker.upper()

    # 1) Fetch historical prices from FMP
    hist_url = (
        f"https://financialmodelingprep.com/api/v3/historical-price-full/{ticker}"
        f"?apikey={FMP_API_KEY}"
    )
    r = requests.get(hist_url)
    if r.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch history for {ticker} (status {r.status_code})",
        )
    payload = r.json()
    if "historical" not in payload or not payload["historical"]:
        raise HTTPException(
            status_code=404, detail=f"No historical data available for {ticker}"
        )

    # build DataFrame
    df = pd.DataFrame(payload["historical"])
    df = df.rename(columns={"close": "Close"})
    df["Close"] = df["Close"].astype(float)
    df = df.sort_values("date").reset_index(drop=True).set_index("date")

    # indicators
    df = calculate_technical_indicators(df)

    # current price is the last close
    current_price = df["Close"].iloc[-1]

    # 2) News sentiment
    news_articles = get_news_sentiment(ticker)

    # 3) Position
    total_investment = req.shares * req.average_price
    current_value = req.shares * current_price
    profit_loss = current_value - total_investment

    # 4) Build summary
    summary = f"{ticker} is trading at ${current_price:.2f}. "
    summary += (
        "Above your avg price."
        if current_price > req.average_price
        else "Below your avg price."
    )

    # 5) Key drivers
    drivers = []
    rsi_val = df["RSI"].iloc[-1]
    if rsi_val < 30:
        drivers.append("RSI indicates oversold conditions")
    elif rsi_val > 70:
        drivers.append("RSI indicates overbought conditions")

    if current_price > df["MA50"].iloc[-1]:
        drivers.append("Price is above 50-day MA")
    else:
        drivers.append("Price is below 50-day MA")

    if news_articles:
        drivers.append(f"Recent news: {news_articles[0]['title']}")

    # 6) Recommendation
    if profit_loss < 0:
        recommendation = (
            "Consider averaging down"
            if rsi_val < 30
            else "Consider holding or setting a stop loss"
        )
    else:
        recommendation = (
            "Consider taking profits" if rsi_val > 70 else "Consider holding for gains"
        )

    rationale = (
        f"Based on technicals and market conditions, {recommendation.lower()}. "
        f"You have a {'profit' if profit_loss>0 else 'loss'} of ${abs(profit_loss):.2f}."
    )

    return StockAnalysisResponse(
        summary=summary,
        key_drivers=drivers,
        recommendation=recommendation,
        rationale=rationale,
        disclaimer="This is informational only, not financial advice.",
        data_timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import pandas as pd
from datetime import datetime, timedelta
import os
from newsapi import NewsApiClient
from dotenv import load_dotenv

load_dotenv()

FMP_API_KEY = os.getenv("FMP_API_KEY")
SP500_CSV_PATH = os.path.join(os.path.dirname(__file__), "data", "sp500.csv")
STOCKS_DF = pd.read_csv(SP500_CSV_PATH)

app = FastAPI(title="StocksPro API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize NewsAPI client
newsapi = NewsApiClient(api_key=os.getenv('NEWS_API_KEY'))

class StockAnalysisRequest(BaseModel):
    ticker: str
    shares: int
    average_price: float
    position_type: str  # "profit" or "loss"
    position_amount: float

class StockAnalysisResponse(BaseModel):
    summary: str
    key_drivers: list[str]
    recommendation: str
    rationale: str
    disclaimer: str
    data_timestamp: str

class StockSuggestion(BaseModel):
    symbol: str
    name: str
    exchange: str

# Re-import yfinance for other functionalities
import yfinance as yf

def calculate_technical_indicators(df):
    # Calculate RSI
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # Calculate Moving Averages
    df['MA50'] = df['Close'].rolling(window=50).mean()
    df['MA200'] = df['Close'].rolling(window=200).mean()
    
    return df

def get_news_sentiment(ticker):
    try:
        news = newsapi.get_everything(
            q=ticker,
            language='en',
            sort_by='relevancy',
            from_param=(datetime.now() - timedelta(days=14)).strftime('%Y-%m-%d')
        )
        return news['articles']
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []

@app.get("/search_stocks", response_model=List[StockSuggestion])
async def search_stocks(query: str = Query(..., min_length=2)):
    try:
        query_lower = query.lower()
        filtered = STOCKS_DF[
            STOCKS_DF["Symbol"].str.lower().str.startswith(query_lower)
            | STOCKS_DF["Security"].str.lower().str.startswith(query_lower)
        ].head(10)

        suggestions = [
            StockSuggestion(
                symbol=row["Symbol"],
                name=row["Security"],
                exchange="S&P 500",
            )
            for _, row in filtered.iterrows()
        ]

        return suggestions
    except Exception as e:
        print(f"Error searching local stock list: {e}")
        raise HTTPException(status_code=500, detail="Error searching for stocks.")

@app.post("/analyze", response_model=StockAnalysisResponse)
async def analyze_stock(request: StockAnalysisRequest):
    try:
        # Fetch stock data using yfinance (this part remains the same)
        ticker_symbol = request.ticker
        if not ticker_symbol.endswith(".NS"):
            ticker_symbol += ".NS"
        stock = yf.Ticker(ticker_symbol)
        hist = stock.history(period="1y")
        
        if hist.empty:
            raise HTTPException(status_code=404, detail="Stock data not found")
        
        # Calculate technical indicators
        hist = calculate_technical_indicators(hist)
        
        # Get latest price
        current_price = hist['Close'].iloc[-1]
        
        # Get news sentiment
        news_articles = get_news_sentiment(request.ticker)
        
        # Calculate position analysis
        total_investment = request.shares * request.average_price
        current_value = request.shares * current_price
        profit_loss = current_value - total_investment
        
        # Generate analysis
        summary = f"{request.ticker} is currently trading at ${current_price:.2f}. "
        if current_price > request.average_price:
            summary += "The stock is trading above your average price."
        else:
            summary += "The stock is trading below your average price."
        
        key_drivers = []
        
        # Technical analysis
        if hist['RSI'].iloc[-1] < 30:
            key_drivers.append("RSI indicates oversold conditions")
        elif hist['RSI'].iloc[-1] > 70:
            key_drivers.append("RSI indicates overbought conditions")
            
        if current_price > hist['MA50'].iloc[-1]:
            key_drivers.append("Price is above 50-day moving average")
        else:
            key_drivers.append("Price is below 50-day moving average")
            
        # News sentiment
        if news_articles:
            key_drivers.append(f"Recent news: {news_articles[0]['title']}")
        
        # Generate recommendation
        if profit_loss < 0:
            if hist['RSI'].iloc[-1] < 30:
                recommendation = "Consider averaging down your position"
            else:
                recommendation = "Consider holding or setting a stop loss"
        else:
            if hist['RSI'].iloc[-1] > 70:
                recommendation = "Consider taking profits"
            else:
                recommendation = "Consider holding for further gains"
        
        rationale = f"Based on technical analysis and current market conditions, {recommendation.lower()}. "
        rationale += f"Your position shows a {'profit' if profit_loss > 0 else 'loss'} of ${abs(profit_loss):.2f}."
        
        return StockAnalysisResponse(
            summary=summary,
            key_drivers=key_drivers,
            recommendation=recommendation,
            rationale=rationale,
            disclaimer="This analysis is for informational purposes only and should not be considered as financial advice.",
            data_timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

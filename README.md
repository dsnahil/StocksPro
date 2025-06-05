# StocksPro

**StocksPro** is a web application for analyzing stock data and generating actionable buy/hold/sell recommendations. It combines real-time market data, news sentiment, technical indicators and fundamental metrics to help users make informed investment decisions.

## Features

- **Real-time Stock Data** – fetches price history and technical indicators
- **News Sentiment Analysis** – gauges market sentiment from latest news
- **Technical Signals** – RSI, MACD and moving averages
- **Historical Patterns** – checks historical price trends
- **Social Sentiment** – integrates community sentiment
- **Offline Symbol Lookup** – local CSV of S&P 500 companies enables autocomplete suggestions

## Tech Stack

- **Backend:** [FastAPI](https://fastapi.tiangolo.com/) with Python
- **Frontend:** [React](https://reactjs.org/) with TypeScript and Material UI
- **Data Providers:** NewsAPI and Financial Modeling Prep (FMP)

## Getting Started

Clone the repository and set up both the backend and frontend.

### 1. Backend Setup

```bash
# create a virtual environment
python -m venv venv
source venv/bin/activate               # on Windows use venv\Scripts\activate

# install dependencies
pip install -r requirements.txt

# create .env file in /backend
cat <<EOV > backend/.env
NEWS_API_KEY=your_news_api_key
FMP_API_KEY=your_fmp_api_key
EOV

# run the API server
cd backend
uvicorn main:app --reload
```

### 2. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

Open <http://localhost:3000> to use the application. Start typing a ticker symbol to see company suggestions pulled from the local S&P 500 list.

## Environment Variables

The backend expects the following variables in `backend/.env`:

| Variable       | Description                         |
| -------------- | ----------------------------------- |
| `NEWS_API_KEY` | API key for [NewsAPI](https://newsapi.org/) |
| `FMP_API_KEY`  | API key for [Financial Modeling Prep](https://financialmodelingprep.com/) |

## Contributing

Issues and pull requests are welcome. Please open an issue to discuss your ideas before submitting major changes.

---

Crafted with ❤️ to help you trade smarter.

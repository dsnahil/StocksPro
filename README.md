# StocksPro - Stock Analysis and Recommendation Tool

A comprehensive web application that helps users make informed decisions about buying, holding, or selling stocks based on multiple data points including news, technical analysis, and fundamental data.

## Features

- Real-time stock data analysis
- News sentiment analysis
- Technical indicators (RSI, MACD, Moving Averages)
- Position-based recommendations
- Historical price pattern analysis
- Social sentiment integration
- Offline search suggestions using a local list of S&P 500 companies

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory with your API keys:
```
NEWS_API_KEY=your_news_api_key
FMP_API_KEY=your_fmp_key
```

4. Start the backend server:
```bash
cd backend
uvicorn main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```

The app provides autocomplete search suggestions after typing two or more
letters in the stock search field. Suggestions are served from a local CSV file
containing S&P 500 company names and symbols.

## Environment Variables

The following environment variables are required:

- `NEWS_API_KEY`: API key for NewsAPI
- `FMP_API_KEY`: API key for Financial Modeling Prep

## Contributing

Feel free to submit issues and enhancement requests. 

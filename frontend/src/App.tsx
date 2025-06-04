import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

interface AnalysisResponse {
  summary: string;
  key_drivers: string[];
  recommendation: string;
  rationale: string;
  disclaimer: string;
  data_timestamp: string;
}

function App() {
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [positionType, setPositionType] = useState('profit');
  const [positionAmount, setPositionAmount] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const response = await axios.post('http://localhost:8000/analyze', {
        ticker: ticker.toUpperCase(),
        shares: parseInt(shares),
        average_price: parseFloat(averagePrice),
        position_type: positionType,
        position_amount: parseFloat(positionAmount),
      });

      setAnalysis(response.data);
    } catch (err) {
      setError('Error analyzing stock. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        StocksPro Analysis
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Stock Ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Number of Shares"
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Average Price"
              type="number"
              value={averagePrice}
              onChange={(e) => setAveragePrice(e.target.value)}
              required
              fullWidth
            />

            <FormControl component="fieldset">
              <FormLabel component="legend">Position Type</FormLabel>
              <RadioGroup
                value={positionType}
                onChange={(e) => setPositionType(e.target.value)}
              >
                <FormControlLabel
                  value="profit"
                  control={<Radio />}
                  label="Profit"
                />
                <FormControlLabel
                  value="loss"
                  control={<Radio />}
                  label="Loss"
                />
              </RadioGroup>
            </FormControl>

            <TextField
              label="Position Amount"
              type="number"
              value={positionAmount}
              onChange={(e) => setPositionAmount(e.target.value)}
              required
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Analyze Stock'}
            </Button>
          </Box>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {analysis && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Analysis Results
          </Typography>

          <Typography variant="body1" paragraph>
            {analysis.summary}
          </Typography>

          <Typography variant="h6" gutterBottom>
            Key Drivers:
          </Typography>
          <ul>
            {analysis.key_drivers.map((driver, index) => (
              <li key={index}>
                <Typography variant="body1">{driver}</Typography>
              </li>
            ))}
          </ul>

          <Typography variant="h6" gutterBottom>
            Recommendation:
          </Typography>
          <Typography variant="body1" paragraph>
            {analysis.recommendation}
          </Typography>

          <Typography variant="h6" gutterBottom>
            Rationale:
          </Typography>
          <Typography variant="body1" paragraph>
            {analysis.rationale}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {analysis.disclaimer}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Data current as of {analysis.data_timestamp}
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default App;

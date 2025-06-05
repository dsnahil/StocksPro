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
  Fade,
  Grow,
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
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url("https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2070")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(5px)',
        }
      }}
    >
      <Container maxWidth="md" sx={{ py: 4, position: 'relative' }}>
        <Fade in={true} timeout={1000}>
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            StocksPro Analysis
          </Typography>
        </Fade>

        <Grow in={true} timeout={1000}>
          <Paper elevation={3} sx={{ 
            p: 4, 
            mb: 4,
            borderRadius: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            }
          }}>
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Stock Ticker"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#2196F3',
                      },
                    },
                  }}
                />

                <TextField
                  label="Number of Shares"
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#2196F3',
                      },
                    },
                  }}
                />

                <TextField
                  label="Average Price"
                  type="number"
                  value={averagePrice}
                  onChange={(e) => setAveragePrice(e.target.value)}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#2196F3',
                      },
                    },
                  }}
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
                  label="Net Profit/Loss"
                  type="number"
                  value={positionAmount}
                  onChange={(e) => setPositionAmount(e.target.value)}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#2196F3',
                      },
                    },
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Analyze Stock'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Grow>

        {error && (
          <Fade in={true}>
            <Alert severity="error" sx={{ 
              mb: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              {error}
            </Alert>
          </Fade>
        )}

        {analysis && (
          <Grow in={true} timeout={1000}>
            <Paper elevation={3} sx={{ 
              p: 4,
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#2196F3' }}>
                Analysis Results
              </Typography>

              <Typography variant="body1" paragraph>
                {analysis.summary}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ color: '#2196F3' }}>
                Key Drivers:
              </Typography>
              <ul>
                {analysis.key_drivers.map((driver, index) => (
                  <li key={index}>
                    <Typography variant="body1">{driver}</Typography>
                  </li>
                ))}
              </ul>

              <Typography variant="h6" gutterBottom sx={{ color: '#2196F3' }}>
                Recommendation:
              </Typography>
              <Typography variant="body1" paragraph>
                {analysis.recommendation}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ color: '#2196F3' }}>
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
          </Grow>
        )}
      </Container>
    </Box>
  );
}

export default App;

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock axios to avoid issues with ESM imports during testing
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import App from './App';

test('renders StocksPro Analysis heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/StocksPro Analysis/i);
  expect(headingElement).toBeInTheDocument();
});

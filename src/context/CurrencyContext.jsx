import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Currency conversion rates (base: USD)
const EXCHANGE_RATES = {
  USD: { rate: 1, symbol: '$', name: 'US Dollar', country: 'United States' },
  EUR: { rate: 0.92, symbol: '€', name: 'Euro', country: 'European Union' },
  GBP: { rate: 0.79, symbol: '£', name: 'British Pound', country: 'United Kingdom' },
  INR: { rate: 83.12, symbol: '₹', name: 'Indian Rupee', country: 'India' },
  JPY: { rate: 149.50, symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
  AUD: { rate: 1.52, symbol: 'A$', name: 'Australian Dollar', country: 'Australia' },
  CAD: { rate: 1.35, symbol: 'C$', name: 'Canadian Dollar', country: 'Canada' },
  CNY: { rate: 7.24, symbol: '¥', name: 'Chinese Yuan', country: 'China' },
  AED: { rate: 3.67, symbol: 'د.إ', name: 'UAE Dirham', country: 'United Arab Emirates' },
  SGD: { rate: 1.34, symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    // Load currency from localStorage on initialization
    const savedCurrency = localStorage.getItem('selectedCurrency');
    return savedCurrency || 'USD';
  });

  // Save currency to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedCurrency', currency);
  }, [currency]);

  const convertPrice = (priceInUSD) => {
    if (!priceInUSD) return 0;
    const rate = EXCHANGE_RATES[currency].rate;
    return Math.round(priceInUSD * rate);
  };

  const formatPrice = (priceInUSD) => {
    const convertedPrice = convertPrice(priceInUSD);
    const symbol = EXCHANGE_RATES[currency].symbol;
    
    // Format with commas
    const formattedNumber = convertedPrice.toLocaleString();
    
    // For currencies like INR, EUR, GBP - symbol before number
    // For JPY, CNY - symbol after number
    if (currency === 'JPY' || currency === 'CNY') {
      return `${formattedNumber}${symbol}`;
    }
    
    return `${symbol}${formattedNumber}`;
  };

  const getCurrencyInfo = () => {
    return EXCHANGE_RATES[currency];
  };

  const getAvailableCurrencies = () => {
    return Object.keys(EXCHANGE_RATES).map(code => ({
      code,
      ...EXCHANGE_RATES[code]
    }));
  };

  const value = {
    currency,
    setCurrency,
    convertPrice,
    formatPrice,
    getCurrencyInfo,
    getAvailableCurrencies,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};
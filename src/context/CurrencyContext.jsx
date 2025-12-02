import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Currency conversion rates (base: INR)
const EXCHANGE_RATES = {
  INR: { rate: 1, symbol: '₹', name: 'Indian Rupee', country: 'India' },
  USD: { rate: 0.012, symbol: '$', name: 'US Dollar', country: 'United States' },
  EUR: { rate: 0.011, symbol: '€', name: 'Euro', country: 'European Union' },
  GBP: { rate: 0.0095, symbol: '£', name: 'British Pound', country: 'United Kingdom' },
  JPY: { rate: 1.80, symbol: '¥', name: 'Japanese Yen', country: 'Japan' },
  AUD: { rate: 0.018, symbol: 'A$', name: 'Australian Dollar', country: 'Australia' },
  CAD: { rate: 0.016, symbol: 'C$', name: 'Canadian Dollar', country: 'Canada' },
  CNY: { rate: 0.087, symbol: '¥', name: 'Chinese Yuan', country: 'China' },
  AED: { rate: 0.044, symbol: 'د.إ', name: 'UAE Dirham', country: 'United Arab Emirates' },
  SGD: { rate: 0.016, symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    // Load currency from localStorage on initialization
    const savedCurrency = localStorage.getItem('selectedCurrency');
    return savedCurrency || 'INR';
  });

  // Save currency to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedCurrency', currency);
  }, [currency]);

  const convertPrice = (priceInINR) => {
    if (!priceInINR) return 0;
    const rate = EXCHANGE_RATES[currency].rate;
    return Math.round(priceInINR * rate);
  };

  const formatPrice = (priceInINR) => {
    const convertedPrice = convertPrice(priceInINR);
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
import { useState, useEffect } from 'react';

const currencies = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.85 },
  GBP: { symbol: '£', rate: 0.73 },
  INR: { symbol: '₹', rate: 83 },
  JPY: { symbol: '¥', rate: 150 }
};

function CurrencySelector() {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  useEffect(() => {
    const saved = localStorage.getItem('currency') || 'USD';
    setSelectedCurrency(saved);
  }, []);

  const handleCurrencyChange = (currency) => {
    setSelectedCurrency(currency);
    localStorage.setItem('currency', currency);
    window.dispatchEvent(new CustomEvent('currencyChange', { detail: currency }));
  };

  return (
    <select
      value={selectedCurrency}
      onChange={(e) => handleCurrencyChange(e.target.value)}
      className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
    >
      {Object.keys(currencies).map(currency => (
        <option key={currency} value={currency}>
          {currencies[currency].symbol} {currency}
        </option>
      ))}
    </select>
  );
}

export function convertPrice(usdPrice, toCurrency = 'USD') {
  return usdPrice * currencies[toCurrency].rate;
}

export function formatPrice(usdPrice, currency = 'USD') {
  const convertedPrice = convertPrice(usdPrice, currency);
  return `${currencies[currency].symbol}${convertedPrice.toFixed(2)}`;
}

export default CurrencySelector;
// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_DELAY: 5000,
  MAX_RETRIES: 3,
  REFRESH_INTERVAL: 10000,
};

export const BINANCE_API_URL = 'https://api.binance.com/api/v3';

export const API_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

export const DEFAULT_DISPLAY_COUNT = 9;

// Map of crypto symbols to their names, images, and circulating supply
export const CRYPTO_INFO: Record<string, { name: string; image: string; circulatingSupply: number }> = {
  'BTC': { 
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    circulatingSupply: 19600000
  },
  'ETH': { 
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    circulatingSupply: 120000000
  },
  'BNB': { 
    name: 'Binance Coin',
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    circulatingSupply: 153856150
  },
  'SOL': { 
    name: 'Solana',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    circulatingSupply: 424666137
  },
  'XRP': { 
    name: 'XRP',
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    circulatingSupply: 45404028640
  },
  'ADA': { 
    name: 'Cardano',
    image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    circulatingSupply: 35045020830
  },
  'DOGE': { 
    name: 'Dogecoin',
    image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    circulatingSupply: 143161976384
  },
  'DOT': { 
    name: 'Polkadot',
    image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    circulatingSupply: 1274258350
  },
  'MATIC': { 
    name: 'Polygon',
    image: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
    circulatingSupply: 9319469069
  },
  'AVAX': { 
    name: 'Avalanche',
    image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    circulatingSupply: 363532436
  },
  'LINK': {
    name: 'Chainlink',
    image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    circulatingSupply: 556849971
  },
  'UNI': {
    name: 'Uniswap',
    image: 'https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png',
    circulatingSupply: 753766667
  },
  'ATOM': {
    name: 'Cosmos',
    image: 'https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png',
    circulatingSupply: 382335221
  },
  'LTC': {
    name: 'Litecoin',
    image: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
    circulatingSupply: 73638701
  },
  'TRX': {
    name: 'TRON',
    image: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png',
    circulatingSupply: 88735727668
  }
};
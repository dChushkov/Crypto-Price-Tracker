# Crypto Price Tracker

A real-time cryptocurrency price tracking application built with Vue 3, TypeScript, and Tailwind CSS. The application fetches live data from the Binance API and provides an interactive interface for monitoring cryptocurrency prices, market caps, and trends.

## Features

- 🚀 Real-time price updates
- 📊 Interactive price charts with multiple timeframes (1H, 24H, 7D, 30D)
- 🌓 Dark/Light mode support
- 📱 Fully responsive design
- 📈 Market overview with total market cap
- 🏆 Top gainers and losers tracking
- ⚡ Fast and efficient data updates
- 🔄 Automatic retry mechanism for API failures

## Technologies Used

- Vue 3 with Composition API
- TypeScript
- Tailwind CSS
- Chart.js with vue-chartjs
- Binance API
- Vite

## Live Demo

Check out the live demo: [Crypto Price Tracker](https://glittering-unicorn-53eb17.netlify.app)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/dChushkov/Crypto-Price-Tracker.git
```

2. Navigate to the project directory
```bash
cd Crypto-Price-Tracker
```

3. Install dependencies
```bash
npm install
```

4. Start the development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

## Project Structure

```
src/
├── components/         # Vue components
├── types/             # TypeScript type definitions
├── config/            # Configuration files
├── assets/           # Static assets
└── App.vue           # Root component
```

## Features in Detail

### Real-time Price Updates
- Automatic price updates every 10 seconds
- Fallback mechanism with retry logic for API failures

### Interactive Charts
- Multiple timeframe options
- Smooth animations
- Responsive design
- Price tooltips

### Market Overview
- Total market capitalization
- Top gainers and losers in the last 24 hours
- Individual coin statistics

### User Interface
- Clean and modern design
- Dark/Light mode toggle
- Responsive layout for all screen sizes
- Smooth transitions and animations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

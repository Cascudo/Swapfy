import CoinGecko from 'coingecko-api';

const CoinGeckoClient = new CoinGecko();

export const fetchMarketData = async (symbol: string) => {
    try {
        const response = await CoinGeckoClient.simple.price({
            ids: symbol.toLowerCase(),
            vs_currencies: 'usdt',
        });
        return response?.data;
    } catch (error) {
        console.error('Error fetching data from CoinGecko:', error);
        return null;
    }
};

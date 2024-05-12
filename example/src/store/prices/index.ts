import aapl_prices from "./aapl_prices.json";
import msft_prices from "./msft_prices.json";
import nvda_prices from "./nvda_prices.json";
import unity_prices from "./unity_prices.json";

export const priceMap = {
  msft: [...msft_prices.results]
    .reverse()
    .map<[number, number]>((r) => [new Date(r.date).getTime(), r.close]),
  aapl: [...aapl_prices.results]
    .reverse()
    .map<[number, number]>((r) => [new Date(r.date).getTime(), r.close]),
  nvda: [...nvda_prices.results]
    .reverse()
    .map<[number, number]>((r) => [new Date(r.date).getTime(), r.close]),
  unity: [...unity_prices.results]
    .reverse()
    .map<[number, number]>((r) => [new Date(r.date).getTime(), r.close]),
};

export interface CompetitorConfig {
  id: string;
  name: string;
  url: string;
  category: string;
  selectors: { price: string; promo?: string };
}
export interface CompetitorState {
  id: string;
  name: string;
  url: string;
  currentPrice: number;
  prevPrice: number;
  promo: string | null;
  lastChecked: string;
}
export interface PriceAlert {
  competitor: string;
  type: "price_drop" | "price_hike" | "promo";
  oldPrice?: number;
  newPrice?: number;
  promoText?: string;
  url: string;
}

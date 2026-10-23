import * as cheerio from "cheerio";
import { CompetitorConfig } from "./types.js";

export async function scrapeCompetitor(target: CompetitorConfig) {
  try {
    const res = await fetch(target.url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    if (!res.ok) return { price: null, promo: null };
    const html = await res.text();
    const $ = cheerio.load(html);
    const raw = $(target.selectors.price).first().text();
    const price = parseFloat(raw.replace(/[^0-9,.]/g, "").replace(",", "."));
    const promo = target.selectors.promo ? $(target.selectors.promo).first().text().trim() || null : null;
    return { price: isNaN(price) ? 49 : price, promo };
  } catch {
    return { price: 49, promo: null };
  }
}

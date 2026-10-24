import * as cheerio from "cheerio";
import { CompetitorConfig } from "./types.js";

export async function scrapeCompetitor(target: CompetitorConfig) {
  try {
    const res = await fetch(target.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "fr-FR,fr;q=0.9,ar;q=0.8"
      }
    });

    if (!res.ok) {
      console.warn(`[HTTP ${res.status}] Impossible d'accéder à ${target.name}`);
      return { price: null, promo: null };
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    let detectedPrice: number | null = null;
    if (target.selectors.price) {
      const priceText = $(target.selectors.price).first().text();
      const cleaned = priceText.replace(/\s+/g, "").match(/(\d[\d.,]*)/);
      if (cleaned) {
        detectedPrice = parseFloat(cleaned[1].replace(",", "."));
      }
    }

    let promoText: string | null = null;
    const promoKeywords = ["offre", "remise", "promotion", "notaire", "offert", "lancement", "facilité", "réduction"];
    const textToCheck = target.selectors.promo ? $(target.selectors.promo).text() : $("body").text();
    
    for (const kw of promoKeywords) {
      const regex = new RegExp(`([^.!?\\n]{0,50}${kw}[^.!?\\n]{0,60})`, "i");
      const match = textToCheck.match(regex);
      if (match) {
        promoText = match[0].trim().replace(/\s+/g, " ");
        break;
      }
    }

    return {
      price: detectedPrice,
      promo: promoText
    };
  } catch (error) {
    console.error(`Erreur lors du scan de ${target.name}:`, error);
    return { price: null, promo: null };
  }
}

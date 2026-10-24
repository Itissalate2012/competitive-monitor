import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { CompetitorConfig, CompetitorState, PriceAlert } from "./types.js";
import { scrapeCompetitor } from "./scraper.js";
import { sendSlackAlert } from "./notifier.js";

dotenv.config();
const STATE_FILE = path.join(process.cwd(), "state.json");

const TARGETS: CompetitorConfig[] = [
  {
    id: "allali",
    name: "Groupe Allali Immobilier",
    url: "https://www.allali.ma/",
    category: "Immobilier Neuf",
    selectors: {
      price: ".price, .prix, [class*='price']",
      promo: ".banner, .alert, .promo, [class*='promo'], [class*='offre']"
    }
  },
  {
    id: "mfadel",
    name: "Groupe Mfadel",
    url: "https://groupemfadel.com/",
    category: "Immobilier Haut Standing",
    selectors: {
      price: ".prix, .price, .starting-price",
      promo: ".home-banner, .slider, [class*='offer'], [class*='promo']"
    }
  },
  {
    id: "klk",
    name: "KLK Khayatey Living",
    url: "https://klk.ma/",
    category: "Résidentiel & Projets",
    selectors: {
      price: ".price, [class*='prix']",
      promo: ".hero, .banner, .badge, [class*='actu']"
    }
  },
  {
    id: "kettani",
    name: "Kettani Immobilier",
    url: "https://www.kettani-immobilier.com/",
    category: "Immobilier Résidentiel",
    selectors: {
      price: ".prix, .price, [class*='price']",
      promo: ".banniere, .slider, .carousel, [class*='promo']"
    }
  }
];

export async function runWorkflow() {
  console.log("🏢 Lancement de la veille concurrentielle immobilière (Maroc)...");
  let history: Record<string, CompetitorState> = {};
  if (fs.existsSync(STATE_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8").replace(/^\uFEFF/, ''));
    } catch {
      history = {};
    }
  }

  const alerts: PriceAlert[] = [];

  for (const target of TARGETS) {
    console.log(`🔎 Analyse de : ${target.name}...`);
    const { price, promo } = await scrapeCompetitor(target);
    const prev = history[target.id];

    if (price && prev && prev.currentPrice && price !== prev.currentPrice) {
      alerts.push({
        competitor: target.name,
        type: price < prev.currentPrice ? "price_drop" : "price_hike",
        oldPrice: prev.currentPrice,
        newPrice: price,
        url: target.url
      });
    }

    if (promo && (!prev || promo !== prev.promo)) {
      alerts.push({
        competitor: target.name,
        type: "promo",
        promoText: promo,
        url: target.url
      });
    }

    history[target.id] = {
      id: target.id,
      name: target.name,
      url: target.url,
      currentPrice: price ?? (prev?.currentPrice ?? 0),
      prevPrice: prev ? prev.currentPrice : (price ?? 0),
      promo: promo ?? prev?.promo ?? null,
      lastChecked: new Date().toISOString()
    };
  }

  fs.writeFileSync(STATE_FILE, JSON.stringify(history, null, 2));

  if (alerts.length > 0) {
    console.log(`⚡ ${alerts.length} alerte(s) commerciale(s) détectée(s) !`);
    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackAlert(process.env.SLACK_WEBHOOK_URL, alerts);
    }
  } else {
    console.log("✅ Scan terminé : aucune nouvelle offre détectée.");
  }
}

runWorkflow();

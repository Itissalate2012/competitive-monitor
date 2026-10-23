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
    id: "c1",
    name: "Northwind Cloud",
    url: "https://example.com",
    category: "SaaS",
    selectors: { price: ".price" }
  }
];

export async function runWorkflow() {
  console.log("🔍 Lancement du scan de veille...");
  let history: Record<string, CompetitorState> = {};
  if (fs.existsSync(STATE_FILE)) {
    history = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
  }

  const alerts: PriceAlert[] = [];

  for (const target of TARGETS) {
    const { price, promo } = await scrapeCompetitor(target);
    const prev = history[target.id];

    if (price !== null && prev && price !== prev.currentPrice) {
      alerts.push({
        competitor: target.name,
        type: price < prev.currentPrice ? "price_drop" : "price_hike",
        oldPrice: prev.currentPrice,
        newPrice: price,
        url: target.url
      });
    }

    history[target.id] = {
      id: target.id,
      name: target.name,
      url: target.url,
      currentPrice: price ?? 49,
      prevPrice: prev ? prev.currentPrice : (price ?? 49),
      promo,
      lastChecked: new Date().toISOString()
    };
  }

  fs.writeFileSync(STATE_FILE, JSON.stringify(history, null, 2));

  if (alerts.length > 0) {
    console.log(`⚡ ${alerts.length} alerte(s) détectée(s) !`);
    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackAlert(process.env.SLACK_WEBHOOK_URL, alerts);
    }
  } else {
    console.log("✅ Scan terminé avec succès : aucun changement détecté.");
  }
}

runWorkflow();

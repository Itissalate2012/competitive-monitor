import { PriceAlert } from "./types.js";

export async function sendSlackAlert(webhookUrl: string, alerts: PriceAlert[]) {
  if (!webhookUrl || alerts.length === 0) return;
  console.log(`[Slack] Envoi de ${alerts.length} alerte(s)...`);
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `🚨 Veille : ${alerts.length} changement(s) de prix détecté(s) !`
    })
  });
}

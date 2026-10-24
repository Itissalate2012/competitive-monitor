import { PriceAlert } from "./types.js";

export async function sendSlackAlert(webhookUrl: string, alerts: PriceAlert[]) {
  if (!webhookUrl || alerts.length === 0) return;
  console.log(`[Slack] Envoi de ${alerts.length} alerte(s) immobilière(s)...`);

  const details = alerts.map((a) => {
    if (a.type === "promo") {
      return `📢 *${a.competitor}* :\n> 🏷️ _"${a.promoText}"_\n> 🔗 <${a.url}|Voir le site>`;
    }
    const diff = a.oldPrice && a.newPrice ? Math.abs(a.newPrice - a.oldPrice) : 0;
    const arrow = a.type === "price_drop" ? "📉 *Baisse de prix*" : "📈 *Hausse de prix*";
    return `🏢 *${a.competitor}* :\n> ${arrow} : ~${a.oldPrice} DH~ ➔ *${a.newPrice} DH* (${diff} DH)\n> 🔗 <${a.url}|Consulter le projet>`;
  }).join("\n\n");

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `🔔 *Veille Immobilière Maroc — Nouvelles alertes :*\n\n${details}`
    })
  });
}

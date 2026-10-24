import React, { useMemo, useState } from "react";
import {
  Radar, Bell, TrendingDown, TrendingUp, Tag, Sparkles, Check,
  Globe, Search, ArrowDownRight, ArrowUpRight, Minus, ExternalLink,
  Clock, MessageSquare, Mail, History
} from "lucide-react";

export type Competitor = {
  id: string;
  name: string;
  domain: string;
  category: string;
  tracked: boolean;
  price: number;
  prevPrice: number;
  promo: string | null;
};

export type Schedule = {
  frequency: "hourly" | "daily" | "weekly";
  hour: number;
  weekday: string;
  channels: { email: boolean; slack: boolean; digest: boolean };
  alertOn: { price: boolean; promo: boolean; newOffer: boolean };
};

const SEED_MOROCCO: Competitor[] = [
  { id: "allali", name: "Groupe Allali Immobilier", domain: "allali.ma", category: "Immobilier Neuf", tracked: true, price: 850000, prevPrice: 850000, promo: "Frais de notaire offerts" },
  { id: "mfadel", name: "Groupe Mfadel", domain: "groupemfadel.com", category: "Haut Standing", tracked: true, price: 1650000, prevPrice: 1750000, promo: "Offre Lancement -5%" },
  { id: "klk", name: "KLK Khayatey Living", domain: "klk.ma", category: "Résidentiel", tracked: true, price: 890000, prevPrice: 950000, promo: "Cuisine équipée offerte" },
  { id: "kettani", name: "Kettani Immobilier", domain: "kettani-immobilier.com", category: "Résidentiel", tracked: true, price: 1200000, prevPrice: 1200000, promo: "Nouveau Projet Palmier" },
];

export default function App() {
  const [competitors, setCompetitors] = useState<Competitor[]>(SEED_MOROCCO);
  const [schedule, setSchedule] = useState<Schedule>({
    frequency: "daily",
    hour: 8,
    weekday: "monday",
    channels: { email: true, slack: true, digest: false },
    alertOn: { price: true, promo: true, newOffer: true },
  });

  const tracked = competitors.filter(c => c.tracked);
  const priceDrops = tracked.filter(c => c.price < c.prevPrice).length;
  const promos = tracked.filter(c => c.promo).length;

  const toggle = (id: string) =>
    setCompetitors(prev => prev.map(c => (c.id === id ? { ...c, tracked: !c.tracked } : c)));

  const nextRun = "Chaque jour à 08:00 UTC (Automatique)";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <header className="border-b border-teal-900/10 bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-900 text-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/20 ring-1 ring-teal-300/40">
                <Radar className="h-6 w-6 text-teal-200" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Veille Immobilière Maroc
                </h1>
                <p className="text-sm text-teal-100/80">
                  Surveillance automatisée des prix, remises & offres promoteurs.
                </p>
              </div>
            </div>
            <div className="inline-flex items-center rounded-full border border-teal-300/40 bg-teal-400/20 px-3.5 py-1.5 text-xs font-semibold text-teal-100">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              {tracked.length} promoteurs sous surveillance
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={<TrendingDown className="h-5 w-5" />} label="Baisses de prix constatées" value={priceDrops} tone="emerald" />
          <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Promoteurs actifs suivis" value={tracked.length} tone="teal" />
          <StatCard icon={<Tag className="h-5 w-5" />} label="Offres & Promos en cours" value={promos} tone="amber" />
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-6">
            <CompetitorPicker competitors={competitors} onToggle={toggle} />
            <ActivityFeed />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <ScheduleBuilder schedule={schedule} onChange={setSchedule} nextRun={nextRun} />
            <div className="rounded-2xl border border-teal-900/10 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 font-semibold text-slate-900">
                <Bell className="h-4 w-4 text-teal-700" />
                Statut de l'automatisation
              </div>
              <p className="text-xs text-slate-500">Robot GitHub Actions actif 24h/24 dans le Cloud.</p>
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex justify-between text-slate-600"><span>Cibles :</span><span className="font-semibold text-slate-900">{tracked.length} promoteurs</span></div>
                <div className="flex justify-between text-slate-600"><span>Fréquence :</span><span className="font-semibold text-slate-900">Quotidien (08h00 UTC)</span></div>
                <div className="flex justify-between text-slate-600"><span>Canal d'alerte :</span><span className="font-semibold text-emerald-700">Slack (#veille-immo) Connecté</span></div>
              </div>
              <div className="pt-2">
                <div className="w-full bg-teal-800 text-white font-medium py-2.5 rounded-xl text-center text-xs flex items-center justify-center">
                  <Check className="mr-2 h-4 w-4" /> Surveillance en cours
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CompetitorPicker({ competitors, onToggle }: { competitors: Competitor[]; onToggle: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    return competitors.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.domain.toLowerCase().includes(search.toLowerCase()));
  }, [competitors, search]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Promoteurs surveillés</h2>
          <p className="text-xs text-slate-500">Activez ou suspendez le tracking en temps réel sur chaque acteur.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Rechercher..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {filtered.map(c => {
          const diff = c.price - c.prevPrice;
          return (
            <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50/70 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-200">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">{c.name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{c.category}</span>
                  </div>
                  <a href={`https://${c.domain}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-teal-700 hover:underline mt-0.5">
                    {c.domain} <ExternalLink className="h-3 w-3" />
                  </a>
                  {c.promo && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 w-fit">
                      <Tag className="h-3.5 w-3.5" />
                      <span>{c.promo}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6">
                <div className="text-right">
                  <div className="text-base font-bold tabular-nums text-slate-900">
                    {c.price.toLocaleString("fr-FR")} DH<span className="text-xs font-normal text-slate-500"> / départ</span>
                  </div>
                  <div className="text-xs">
                    {diff < 0 ? (
                      <span className="text-emerald-600 font-medium flex items-center justify-end"><ArrowDownRight className="h-3.5 w-3.5" />-{Math.abs(diff).toLocaleString("fr-FR")} DH</span>
                    ) : diff > 0 ? (
                      <span className="text-rose-600 font-medium flex items-center justify-end"><ArrowUpRight className="h-3.5 w-3.5" />+{diff.toLocaleString("fr-FR")} DH</span>
                    ) : (
                      <span className="text-slate-400 flex items-center justify-end"><Minus className="h-3.5 w-3.5" /> Stable</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggle(c.id)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${c.tracked ? "bg-teal-700" : "bg-slate-200"}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ${c.tracked ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScheduleBuilder({ schedule, onChange }: { schedule: Schedule; onChange: (s: Schedule) => void; nextRun: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <Clock className="h-4 w-4 text-teal-700" /> Planification du scan
        </h3>
        <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs text-teal-800 font-semibold">24h/24 Cloud</span>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Fréquence du robot</label>
        <div className="grid grid-cols-3 gap-2">
          {(["hourly", "daily", "weekly"] as const).map(freq => (
            <button
              key={freq}
              type="button"
              onClick={() => onChange({ ...schedule, frequency: freq })}
              className={`rounded-xl border py-2 text-xs font-medium capitalize transition-all ${
                schedule.frequency === freq ? "border-teal-700 bg-teal-50 font-semibold text-teal-900 ring-1 ring-teal-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {freq === "hourly" ? "Horaire" : freq === "daily" ? "Quotidien" : "Hebdo"}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Canal d'alerte</label>
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-2"><MessageSquare className="h-4 w-4 text-teal-700" /> Slack (#veille-immo)</span>
            <span className="font-semibold text-emerald-700">Actif</span>
          </div>
          <div className="flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> Rapport Email (PDF)</span>
            <span className="text-slate-400">Optionnel</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityFeed() {
  const events = [
    { id: "1", name: "Groupe Allali", type: "promo", title: "Offre Spéciale détectée", desc: "Campagne repérée : 'Frais de notaire offerts sur les 5 premières réservations'", time: "Il y a 35 min" },
    { id: "2", name: "KLK Khayatey", type: "drop", title: "Baisse prix de départ", desc: "Nouveau lot disponible à partir de 890 000 DH (au lieu de 950 000 DH)", time: "Ce matin à 08:00" },
    { id: "3", name: "Kettani Immobilier", type: "promo", title: "Nouveau Projet lancé", desc: "Projet 'Résidence Palmier' ajouté au catalogue en ligne", time: "Hier à 18:30" }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900">
          <History className="h-4 w-4 text-teal-700" /> Flux des alertes récentes
        </h3>
        <span className="rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-xs text-teal-800 font-semibold">Direct</span>
      </div>
      <div className="space-y-3">
        {events.map(e => (
          <div key={e.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-xs text-slate-900">{e.name}</span>
              <span className="text-[11px] text-slate-400">{e.time}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-teal-900">
              {e.type === "promo" ? <Tag className="h-3.5 w-3.5 text-amber-600" /> : <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />}
              <span>{e.title}</span>
            </div>
            <p className="mt-1 text-xs text-slate-600">{e.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "emerald" | "teal" | "amber" }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    teal: "bg-teal-50 text-teal-800 ring-teal-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

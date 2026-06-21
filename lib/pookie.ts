import type { Transaction } from "./mock";

export type PookieMood = "sleeping" | "happy" | "proud" | "hungry" | "sad" | "celebrate";

export type Insight = {
  id: string;
  emoji: string;
  text: string;
  action: string;
  reward: number; // direct USD
};

export function computeMood(data: {
  savedThisMonth: number;
  streak: number;
  hoursSinceLastOpen: number;
}): PookieMood {
  if (data.hoursSinceLastOpen > 48) return "hungry";
  if (data.streak >= 7) return "proud";
  if (data.savedThisMonth >= 150) return "happy";
  if (data.savedThisMonth < 10) return "sad";
  return "happy";
}

export function getInsights(txns: Transaction[]): Insight[] {
  const out: Insight[] = [];

  const coffees = txns.filter((t) => t.category === "coffee");
  if (coffees.length > 2) {
    const weekly = coffees.reduce((s, t) => s + t.amount, 0);
    const yearly = Math.round(weekly * 52);
    out.push({
      id: "coffee",
      emoji: "☕",
      text: `${coffees.length}x coffees this week · $${weekly.toFixed(0)}/wk = $${yearly}/year. That's a flight to Europe.`,
      action: "Try no-spend Friday",
      reward: 1.50,
    });
  }

  const streaming = txns.filter((t) => t.category === "streaming" && t.recurring);
  if (streaming.length > 1) {
    const monthly = streaming.reduce((s, t) => s + t.amount, 0);
    const yearly  = Math.round(monthly * 12);
    out.push({
      id: "streaming",
      emoji: "📺",
      text: `${streaming.length} streaming subscriptions · $${monthly.toFixed(0)}/mo = $${yearly}/year. Still watching all of them? 🤔`,
      action: "Cancel one now",
      reward: 2.50,
    });
  }

  const shopping = txns.filter((t) => t.category === "shopping");
  if (shopping.length >= 2) {
    const total  = shopping.reduce((s, t) => s + t.amount, 0);
    const yearly = Math.round(total * 12);
    out.push({
      id: "shopping",
      emoji: "🛍️",
      text: `$${total.toFixed(0)} on fashion this week. At this rate: $${yearly}/year. 24h cooling-off rule changes everything.`,
      action: "Start cooling off",
      reward: 1.25,
    });
  }

  return out.slice(0, 3);
}

export function getTierIndex(totalSaved: number): number {
  if (totalSaved >= 2000) return 3;
  if (totalSaved >= 500)  return 2;
  if (totalSaved >= 100)  return 1;
  return 0;
}

export const TIERS = [
  { name: "Bronze",  emoji: "🥉", color: "#CD7F32", minSaved: 0,    cashReward: 0,   unlocks: "basic furniture" },
  { name: "Silver",  emoji: "🥈", color: "#A8A8A8", minSaved: 100,  cashReward: 2,   unlocks: "fairy lights + decor" },
  { name: "Gold",    emoji: "🥇", color: "#EFB931", minSaved: 500,  cashReward: 10,  unlocks: "premium themes" },
  { name: "Diamond", emoji: "💎", color: "#87CEEB", minSaved: 2000, cashReward: 25,  unlocks: "exclusive room" },
];

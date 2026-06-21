export type Category = "coffee" | "food" | "shopping" | "streaming" | "transport" | "other";

export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  category: Category;
  amount: number;
  recurring?: boolean;
};

export const transactions: Transaction[] = [
  { id: "t1",  date: "2026-06-21", merchant: "Starbucks",     category: "coffee",    amount: 5.50 },
  { id: "t2",  date: "2026-06-21", merchant: "Netflix",        category: "streaming", amount: 15.99, recurring: true },
  { id: "t3",  date: "2026-06-20", merchant: "Zara",           category: "shopping",  amount: 34.00 },
  { id: "t4",  date: "2026-06-20", merchant: "Starbucks",      category: "coffee",    amount: 5.50 },
  { id: "t5",  date: "2026-06-19", merchant: "DoorDash",       category: "food",      amount: 18.50 },
  { id: "t6",  date: "2026-06-19", merchant: "Spotify",        category: "streaming", amount: 9.99,  recurring: true },
  { id: "t7",  date: "2026-06-18", merchant: "Starbucks",      category: "coffee",    amount: 5.50 },
  { id: "t8",  date: "2026-06-18", merchant: "Trader Joe's",   category: "food",      amount: 28.00 },
  { id: "t9",  date: "2026-06-17", merchant: "H&M",            category: "shopping",  amount: 42.00 },
  { id: "t10", date: "2026-06-17", merchant: "Uber",           category: "transport", amount: 14.00 },
  { id: "t11", date: "2026-06-16", merchant: "Blue Bottle",    category: "coffee",    amount: 6.00 },
  { id: "t12", date: "2026-06-15", merchant: "Disney+",        category: "streaming", amount: 4.99,  recurring: true },
  { id: "t13", date: "2026-06-15", merchant: "ASOS",           category: "shopping",  amount: 89.00 },
  { id: "t14", date: "2026-06-14", merchant: "Uber Eats",      category: "food",      amount: 22.00 },
  { id: "t15", date: "2026-06-13", merchant: "HBO Max",        category: "streaming", amount: 5.99,  recurring: true },
];

export type MissionState = "done" | "active" | "locked";

export type Mission = {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  rewardBerries: number;
  state: MissionState;
};

export const MISSIONS: Mission[] = [
  { id: "first_save",   title: "First Save",         desc: "Save any amount for the first time",      emoji: "🐣", rewardBerries: 200,  state: "done"   },
  { id: "streak_3",     title: "3-Day Streak",        desc: "Open the app 3 days in a row",            emoji: "🔥", rewardBerries: 300,  state: "done"   },
  { id: "streak_7",     title: "7-Day Streak",        desc: "One full week of saving in a row",        emoji: "💫", rewardBerries: 400,  state: "active" },
  { id: "first_budget", title: "Set a Budget",        desc: "Create your first weekly spending limit", emoji: "📊", rewardBerries: 320,  state: "locked" },
  { id: "cancel_sub",   title: "Cancel a Sub",        desc: "Pookie spotted something unused",         emoji: "✂️", rewardBerries: 400,  state: "locked" },
  { id: "reach_goal",   title: "Hit Monthly Goal",    desc: "Save $300 in a single month",             emoji: "🏆", rewardBerries: 1000, state: "locked" },
  { id: "invest",       title: "First Investment",    desc: "Start investing from just $10",           emoji: "🚀", rewardBerries: 2000, state: "locked" },
];

export const WEEK_SPEND      = [34, 28, 42, 31, 26, 22, 31];
export const LAST_WEEK_SPEND = [38, 33, 45, 36, 30, 25, 35];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

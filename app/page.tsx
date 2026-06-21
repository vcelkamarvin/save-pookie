"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PookieChar } from "@/components/Pookie";
import { computeMood, getInsights, TIERS, getTierIndex, type PookieMood, type Insight } from "@/lib/pookie";
import { transactions, MISSIONS, WEEK_SPEND, LAST_WEEK_SPEND, DAYS, type Mission } from "@/lib/mock";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "splash" | "name" | "home" | "scan" | "spend" | "accounts" | "earn" | "room" | "journey" | "profile" | "plus";

type Challenge = {
  id: string; emoji: string; title: string; desc: string;
  unlockLabel: string; unlockId: string; duration: string;
  social: string; joined: boolean; completed: boolean;
};

type RoomItem = {
  id: string; name: string; emoji: string;
  base: boolean; challengeId: string | null;
};

const ROOM_ITEMS: RoomItem[] = [
  { id: "pink_rug",     name: "Pink rug",       emoji: "🪷", base: true,  challengeId: null           },
  { id: "moon_lamp",    name: "Moon lamp",       emoji: "🌙", base: true,  challengeId: null           },
  { id: "plant",        name: "Plant",           emoji: "🪴", base: true,  challengeId: null           },
  { id: "candle",       name: "Cozy candle",     emoji: "🕯️", base: false, challengeId: "no_spend_fri" },
  { id: "fairy_lights", name: "Fairy lights",    emoji: "✨", base: false, challengeId: "cooling_off"  },
  { id: "coffee_st",    name: "Coffee station",  emoji: "☕", base: false, challengeId: "home_coffee"  },
  { id: "gold_lamp",    name: "Gold lamp",       emoji: "💛", base: false, challengeId: "cancel_sub"   },
  { id: "mini_fridge",  name: "Mini fridge",     emoji: "🧊", base: false, challengeId: "no_delivery"  },
  { id: "poster",       name: "Kawaii poster",   emoji: "🎀", base: false, challengeId: "budget_set"   },
  { id: "vanity",       name: "Vanity mirror",   emoji: "🪞", base: false, challengeId: "save_50"      },
  { id: "sky_window",   name: "Sky window",      emoji: "🌅", base: false, challengeId: "week_streak"  },
  { id: "cloud_rug",    name: "Cloud rug",       emoji: "☁️", base: false, challengeId: "no_delivery"  },
];

const CHALLENGES_INIT: Challenge[] = [
  { id: "no_spend_fri", emoji: "💪", title: "No-Spend Friday",      desc: "Zero impulse purchases this Friday",                  unlockLabel: "Cozy Candle 🕯️",   unlockId: "candle",       duration: "1 day",    social: "312 doing this",  joined: false, completed: false },
  { id: "cooling_off",  emoji: "🧊", title: "24h Cooling Off",      desc: "Wait 24h before any purchase over $20 — 3 wins",      unlockLabel: "Fairy Lights ✨",   unlockId: "fairy_lights", duration: "3 wins",   social: "841 doing this",  joined: true,  completed: false },
  { id: "home_coffee",  emoji: "☕", title: "Home Coffee Week",      desc: "No café runs for 7 days straight",                    unlockLabel: "Coffee Station ☕", unlockId: "coffee_st",    duration: "7 days",   social: "156 doing this",  joined: false, completed: false },
  { id: "cancel_sub",   emoji: "✂️", title: "Cut a Subscription",   desc: "Cancel 1 streaming service you barely use",           unlockLabel: "Gold Lamp 💛",      unlockId: "gold_lamp",    duration: "one-time", social: "204 doing this",  joined: false, completed: false },
  { id: "no_delivery",  emoji: "🛵", title: "No Delivery Week",      desc: "Cook at home for 7 days — no DoorDash or Uber Eats",  unlockLabel: "Mini Fridge 🧊",   unlockId: "mini_fridge",  duration: "7 days",   social: "98 doing this",   joined: false, completed: false },
  { id: "budget_set",   emoji: "📊", title: "Set a Budget",          desc: "Define your weekly spending limit",                   unlockLabel: "Kawaii Poster 🎀", unlockId: "poster",       duration: "one-time", social: "520 doing this",  joined: false, completed: false },
  { id: "save_50",      emoji: "🏆", title: "Save $50 This Month",   desc: "Reach $50 saved before end of month",                 unlockLabel: "Vanity Mirror 🪞", unlockId: "vanity",       duration: "30 days",  social: "187 doing this",  joined: false, completed: false },
  { id: "week_streak",  emoji: "🔥", title: "7-Day Check-In",        desc: "Open the app every day for 7 days",                   unlockLabel: "Sky Window 🌅",    unlockId: "sky_window",   duration: "7 days",   social: "631 doing this",  joined: false, completed: false },
];

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen]     = useState<Screen>("splash");
  const [cashEarned, setCash]   = useState(0.00);
  const [streak, setStreak]     = useState(7);
  const [saved, setSaved]       = useState(182);
  const [pookieName, setName]   = useState("Pookie");
  const [mood, setMood]         = useState<PookieMood>("happy");
  const [celebrating, setCel]   = useState(false);
  const [dismissed, setDism]    = useState<string[]>([]);
  const [missions, setMissions] = useState<Mission[]>(MISSIONS);
  const [challenges, setChals]  = useState<Challenge[]>(CHALLENGES_INIT);
  const [hasMounted, setMount]  = useState(false);

  useEffect(() => { setMount(true); }, []);

  useEffect(() => {
    if (celebrating) return;
    setMood(computeMood({ savedThisMonth: saved, streak, hoursSinceLastOpen: 2 }));
  }, [saved, streak, celebrating]);

  const celebrate = useCallback((earnUSD = 0) => {
    setCel(true); setMood("celebrate");
    if (earnUSD > 0) setCash((c) => +(c + earnUSD).toFixed(2));
    if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([30, 10, 30]);
    setTimeout(() => { setCel(false); setMood(computeMood({ savedThisMonth: saved, streak, hoursSinceLastOpen: 2 })); }, 1600);
  }, [saved, streak]);

  const acceptInsight = useCallback((id: string, reward: number) => { setDism((d) => [...d, id]); celebrate(reward); }, [celebrate]);
  const rejectInsight = useCallback((id: string) => setDism((d) => [...d, id]), []);

  const joinChallenge = useCallback((id: string) => {
    setChals((cs) => cs.map((c) => c.id === id ? { ...c, joined: !c.joined } : c));
  }, []);

  const completeChallenge = useCallback((id: string) => {
    setChals((cs) => cs.map((c) => c.id === id ? { ...c, joined: false, completed: true } : c));
    celebrate(0);
  }, [celebrate]);

  const completeMission = useCallback((id: string) => {
    setMissions((ms) => ms.map((m) =>
      m.id === id ? { ...m, state: "done" as const } :
      m.state === "locked" && ms.find((x) => x.id === id)?.state === "active" ? { ...m, state: "active" as const } : m
    ));
    celebrate(2.00);
  }, [celebrate]);

  const navToHome = useCallback(() => {
    setMount(false);
    setTimeout(() => { setMount(true); setScreen("home"); }, 50);
  }, []);

  const insights     = getInsights(transactions).filter((i) => !dismissed.includes(i.id));
  const completedIds = challenges.filter((c) => c.completed).map((c) => c.id);
  const activeChals  = challenges.filter((c) => c.joined);
  const hasNav       = !["splash", "name", "plus"].includes(screen);

  const roomOwned = (item: RoomItem) =>
    item.base || (item.challengeId !== null && completedIds.includes(item.challengeId));

  return (
    <main className="min-h-screen bg-[#C8C4BE] flex items-center justify-center sm:p-6">
      <div className="relative bg-cream w-full min-h-screen overflow-hidden font-display sm:w-[390px] sm:min-h-[844px] sm:rounded-[44px] sm:border-[10px] sm:border-white sm:shadow-2xl">
        <div className={`phone-scroll h-screen overflow-y-auto sm:h-[824px] ${hasNav ? "pb-28" : ""}`}>
          {screen === "splash"   && <Splash onNext={() => setScreen("name")} />}
          {screen === "name"     && <NameScreen value={pookieName} onChange={setName} onDone={navToHome} />}
          {screen === "home"     && (
            <HomeScreen
              cashEarned={cashEarned} streak={streak} saved={saved} mood={mood}
              pookieName={pookieName} insights={insights} wakeUp={hasMounted}
              activeChals={activeChals}
              onAcceptInsight={acceptInsight} onRejectInsight={rejectInsight}
              onNav={setScreen}
            />
          )}
          {screen === "scan"     && <ScanScreen onSaved={() => { setSaved((s) => s + 3); celebrate(0); setScreen("home"); }} onBack={() => setScreen("home")} />}
          {screen === "spend"    && <SpendScreen challenges={challenges} onJoin={joinChallenge} onComplete={completeChallenge} />}
          {screen === "accounts" && <AccountsScreen />}
          {screen === "earn"     && <EarnScreen cashEarned={cashEarned} onCelebrate={celebrate} onNav={setScreen} />}
          {screen === "room"     && <RoomScreen challenges={challenges} roomOwned={roomOwned} pookieName={pookieName} />}
          {screen === "journey"  && <JourneyScreen missions={missions} onComplete={completeMission} onBack={() => setScreen("home")} />}
          {screen === "profile"  && <ProfileScreen cashEarned={cashEarned} streak={streak} saved={saved} pookieName={pookieName} onBack={() => setScreen("home")} onNav={setScreen} />}
          {screen === "plus"     && <PlusScreen onBack={() => setScreen("earn")} onSubscribe={() => { celebrate(0); setScreen("earn"); }} />}
        </div>
        {hasNav && <BottomNav active={screen} onChange={setScreen} />}
      </div>
    </main>
  );
}

// ─── Splash ───────────────────────────────────────────────────────────────────

function Splash({ onNext }: { onNext: () => void }) {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col px-6 pt-16 pb-12 sm:min-h-[844px]">
      <motion.div className="flex justify-center" initial={{ opacity: 0, scale: 0.7, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, type: "spring", stiffness: 160, damping: 18 }}>
        <PookieChar mood="happy" size={220} />
      </motion.div>
      <div className="flex-1" />
      <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.55 }}>
        <h1 className="text-white text-[4rem] font-black leading-[0.87] tracking-tightest mb-4">
          Save More.<br />Live More. 🪐
        </h1>
        <p className="text-white/50 text-base font-medium leading-6 mb-10">
          Your money, but cuter. Pookie watches the wallet — you just live.
        </p>
        <PillButton onClick={onNext}>Get Started →</PillButton>
        <p className="mt-5 text-center text-white/25 text-xs font-medium">Your data stays yours. Always. 🔒</p>
      </motion.div>
    </div>
  );
}

// ─── Name ─────────────────────────────────────────────────────────────────────

function NameScreen({ value, onChange, onDone }: { value: string; onChange: (v: string) => void; onDone: () => void }) {
  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col px-6 pt-14 pb-10 sm:min-h-[844px]">
      <motion.div className="flex justify-center" initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, type: "spring", stiffness: 200, damping: 18 }}>
        <PookieChar mood="happy" size={160} />
      </motion.div>
      <motion.div className="mt-8 flex-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
        <h1 className="text-white text-[2.8rem] font-black leading-[0.93] tracking-tightest">
          {"What's your"}<br />{"Pookie's name?"} 🐱
        </h1>
        <p className="mt-4 text-white/45 text-base font-medium">Your financial bestie. She moves based on your habits.</p>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Pookie" className="mt-8 w-full bg-white/10 border border-white/20 rounded-[20px] px-5 py-4 text-white text-xl font-black placeholder:text-white/25 outline-none focus:border-pink transition-colors" />
      </motion.div>
      <div className="mt-8">
        <PillButton onClick={onDone} disabled={!value.trim()}>Meet {value || "Pookie"} ✨</PillButton>
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────

function HomeScreen({
  cashEarned, streak, saved, mood, pookieName, insights, wakeUp, activeChals,
  onAcceptInsight, onRejectInsight, onNav,
}: {
  cashEarned: number; streak: number; saved: number; mood: PookieMood;
  pookieName: string; insights: Insight[]; wakeUp: boolean; activeChals: Challenge[];
  onAcceptInsight: (id: string, r: number) => void;
  onRejectInsight: (id: string) => void;
  onNav: (s: Screen) => void;
}) {
  const safeSpend = 126;
  const moodPct   = Math.min(100, Math.round((saved / 300) * 100) + streak * 3);

  const moodReason: Record<PookieMood, string> = {
    sleeping:  "Inactive for a while — come back daily",
    happy:     `On a ${streak}-day streak 💖`,
    proud:     `$${saved} saved this month 🌟`,
    hungry:    "Missing you — open daily to keep her happy 🥺",
    sad:       "Wants to see more savings this month 💙",
    celebrate: "Celebrating your win! 🎉",
  };

  return (
    <div className="px-5 pt-6 space-y-3">
      {/* Top */}
      <div className="flex items-center justify-between">
        <Chip icon="🔥" label={`${streak} days`} dark />
        <button onClick={() => onNav("profile")} className="w-9 h-9 rounded-full bg-white border border-border shadow-card flex items-center justify-center text-base active-press">👤</button>
      </div>

      {/* Hero */}
      <motion.div className="rounded-[28px] p-6 bg-ink" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4 }}>
        <p className="text-white/40 text-[0.62rem] font-black uppercase tracking-widest mb-2">Safe to spend this week</p>
        <p className="text-white text-[4rem] font-black tracking-tightest leading-none">${safeSpend}</p>
        <p className="text-white/25 text-xs font-medium mt-2 mb-5">after bills, goals & regular expenses</p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white/7 rounded-[18px] p-3.5">
            <p className="text-white/35 text-[0.55rem] font-black uppercase tracking-widest">Total Saved</p>
            <p className="text-white text-xl font-black mt-0.5">${saved}</p>
          </div>
          <div className="bg-white/7 rounded-[18px] p-3.5">
            <p className="text-white/35 text-[0.55rem] font-black uppercase tracking-widest">Cash Earned</p>
            <p className="text-white text-xl font-black mt-0.5">${cashEarned.toFixed(2)}</p>
          </div>
        </div>
      </motion.div>

      {/* Pookie */}
      <motion.div className="bg-white rounded-[28px] shadow-card overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.4 }}>
        <div className="relative" style={{ height: 220 }}>
          <Image src="/assets/room.png" alt="room" fill className="object-cover" sizes="390px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <PookieChar mood={mood} size={110} wakeUp={wakeUp} />
          </div>
        </div>
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black text-ink">{pookieName} · {mood}</p>
            <p className="text-[0.65rem] text-muted font-medium">{moodReason[mood]}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-14 h-1.5 bg-pinkSoft rounded-full">
              <motion.div className="h-1.5 bg-pink rounded-full" animate={{ width: `${moodPct}%` }} transition={{ duration: 1 }} />
            </div>
            <span className="text-xs font-black text-pinkDeep">{moodPct}%</span>
          </div>
        </div>
      </motion.div>

      {/* Primary actions */}
      <motion.div className="grid grid-cols-2 gap-2.5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.4 }}>
        <motion.button
          className="bg-ink text-white rounded-[22px] py-4 flex flex-col items-center gap-1.5 active-press"
          onClick={() => onNav("scan")}
          whileTap={{ scale: 0.96 }}
        >
          <span className="text-2xl">📸</span>
          <span className="text-xs font-black">Scan Receipt</span>
        </motion.button>
        <motion.button
          className="bg-white border border-border shadow-card rounded-[22px] py-4 flex flex-col items-center gap-1.5 active-press"
          onClick={() => onNav("accounts")}
          whileTap={{ scale: 0.96 }}
        >
          <span className="text-2xl">🏦</span>
          <span className="text-xs font-black text-ink">My Accounts</span>
        </motion.button>
      </motion.div>

      {/* Active challenge */}
      {activeChals.length > 0 && (
        <motion.div className="bg-white rounded-[24px] shadow-card p-4 border border-pink/20" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
          <p className="text-[0.62rem] font-black uppercase tracking-widest text-pink mb-2">Active Challenge 💪</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeChals[0].emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-black text-ink">{activeChals[0].title}</p>
              <p className="text-[0.65rem] text-muted font-medium">Unlocks {activeChals[0].unlockLabel}</p>
            </div>
          </div>
          {activeChals.length > 1 && <p className="text-[0.62rem] text-muted font-semibold mt-2">+{activeChals.length - 1} more active</p>}
        </motion.div>
      )}

      {/* Insight */}
      {insights.length > 0 && (
        <motion.div className="bg-white rounded-[24px] shadow-card p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.4 }}>
          <p className="text-[0.62rem] font-black uppercase tracking-widest text-pink mb-3">🐱 Pookie spotted this</p>
          <InsightCard insight={insights[0]} onAccept={onAcceptInsight} onReject={onRejectInsight} />
        </motion.div>
      )}

      {/* Missions shortcut */}
      <motion.button className="w-full bg-white rounded-[24px] shadow-card p-5 text-left active-press" onClick={() => onNav("journey")} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.62rem] font-black uppercase tracking-widest text-muted mb-1">Missions 🎯</p>
            <p className="text-sm font-black text-ink">7-Day Streak · active</p>
            <div className="mt-2 h-1.5 w-32 bg-pinkSoft rounded-full">
              <div className="h-1.5 bg-pink rounded-full" style={{ width: "60%" }} />
            </div>
          </div>
          <span className="text-pink text-xl">→</span>
        </div>
      </motion.button>
    </div>
  );
}

// ─── Scan ─────────────────────────────────────────────────────────────────────

function ScanScreen({ onSaved, onBack }: { onSaved: () => void; onBack: () => void }) {
  const [scanned, setScanned] = useState(false);
  return (
    <div className="px-5 pt-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-9 h-9 bg-white rounded-full shadow-card flex items-center justify-center text-sm font-bold active-press">←</button>
        <ScreenHeader title="Scan Receipt 📸" />
      </div>
      {!scanned ? (
        <>
          <div className="rounded-[28px] overflow-hidden bg-ink relative" style={{ height: 300 }}>
            <div className="absolute inset-6 border-2 border-pink/60 rounded-2xl" />
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
              <p className="text-white/40 text-sm font-semibold">Point at your receipt</p>
              <div className="w-16 h-16 rounded-full border-2 border-pink/40 flex items-center justify-center text-2xl">📷</div>
            </div>
            <motion.div className="absolute left-8 right-8 h-0.5 bg-pink/50" animate={{ top: ["25%", "75%", "25%"] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
          </div>
          <div className="mt-4"><PillButton onClick={() => setScanned(true)}>Take Photo (demo)</PillButton></div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="bg-white rounded-[24px] shadow-card p-5 mb-3">
            <p className="text-[0.62rem] font-black uppercase tracking-widest text-muted mb-3">Pookie read this</p>
            <div className="space-y-2 font-mono text-sm text-ink/80">
              <div className="flex justify-between"><span>Starbucks latte</span><span className="font-bold">$5.50</span></div>
              <div className="flex justify-between"><span>Avocado toast</span><span className="font-bold">$8.90</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-black text-ink"><span>Total</span><span>$14.40</span></div>
            </div>
          </div>
          <div className="bg-pinkSoft rounded-[20px] p-4 flex items-start gap-3 mb-4">
            <Image src="/assets/pookie.svg" alt="Pookie" width={38} height={38} className="object-contain shrink-0" />
            <p className="text-sm font-bold text-ink leading-5">$14.40 at Starbucks 👀 — at this pace, $748/year just on café. Home coffee challenge?</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <PillButton onClick={onSaved}>Save ✓</PillButton>
            <SecondaryButton onClick={() => setScanned(false)}>Retry</SecondaryButton>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Spend ────────────────────────────────────────────────────────────────────

function SpendScreen({ challenges, onJoin, onComplete }: { challenges: Challenge[]; onJoin: (id: string) => void; onComplete: (id: string) => void }) {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [tab, setTab]       = useState<"overview" | "less">("overview");

  const thisWeek       = WEEK_SPEND.reduce((a, b) => a + b, 0);
  const lastWeek       = LAST_WEEK_SPEND.reduce((a, b) => a + b, 0);
  const thisMonth      = 892;
  const trendPct       = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
  const max            = Math.max(...WEEK_SPEND);
  const recurring      = transactions.filter((t) => t.recurring);
  const recurringTotal = recurring.reduce((s, t) => s + t.amount, 0);
  const display        = period === "week" ? thisWeek : thisMonth;

  const coffeeWk   = transactions.filter((t) => t.category === "coffee").reduce((s, t) => s + t.amount, 0);
  const shoppingWk = transactions.filter((t) => t.category === "shopping").reduce((s, t) => s + t.amount, 0);
  const foodWk     = transactions.filter((t) => t.category === "food").reduce((s, t) => s + t.amount, 0);

  const habits = [
    { emoji: "☕", label: "Coffee",           amt: coffeeWk,       period: "wk" as const, yearly: Math.round(coffeeWk * 52),       sev: "HIGH", col: "#E24B4A", tip: "Try 2x/week max"     },
    { emoji: "📺", label: "Streaming stack", amt: recurringTotal,  period: "mo" as const, yearly: Math.round(recurringTotal * 12),  sev: "MED",  col: "#EF9F27", tip: "Cancel 1 service"    },
    { emoji: "🛍️", label: "Fashion impulse", amt: shoppingWk,     period: "wk" as const, yearly: Math.round(shoppingWk * 12),     sev: "MED",  col: "#EF9F27", tip: "24h cooling-off rule" },
    { emoji: "🛵", label: "Food delivery",   amt: foodWk,         period: "wk" as const, yearly: Math.round(foodWk * 52),         sev: "HIGH", col: "#E24B4A", tip: "Cook 3x/week"        },
  ];

  const cats = [
    { label: "Coffee & Food", emoji: "☕", amount: 82, pct: 100, vs: "+12%" },
    { label: "Shopping",      emoji: "🛍️", amount: 76, pct: 93,  vs: "+5%"  },
    { label: "Streaming",     emoji: "📺", amount: 37, pct: 45,  vs: "−0%"  },
    { label: "Transport",     emoji: "🚇", amount: 14, pct: 17,  vs: "−8%"  },
  ];

  const topMerchants = [
    { name: "ASOS",       amount: 89.00, visits: 1, emoji: "💄" },
    { name: "H&M",        amount: 42.00, visits: 1, emoji: "🛍️" },
    { name: "Uber Eats",  amount: 40.50, visits: 2, emoji: "🛵" },
    { name: "Starbucks",  amount: 16.50, visits: 3, emoji: "☕" },
    { name: "Netflix",    amount: 15.99, visits: 1, emoji: "📺" },
  ];

  // Calendar heatmap June 2026
  const daySpend: Record<number, number> = {
    1: 0, 2: 34, 3: 12, 4: 0, 5: 28, 6: 55, 7: 0,
    8: 18, 9: 0, 10: 67, 11: 42, 12: 5, 13: 89, 14: 22,
    15: 0, 16: 15, 17: 48, 18: 0, 19: 31, 20: 76, 21: 14,
  };
  const getDayColor = (d: number) => {
    const s = daySpend[d] ?? 0;
    if (s === 0) return "bg-[#F0F0EC] text-ink/30";
    if (s < 20)  return "bg-success/25 text-success";
    if (s < 50)  return "bg-warning/30 text-warning";
    return "bg-danger/30 text-danger";
  };

  return (
    <div className="px-5 pt-6 space-y-3 pb-4">
      <ScreenHeader title="Spend 💸" />

      {/* Period toggle */}
      <div className="flex gap-2 p-1 bg-white rounded-pill shadow-card">
        {(["week", "month"] as const).map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-2.5 rounded-pill text-sm font-black transition-all ${period === p ? "bg-ink text-white" : "text-muted"}`}>
            This {p === "week" ? "Week" : "Month"}
          </button>
        ))}
      </div>

      {/* Hero */}
      <div className="rounded-[28px] p-5 bg-ink">
        <p className="text-white/40 text-[0.62rem] font-black uppercase tracking-widest mb-1">Total Spent</p>
        <div className="flex items-end gap-3 mb-1">
          <p className="text-white text-[3rem] font-black tracking-tightest leading-none">${display}</p>
          <span className={`mb-1.5 inline-flex items-center gap-0.5 rounded-pill px-2 py-0.5 text-xs font-black ${trendPct < 0 ? "bg-success/20 text-success" : "bg-danger/20 text-danger"}`}>
            {trendPct < 0 ? "↓" : "↑"}{Math.abs(trendPct)}%
          </span>
        </div>
        <p className="text-white/30 text-[0.62rem] font-medium mb-4">vs last {period}</p>
        {/* Bar chart */}
        <div className="flex items-end gap-1.5 h-12">
          {WEEK_SPEND.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <motion.div className="w-full rounded-t-sm" style={{ background: v === max ? "#FF7BD5" : "rgba(255,255,255,0.15)" }} initial={{ height: 0 }} animate={{ height: `${Math.max(3, (v / max) * 44)}px` }} transition={{ delay: i * 0.05, duration: 0.4 }} />
              <span className="text-[0.46rem] text-white/30 font-semibold">{DAYS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar heatmap */}
      <div className="bg-white rounded-[24px] shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[0.62rem] font-black uppercase tracking-widest text-muted">June · Spending Calendar</p>
          <div className="flex items-center gap-2 text-[0.55rem] font-semibold text-muted">
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm bg-success/35 inline-block" />low</span>
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm bg-warning/40 inline-block" />mid</span>
            <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm bg-danger/35 inline-block" />high</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {["M","T","W","T","F","S","S"].map((d, i) => <div key={i} className="text-center text-[0.52rem] font-black text-muted py-0.5">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
            <div key={day} className={`aspect-square rounded-md flex flex-col items-center justify-center ${getDayColor(day)}`}>
              <span className="text-[0.5rem] font-bold leading-none">{day}</span>
              {(daySpend[day] ?? 0) > 0 && <span className="text-[0.42rem] font-bold leading-none mt-0.5">${daySpend[day]}</span>}
            </div>
          ))}
          <div /><div />
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-2 p-1 bg-white rounded-pill shadow-card">
        <button onClick={() => setTab("overview")} className={`flex-1 py-2.5 rounded-pill text-sm font-black transition-all ${tab === "overview" ? "bg-ink text-white" : "text-muted"}`}>Analytics</button>
        <button onClick={() => setTab("less")}     className={`flex-1 py-2.5 rounded-pill text-sm font-black transition-all ${tab === "less"     ? "bg-ink text-white" : "text-muted"}`}>Spend Less</button>
      </div>

      {tab === "overview" && (
        <>
          {/* Bad habit scanner */}
          <div className="rounded-[28px] p-5" style={{ background: "#0F0F0F" }}>
            <p className="text-white/40 text-[0.62rem] font-black uppercase tracking-widest mb-0.5">Bad Habit Scanner 🔍</p>
            <p className="text-white font-black text-base mb-1">4 money leaks identified</p>
            <p className="text-white/35 text-xs font-medium mb-4">Small habits, massive yearly cost.</p>
            <div className="space-y-3">
              {habits.map((h) => {
                const cost = h.yearly;
                const pct  = Math.min(100, (cost / 2500) * 100);
                const amt  = `$${h.amt.toFixed(0)}/${h.period}`;
                return (
                  <div key={h.label} className="bg-white/7 rounded-[18px] p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex gap-2.5">
                        <span className="text-xl">{h.emoji}</span>
                        <div>
                          <p className="text-white text-sm font-black">{h.label}</p>
                          <p className="text-white/35 text-xs">{amt} · fix: {h.tip}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black" style={{ color: h.col }}>${cost.toLocaleString()}/yr</p>
                        <span className="text-[0.52rem] font-black px-1.5 py-0.5 rounded-sm" style={{ color: h.col, background: h.col + "22" }}>{h.sev}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/8 rounded-full">
                      <motion.div className="h-1.5 rounded-full" style={{ background: h.col }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top merchants */}
          <div className="bg-white rounded-[24px] shadow-card p-5">
            <p className="text-[0.62rem] font-black uppercase tracking-widest text-muted mb-4">Top Merchants</p>
            <div className="space-y-3">
              {topMerchants.map((m, i) => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-pinkSoft flex items-center justify-center text-base shrink-0">{m.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-black text-ink">{m.name}</span>
                      <span className="text-sm font-black text-ink">${m.amount.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 bg-pinkSoft rounded-full">
                      <motion.div className="h-1.5 bg-pink rounded-full" initial={{ width: 0 }} animate={{ width: `${(m.amount / 89) * 100}%` }} transition={{ delay: i * 0.07, duration: 0.5 }} />
                    </div>
                  </div>
                  <span className="text-[0.6rem] text-muted font-bold shrink-0">{m.visits}×</span>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-[24px] shadow-card p-5">
            <p className="text-[0.62rem] font-black uppercase tracking-widest text-muted mb-4">By Category</p>
            <div className="space-y-4">
              {cats.map((c) => (
                <div key={c.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-ink">{c.emoji} {c.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[0.58rem] font-black px-1.5 py-0.5 rounded-sm ${c.vs.startsWith("+") ? "text-danger bg-danger/10" : c.vs.startsWith("−") ? "text-success bg-success/10" : "text-muted bg-border"}`}>{c.vs}</span>
                      <span className="text-sm font-black text-ink">${c.amount}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-pinkSoft rounded-full">
                    <motion.div className="h-2 bg-pink rounded-full" initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ duration: 0.6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscriptions */}
          <div className="bg-white rounded-[24px] shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[0.62rem] font-black uppercase tracking-widest text-muted">Subscriptions</p>
              <span className="bg-warning/15 text-warning text-xs font-black px-2.5 py-1 rounded-pill">{recurring.length} active</span>
            </div>
            <p className="text-2xl font-black text-ink mb-0.5">${recurringTotal.toFixed(0)}<span className="text-base text-muted font-semibold">/mo</span></p>
            <p className="text-xs font-black text-danger mb-4">${(recurringTotal * 12).toFixed(0)}/year</p>
            <div className="space-y-2.5">
              {recurring.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{t.merchant}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-ink">${t.amount}/mo</span>
                    <button className="text-[0.6rem] font-black text-danger border border-danger/30 px-2 py-0.5 rounded-pill">cancel</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-warning/8 rounded-[14px] p-3">
              <p className="text-xs font-bold text-warning">💡 Cancel 1 sub = ${Math.round(recurringTotal * 0.28)}/mo = ${Math.round(recurringTotal * 0.28 * 12)}/year back</p>
            </div>
          </div>
        </>
      )}

      {tab === "less" && (
        <>
          <div className="bg-white rounded-[24px] shadow-card p-5">
            <p className="text-[0.62rem] font-black uppercase tracking-widest text-muted mb-1">Quick Wins</p>
            <p className="text-base font-black text-ink mb-4">Do these, save this much</p>
            <div className="space-y-2.5">
              {[
                { action: "Cancel Netflix + Disney+",    saves: "$21/mo", yearly: "$252/yr" },
                { action: "Starbucks → home coffee 4x",  saves: "$16/mo", yearly: "$192/yr" },
                { action: "Cook dinner 3x/week",          saves: "$35/mo", yearly: "$420/yr" },
                { action: "24h rule before shopping",     saves: "$40/mo", yearly: "$480/yr" },
                { action: "Switch to high-yield savings", saves: "$12/mo", yearly: "$143/yr" },
              ].map((w) => (
                <div key={w.action} className="flex items-center justify-between bg-[#F8F7F5] rounded-[14px] px-4 py-3">
                  <p className="text-sm font-semibold text-ink flex-1 pr-3">{w.action}</p>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-success">{w.saves}</p>
                    <p className="text-[0.58rem] font-semibold text-muted">{w.yearly}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[0.62rem] font-black uppercase tracking-widest text-muted">Challenges</p>
              <p className="text-xs text-pinkDeep font-black">unlock room items 🏡</p>
            </div>
            <div className="space-y-2">
              {challenges.map((c) => (
                <div key={c.id} className={`bg-white rounded-[20px] shadow-card p-4 border ${c.joined ? "border-pink/30" : c.completed ? "border-success/30" : "border-transparent"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">{c.completed ? "✅" : c.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-ink">{c.title}</p>
                      <p className="text-xs text-muted font-medium">{c.desc}</p>
                      <p className="text-[0.58rem] text-pink font-black mt-0.5">Unlocks: {c.unlockLabel}</p>
                    </div>
                    <div className="shrink-0">
                      {c.completed ? (
                        <span className="text-[0.6rem] font-black text-success">unlocked ✓</span>
                      ) : c.joined ? (
                        <motion.button className="text-[0.6rem] font-black bg-success text-white px-3 py-1.5 rounded-pill" onClick={() => onComplete(c.id)} whileTap={{ scale: 0.95 }}>Done ✓</motion.button>
                      ) : (
                        <motion.button className="text-[0.6rem] font-black bg-ink text-white px-3 py-1.5 rounded-pill" onClick={() => onJoin(c.id)} whileTap={{ scale: 0.95 }}>Join</motion.button>
                      )}
                    </div>
                  </div>
                  {!c.completed && <p className="text-[0.58rem] text-muted/60 font-medium mt-2">{c.social} · {c.duration}</p>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Accounts ─────────────────────────────────────────────────────────────────

function AccountsScreen() {
  const accounts = [
    { id: "checking", name: "Chase Checking", emoji: "🏦", balance: 2847.33, change: +125.50, type: "checking" },
    { id: "savings",  name: "Chase Savings",  emoji: "💰", balance: 3182.00, change: +300.00, type: "savings"  },
    { id: "invest",   name: "Robinhood",       emoji: "📈", balance: 1205.44, change: +42.10,  type: "investment" },
  ];
  const total    = accounts.reduce((s, a) => s + a.balance, 0);
  const income   = [{ source: "Salary", amount: 3200, recurring: true }, { source: "Freelance", amount: 450, recurring: false }];
  const totalInc = income.reduce((s, i) => s + i.amount, 0);
  const totalExp = 892;
  const leftover = totalInc - totalExp;

  return (
    <div className="px-5 pt-6 space-y-3 pb-4">
      <ScreenHeader title="Accounts 🏦" />

      {/* Net worth */}
      <div className="rounded-[28px] p-6 bg-ink">
        <p className="text-white/40 text-[0.62rem] font-black uppercase tracking-widest mb-1">Total Balance</p>
        <p className="text-white text-[3.5rem] font-black tracking-tightest leading-none">${total.toLocaleString("en", { maximumFractionDigits: 0 })}</p>
        <p className="text-white/30 text-xs font-medium mt-2">across {accounts.length} accounts</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="bg-success/15 rounded-[16px] p-3">
            <p className="text-success/70 text-[0.55rem] font-black uppercase tracking-widest">Income</p>
            <p className="text-success text-lg font-black">+${totalInc.toLocaleString()}</p>
          </div>
          <div className="bg-danger/15 rounded-[16px] p-3">
            <p className="text-danger/70 text-[0.55rem] font-black uppercase tracking-widest">Expenses</p>
            <p className="text-danger text-lg font-black">-${totalExp.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-2.5 bg-white/7 rounded-[16px] p-3 flex items-center justify-between">
          <p className="text-white/60 text-sm font-bold">Left over</p>
          <p className={`text-base font-black ${leftover >= 0 ? "text-success" : "text-danger"}`}>${leftover.toLocaleString()}/mo</p>
        </div>
      </div>

      {/* Account list */}
      <div className="bg-white rounded-[24px] shadow-card p-5">
        <p className="text-[0.62rem] font-black uppercase tracking-widest text-muted mb-4">Your Accounts</p>
        <div className="space-y-3.5">
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pinkSoft flex items-center justify-center text-xl shrink-0">{a.emoji}</div>
              <div className="flex-1">
                <p className="text-sm font-black text-ink">{a.name}</p>
                <p className="text-xs text-muted font-medium">{a.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-ink">${a.balance.toLocaleString("en", { minimumFractionDigits: 2 })}</p>
                <p className={`text-xs font-black ${a.change >= 0 ? "text-success" : "text-danger"}`}>{a.change >= 0 ? "+" : ""}${a.change.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full py-3 border-2 border-dashed border-border rounded-[16px] text-sm font-black text-muted active-press">+ Add Account</button>
      </div>

      {/* Income sources */}
      <div className="bg-white rounded-[24px] shadow-card p-5">
        <p className="text-[0.62rem] font-black uppercase tracking-widest text-muted mb-4">Income This Month</p>
        <div className="space-y-3">
          {income.map((i) => (
            <div key={i.source} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-ink">{i.source}</p>
                {i.recurring && <p className="text-[0.58rem] font-semibold text-muted">recurring</p>}
              </div>
              <p className="text-sm font-black text-success">+${i.amount.toLocaleString()}</p>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex items-center justify-between">
            <p className="text-sm font-black text-ink">Total</p>
            <p className="text-base font-black text-success">+${totalInc.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* How to earn more */}
      <div className="rounded-[28px] p-5" style={{ background: "#0F0F0F" }}>
        <p className="text-white/40 text-[0.62rem] font-black uppercase tracking-widest mb-0.5">How to Earn More 📈</p>
        <p className="text-white font-black text-base mb-4">Personalized for you</p>
        <div className="space-y-2.5">
          {[
            { emoji: "💼", tip: "Negotiate your salary",       detail: "avg successful raise: +$8K/yr",         tag: "HIGH",  tagCol: "#639922" },
            { emoji: "💻", tip: "Start freelancing",           detail: "avg side income: $450–$1,200/mo",       tag: "MED",   tagCol: "#EF9F27" },
            { emoji: "🏦", tip: "High-yield savings account",  detail: "4.5% APY → +$143/yr on your $3K",      tag: "EASY",  tagCol: "#7FB8FF" },
            { emoji: "📦", tip: "Sell unused items",           detail: "avg first month: $200 earned",           tag: "EASY",  tagCol: "#7FB8FF" },
            { emoji: "💳", tip: "Switch to cashback card",     detail: "2% back on everything = +$400/yr avg",  tag: "EASY",  tagCol: "#7FB8FF" },
          ].map((t) => (
            <div key={t.tip} className="bg-white/7 rounded-[16px] p-3.5 flex items-center gap-3">
              <span className="text-xl shrink-0">{t.emoji}</span>
              <div className="flex-1">
                <p className="text-white text-xs font-black">{t.tip}</p>
                <p className="text-white/35 text-[0.58rem] font-medium">{t.detail}</p>
              </div>
              <span className="text-[0.52rem] font-black px-1.5 py-0.5 rounded-sm shrink-0" style={{ color: t.tagCol, background: t.tagCol + "22" }}>{t.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Earn ─────────────────────────────────────────────────────────────────────

function EarnScreen({ cashEarned, onCelebrate, onNav }: { cashEarned: number; onCelebrate: (usd: number) => void; onNav: (s: Screen) => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className="px-5 pt-6 space-y-3 pb-4">
      <ScreenHeader title="Earn 🌟" />

      {/* Cash earned hero */}
      <div className="rounded-[28px] p-6 bg-ink">
        <p className="text-white/40 text-[0.62rem] font-black uppercase tracking-widest mb-1">Cash Earned</p>
        <p className="text-white text-[3.5rem] font-black tracking-tightest leading-none">${cashEarned.toFixed(2)}</p>
        <p className="text-white/30 text-xs font-medium mt-2">redeemable via PayPal or Venmo</p>
      </div>

      {/* Referral — main way to earn */}
      <div className="rounded-[28px] p-6 bg-ink">
        <p className="text-white/40 text-[0.62rem] font-black uppercase tracking-widest mb-2">Refer a Friend 🤝</p>
        <h3 className="text-white text-2xl font-black tracking-tightest mb-1">Both earn $5</h3>
        <p className="text-white/50 text-sm font-medium leading-5 mb-5">When your friend saves their first $50, you both get $5 cash. No cap on referrals.</p>

        <div className="space-y-2 mb-5">
          {[
            { n: 1, label: "1 friend saves $50",   reward: "Both get $5 cash 💸"         },
            { n: 2, label: "3 friends",             reward: "1 month Plus free 🌟"         },
            { n: 3, label: "10 friends",            reward: "Lifetime 50% off 💎"          },
          ].map((r) => (
            <div key={r.n} className="flex items-center gap-3 rounded-[18px] px-4 py-3 bg-white/8">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-white/15 text-white">{r.n}</div>
              <div className="flex-1">
                <p className="text-white text-xs font-black">{r.label}</p>
                <p className="text-white/45 text-[0.6rem]">{r.reward}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-white/25 text-xs font-semibold mb-1.5">0 / 3 friends referred</p>
        <div className="h-1.5 bg-white/10 rounded-full mb-5"><div className="h-1.5 bg-pink rounded-full" style={{ width: "0%" }} /></div>

        <div className="grid grid-cols-3 gap-2">
          <motion.button className="bg-[#25D366] rounded-[18px] py-4 flex flex-col items-center gap-1" whileTap={{ scale: 0.96 }}>
            <span className="text-xl">💬</span><span className="text-white text-[0.58rem] font-black">WhatsApp</span>
          </motion.button>
          <motion.button className="bg-[#010101] rounded-[18px] py-4 flex flex-col items-center gap-1 border border-white/15" whileTap={{ scale: 0.96 }}>
            <span className="text-xl">🎵</span><span className="text-white text-[0.58rem] font-black">TikTok</span>
          </motion.button>
          <motion.button className="bg-white/12 rounded-[18px] py-4 flex flex-col items-center gap-1" onClick={copy} whileTap={{ scale: 0.96 }}>
            <span className="text-xl">{copied ? "✅" : "🔗"}</span><span className="text-white text-[0.58rem] font-black">{copied ? "copied!" : "link"}</span>
          </motion.button>
        </div>
      </div>

      {/* TikTok 5K views = free month */}
      <div className="bg-white rounded-[24px] shadow-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-[0.62rem] font-black uppercase tracking-widest text-muted mb-1">TikTok Challenge 🎵</p>
            <h3 className="text-ink text-lg font-black tracking-tightest mb-1">5K Views = Free Month</h3>
            <p className="text-muted text-sm font-medium leading-5 mb-4">Post your savings journey or room before/after. Hit 5K views and your next subscription month is on us.</p>
          </div>
          <div className="w-12 h-12 rounded-[14px] bg-[#010101] flex items-center justify-center text-2xl shrink-0">🎵</div>
        </div>
        <div className="bg-[#F8F7F5] rounded-[16px] p-3 mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-black text-ink">Your progress</p>
            <p className="text-xs font-black text-muted">0 / 5,000 views</p>
          </div>
          <div className="h-2 bg-border rounded-full">
            <div className="h-2 bg-ink rounded-full" style={{ width: "0%" }} />
          </div>
        </div>
        <SecondaryButton onClick={() => onCelebrate(4.99)}>Post on TikTok 🎵</SecondaryButton>
      </div>

      {/* Pookie Plus CTA */}
      <motion.button
        className="w-full rounded-[24px] p-5 text-left overflow-hidden relative"
        style={{ background: "linear-gradient(135deg,#C9A8FF,#FF7BD5)" }}
        onClick={() => onNav("plus")}
        whileTap={{ scale: 0.98 }}
      >
        <div className="absolute -top-4 -right-4 text-[80px] opacity-15 pointer-events-none select-none">🌟</div>
        <p className="text-white/70 text-[0.62rem] font-black uppercase tracking-widest mb-1">Unlock everything</p>
        <h3 className="text-white text-xl font-black tracking-tightest mb-1">Pookie Plus</h3>
        <p className="text-white/70 text-sm font-medium mb-3">Unlimited insights · full analytics · all room unlocks · TikTok challenge eligible</p>
        <span className="inline-block bg-white text-ink text-xs font-black px-4 py-2 rounded-pill">$4.99/mo · try free →</span>
      </motion.button>
    </div>
  );
}

// ─── Pookie Plus ──────────────────────────────────────────────────────────────

function PlusScreen({ onBack, onSubscribe }: { onBack: () => void; onSubscribe: () => void }) {
  const features = [
    { free: "3 insights/month",    plus: "Unlimited Pookie insights"       },
    { free: "Basic analytics",     plus: "Full spending analytics + calendar" },
    { free: "3 challenges",        plus: "All 8 challenges + room unlocks" },
    { free: "—",                   plus: "TikTok 5K challenge eligible"    },
    { free: "—",                   plus: "Priority account sync"           },
    { free: "—",                   plus: "All room items unlocked"         },
  ];
  return (
    <div className="min-h-screen flex flex-col sm:min-h-[844px]">
      <div className="rounded-b-[44px] p-6 pt-14 pb-8 text-center" style={{ background: "linear-gradient(160deg,#C9A8FF,#FF7BD5,#FFB3E8)" }}>
        <button onClick={onBack} className="absolute top-14 left-5 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">←</button>
        <PookieChar mood="proud" size={120} />
        <h1 className="text-white text-[2.8rem] font-black tracking-tightest leading-[0.9] mt-4">Pookie<br />Plus 🌟</h1>
        <p className="text-white/75 text-sm font-medium mt-3">Unlock everything. Save smarter.</p>
      </div>

      <div className="px-5 pt-6 pb-10 space-y-4 flex-1">
        {/* Pricing */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-[22px] shadow-card p-4 text-center border-2 border-border">
            <p className="text-muted text-xs font-black uppercase mb-2">Monthly</p>
            <p className="text-ink text-2xl font-black">$4.99</p>
            <p className="text-muted text-xs font-medium">per month</p>
          </div>
          <div className="rounded-[22px] p-4 text-center border-2 border-pink relative" style={{ background: "#FFF0FB" }}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pink text-white text-[0.6rem] font-black px-2.5 py-1 rounded-pill">BEST VALUE</span>
            <p className="text-pink text-xs font-black uppercase mb-2">Yearly</p>
            <p className="text-ink text-2xl font-black">$39.99</p>
            <p className="text-success text-xs font-black">Save 33%</p>
          </div>
        </div>

        {/* Comparison */}
        <div className="bg-white rounded-[24px] shadow-card overflow-hidden">
          <div className="grid grid-cols-3 bg-[#F8F7F5] px-4 py-3">
            <p className="text-[0.58rem] font-black uppercase text-muted col-span-1">Feature</p>
            <p className="text-[0.58rem] font-black uppercase text-muted text-center">Free</p>
            <p className="text-[0.58rem] font-black uppercase text-pink text-center">Plus</p>
          </div>
          {features.map((f, i) => (
            <div key={i} className={`grid grid-cols-3 px-4 py-3 items-center ${i > 0 ? "border-t border-border" : ""}`}>
              <p className="text-xs font-bold text-ink col-span-1 pr-2 leading-4">{f.plus}</p>
              <p className="text-center text-sm">{f.free === "—" ? "—" : "✓"}</p>
              <p className="text-center text-pink text-sm font-black">✓</p>
            </div>
          ))}
        </div>

        <PillButton onClick={onSubscribe}>Start 7-Day Free Trial →</PillButton>
        <p className="text-center text-xs text-muted font-medium">Cancel anytime. No surprise charges. 🔒</p>
      </div>
    </div>
  );
}

// ─── Room ─────────────────────────────────────────────────────────────────────

function RoomScreen({ challenges, roomOwned, pookieName }: { challenges: Challenge[]; roomOwned: (item: RoomItem) => boolean; pookieName: string }) {
  const tierIdx = getTierIndex(182);
  return (
    <div className="px-5 pt-6 space-y-3 pb-4">
      <ScreenHeader title="Room 🏡" />
      <div className="relative rounded-[28px] overflow-hidden shadow-soft" style={{ height: 250 }}>
        <Image src="/assets/room.png" alt="room" fill className="object-cover" sizes="390px" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2"><PookieChar mood="happy" size={90} /></div>
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-pill px-3 py-1">
          <p className="text-white text-xs font-bold">{pookieName} · {TIERS[tierIdx].name}</p>
        </div>
      </div>

      <div className="bg-white rounded-[24px] shadow-card p-5">
        <p className="text-[0.62rem] font-black uppercase tracking-widest text-muted mb-1">Room Items</p>
        <p className="text-xs text-muted font-medium mb-4">Complete challenges to unlock items 💪</p>
        <div className="grid grid-cols-4 gap-3">
          {ROOM_ITEMS.map((item) => {
            const owned  = roomOwned(item);
            const ch     = challenges.find((c) => c.id === item.challengeId);
            return (
              <div key={item.id} className={`flex flex-col items-center gap-1.5 ${owned ? "" : "opacity-40"}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${owned ? "bg-pinkSoft" : "bg-[#F0F0EC]"}`}>
                  {owned ? item.emoji : "🔒"}
                </div>
                <p className="text-[0.52rem] font-bold text-muted text-center leading-3">{item.name}</p>
                {!owned && ch && <p className="text-[0.48rem] font-semibold text-pink/70 text-center leading-3">{ch.title}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-pinkSoft rounded-[20px] p-4">
        <p className="text-pinkDeep text-xs font-black mb-1">How to unlock items 🔑</p>
        <p className="text-ink text-sm font-medium leading-5">Complete challenges in the Spend tab to unlock room items. Each challenge = a unique item.</p>
      </div>

      <PillButton onClick={() => {}}>Save Look 💾</PillButton>
    </div>
  );
}

// ─── Journey ──────────────────────────────────────────────────────────────────

function JourneyScreen({ missions, onComplete, onBack }: { missions: Mission[]; onComplete: (id: string) => void; onBack: () => void }) {
  const cashMap: Record<string, number> = { first_save: 1, streak_3: 1.50, streak_7: 2, first_budget: 1.60, cancel_sub: 2, reach_goal: 5, invest: 10 };
  return (
    <div className="px-5 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-9 h-9 bg-white rounded-full shadow-card flex items-center justify-center text-sm font-bold active-press">←</button>
        <h1 className="text-2xl font-black tracking-tightest text-ink">Missions 🎯</h1>
      </div>
      <div className="relative">
        <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-border" />
        <div className="space-y-3">
          {missions.map((m, i) => {
            const isDone = m.state === "done", isActive = m.state === "active", isLocked = m.state === "locked";
            return (
              <motion.div key={m.id} className={`flex items-start gap-4 ${isLocked ? "opacity-40" : ""}`} initial={{ opacity: 0, x: -16 }} animate={{ opacity: isLocked ? 0.4 : 1, x: 0 }} transition={{ delay: i * 0.07, duration: 0.35 }}>
                <div className="relative z-10 shrink-0">
                  <motion.div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${isDone ? "bg-success/15" : isActive ? "bg-pinkSoft" : "bg-white border-2 border-border"}`} animate={isActive ? { scale: [1, 1.07, 1] } : {}} transition={{ duration: 1.8, repeat: Infinity }}>
                    {isDone ? "✅" : m.emoji}
                  </motion.div>
                </div>
                <div className={`flex-1 rounded-[22px] p-4 shadow-card ${isDone ? "bg-success/8" : "bg-white"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="text-sm font-black text-ink">{m.title}</p><p className="text-xs text-muted font-medium mt-0.5">{m.desc}</p></div>
                    <span className="text-success text-sm font-black shrink-0">+${(cashMap[m.id] ?? 1).toFixed(2)}</span>
                  </div>
                  {isActive && <motion.button className="mt-3 w-full bg-ink text-white text-xs font-black py-2.5 rounded-pill" onClick={() => onComplete(m.id)} whileTap={{ scale: 0.97 }}>Mark as done →</motion.button>}
                  {isDone   && <p className="mt-1 text-[0.65rem] font-black text-success">Completed ✓</p>}
                  {isLocked && <p className="mt-1 text-[0.65rem] font-semibold text-muted">Complete previous to unlock</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

function ProfileScreen({ cashEarned, streak, saved, pookieName, onBack, onNav }: { cashEarned: number; streak: number; saved: number; pookieName: string; onBack: () => void; onNav: (s: Screen) => void }) {
  const tierIdx = getTierIndex(saved);
  return (
    <div className="px-5 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="w-9 h-9 bg-white rounded-full shadow-card flex items-center justify-center text-sm font-bold active-press">←</button>
        <h1 className="text-2xl font-black tracking-tightest text-ink">Profile 💁‍♀️</h1>
      </div>
      <div className="bg-ink rounded-[28px] p-6 mb-4 flex items-center gap-4">
        <PookieChar mood="proud" size={72} />
        <div>
          <p className="text-white/40 text-[0.62rem] font-black uppercase tracking-widest mb-1">Your Pookie</p>
          <h2 className="text-white text-2xl font-black">{pookieName}</h2>
          <span className="text-xs font-bold" style={{ color: TIERS[tierIdx].color }}>{TIERS[tierIdx].emoji} {TIERS[tierIdx].name} Saver</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard label="Saved" value={`$${saved}`} />
        <StatCard label="Earned" value={`$${cashEarned.toFixed(2)}`} />
        <StatCard label="Streak" value={`${streak}🔥`} />
      </div>
      <motion.button className="w-full rounded-[22px] p-4 mb-4 text-left flex items-center justify-between" style={{ background: "linear-gradient(135deg,#C9A8FF,#FF7BD5)" }} onClick={() => onNav("plus")} whileTap={{ scale: 0.98 }}>
        <div>
          <p className="text-white/70 text-[0.62rem] font-black uppercase">Upgrade</p>
          <p className="text-white text-base font-black">Pookie Plus 🌟</p>
        </div>
        <span className="text-white text-xl">→</span>
      </motion.button>
      <div className="bg-white rounded-[24px] shadow-card overflow-hidden">
        {["Settings", "Privacy & Data", "Send Feedback"].map((item, i) => (
          <button key={item} className={`w-full flex items-center justify-between px-5 py-4 text-left font-bold text-sm text-ink active-press ${i > 0 ? "border-t border-border" : ""}`}>
            <span>{item}</span><span className="text-muted">›</span>
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-muted font-medium mt-6">Your data stays yours. Always. 🔒</p>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

const NAV: { screen: Screen; label: string; emoji: string }[] = [
  { screen: "home",     label: "Home",     emoji: "🏠" },
  { screen: "spend",    label: "Spend",    emoji: "💸" },
  { screen: "accounts", label: "Accounts", emoji: "🏦" },
  { screen: "earn",     label: "Earn",     emoji: "🌟" },
  { screen: "room",     label: "Room",     emoji: "🏡" },
];

function BottomNav({ active, onChange }: { active: Screen; onChange: (s: Screen) => void }) {
  return (
    <nav className="absolute inset-x-4 bottom-4 bg-ink rounded-[28px] p-2 shadow-pill">
      <div className="grid grid-cols-5 gap-1">
        {NAV.map((item) => {
          const on = active === item.screen;
          return (
            <motion.button key={item.screen} onClick={() => onChange(item.screen)} className={`rounded-[20px] py-2.5 px-1 text-center ${on ? "bg-white" : ""}`} whileTap={{ scale: 0.94 }}>
              <span className="block text-lg leading-none">{item.emoji}</span>
              <span className={`mt-1 block text-[0.58rem] font-black ${on ? "text-ink" : "text-white/40"}`}>{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function PillButton({ children, onClick, disabled = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button onClick={onClick} disabled={disabled} className="w-full bg-ink text-white font-black text-base py-4 rounded-pill shadow-pill disabled:opacity-30" whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button onClick={onClick} className="w-full border-2 border-ink text-ink font-black text-base py-3.5 rounded-pill" whileTap={{ scale: 0.97 }}>
      {children}
    </motion.button>
  );
}

function Chip({ icon, label, dark }: { icon: string; label: string; dark?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-pill px-3 py-1.5 ${dark ? "bg-ink" : "bg-white border border-border"}`}>
      <span className="text-sm">{icon}</span>
      <span className={`text-sm font-black ${dark ? "text-white" : "text-ink"}`}>{label}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-[18px] p-3 shadow-card text-center">
      <p className="text-[0.55rem] font-bold uppercase tracking-widest text-muted mb-1">{label}</p>
      <p className="text-base font-black tracking-tightest text-ink">{value}</p>
    </div>
  );
}

function ScreenHeader({ title }: { title: string }) {
  return <h1 className="text-[2.4rem] font-black tracking-tightest leading-[0.93] mb-1">{title}</h1>;
}

function InsightCard({ insight, onAccept, onReject }: { insight: Insight; onAccept: (id: string, r: number) => void; onReject: (id: string) => void }) {
  return (
    <div>
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">{insight.emoji}</span>
        <p className="text-sm font-bold text-ink leading-5">{insight.text}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <motion.button onClick={() => onAccept(insight.id, insight.reward)} className="bg-ink text-white text-xs font-black py-3 rounded-pill" whileTap={{ scale: 0.96 }}>
          {insight.action} +${insight.reward.toFixed(2)}
        </motion.button>
        <motion.button onClick={() => onReject(insight.id)} className="border border-border text-muted text-xs font-bold py-3 rounded-pill" whileTap={{ scale: 0.96 }}>
          Not now
        </motion.button>
      </div>
    </div>
  );
}

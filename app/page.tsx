"use client";

import { useCallback, useMemo, useState } from "react";

type Screen =
  | "onboarding"
  | "bank"
  | "home"
  | "scan"
  | "check"
  | "spending"
  | "suggestions"
  | "room"
  | "rewards"
  | "subscription"
  | "profile";

type Upgrade = {
  name: string;
  emoji: string;
  cost: number;
  owned: boolean;
};

const categories = [
  { name: "Food & cafes", amount: 82, trend: "12% lower than usual", color: "bg-pookie-pink", icon: "☕" },
  { name: "Shopping", amount: 76, trend: "EUR 18 over plan", color: "bg-pookie-purple", icon: "□" },
  { name: "Transport", amount: 31, trend: "on track", color: "bg-pookie-mint", icon: "↗" },
  { name: "Subscriptions", amount: 38, trend: "one price increase", color: "bg-pookie-yellow", icon: "≡" },
  { name: "Other", amount: 25, trend: "steady", color: "bg-pookie-danger", icon: "•" }
];

const weekSpend = [34, 28, 42, 31, 26, 22, 31];
const calendarDays = [
  { day: "M", amount: 34 },
  { day: "T", amount: 28 },
  { day: "W", amount: 42 },
  { day: "T", amount: 31 },
  { day: "F", amount: 26 },
  { day: "S", amount: 22 },
  { day: "S", amount: 31 }
];

const earnIdeas = [
  { title: "Sell one unused item", value: "Est. €25", note: "List it this week" },
  { title: "Invite 3 friends", value: "1 free month", note: "Reward eligible" },
  { title: "Creator room post", value: "Refund draw", note: "Monthly entry" }
];

const suggestions = [
  {
    title: "Skip 2 coffees",
    saving: "Save EUR 8",
    difficulty: "easy",
    emoji: "☕"
  },
  {
    title: "Cancel 1 unused subscription",
    saving: "Save EUR 12/mo",
    difficulty: "medium",
    emoji: "📺"
  },
  {
    title: "No-spend Sunday",
    saving: "Save EUR 20",
    difficulty: "easy",
    emoji: "🌤️"
  },
  {
    title: "Move EUR 5 today",
    saving: "Tiny win",
    difficulty: "easy",
    emoji: "🪙"
  }
];

const navItems: { screen: Screen; label: string; icon: string }[] = [
  { screen: "home", label: "Home", icon: "⌂" },
  { screen: "scan", label: "Scan", icon: "▣" },
  { screen: "spending", label: "Spend", icon: "◷" },
  { screen: "rewards", label: "Earn", icon: "€" },
  { screen: "room", label: "Room", icon: "⌂" }
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [coins, setCoins] = useState(140);
  const [xp, setXp] = useState(0);
  const [savedThisMonth, setSavedThisMonth] = useState(182);
  const [verifiedSavings, setVerifiedSavings] = useState(182);
  const [pendingSavings, setPendingSavings] = useState(5);
  const [scannedBills, setScannedBills] = useState(2);
  const [showReward, setShowReward] = useState(false);
  const [checkAnswers, setCheckAnswers] = useState<Record<number, string>>({});
  const [inviteCopied, setInviteCopied] = useState(false);
  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    { name: "Pink Rug", emoji: "💗", cost: 50, owned: true },
    { name: "Moon Lamp", emoji: "🌙", cost: 80, owned: true },
    { name: "Cozy Bed", emoji: "🛏️", cost: 120, owned: true },
    { name: "Plant Friend", emoji: "🪴", cost: 60, owned: true },
    { name: "Cute Sofa", emoji: "🛋️", cost: 180, owned: false },
    { name: "Cloud Wallpaper", emoji: "☁️", cost: 220, owned: false }
  ]);

  const monthlyGoal = 300;
  const progress = Math.min(100, Math.round((savedThisMonth / monthlyGoal) * 100));

  const hasBottomNav = !["onboarding", "bank", "check"].includes(screen);

  const completeCheck = () => {
    setShowReward(true);
    setXp((current) => current + 10);
    setCoins((current) => current + 12);
    setPendingSavings((current) => current + 5);
  };

  const verifySaving = (amount: number) => {
    setSavedThisMonth((current) => Math.min(monthlyGoal, current + amount));
    setVerifiedSavings((current) => Math.min(monthlyGoal, current + amount));
    setPendingSavings((current) => Math.max(0, current - amount));
    setCoins((current) => current + amount * 2);
  };

  const scanBill = () => {
    setScannedBills((current) => current + 1);
    setPendingSavings((current) => current + 3);
    setCoins((current) => current + 6);
  };

  const buyUpgrade = useCallback((name: string, cost: number) => {
    if (coins < cost) return;
    setCoins((current) => current - cost);
    setUpgrades((items) =>
      items.map((item) => (item.name === name ? { ...item, owned: true } : item))
    );
  }, [coins]);

  const content = useMemo(() => {
    switch (screen) {
      case "onboarding":
        return <Onboarding onStart={() => setScreen("bank")} />;
      case "bank":
        return <BankConnect onDemo={() => setScreen("home")} />;
      case "home":
        return (
          <Home
            progress={progress}
            savedThisMonth={savedThisMonth}
            monthlyGoal={monthlyGoal}
            coins={coins}
            xp={xp}
            verifiedSavings={verifiedSavings}
            pendingSavings={pendingSavings}
            scannedBills={scannedBills}
            onCheck={() => setScreen("check")}
            onScan={() => setScreen("scan")}
            onSuggestions={() => setScreen("suggestions")}
            onEarn={() => setScreen("rewards")}
            onRoom={() => setScreen("room")}
            onPlus={() => setScreen("subscription")}
            onProfile={() => setScreen("profile")}
            onVerify={() => verifySaving(5)}
          />
        );
      case "scan":
        return <Scanner scannedBills={scannedBills} onScan={scanBill} onVerify={() => verifySaving(3)} />;
      case "check":
        return (
          <DailyCheck
            answers={checkAnswers}
            setAnswers={setCheckAnswers}
            onDone={completeCheck}
            showReward={showReward}
            onRewardClose={() => {
              setShowReward(false);
              setScreen("room");
            }}
          />
        );
      case "spending":
        return <Spending onSuggestions={() => setScreen("suggestions")} />;
      case "suggestions":
        return <Suggestions onAccept={() => setScreen("check")} />;
      case "room":
        return <Room coins={coins} upgrades={upgrades} onBuy={buyUpgrade} />;
      case "rewards":
        return (
          <Rewards
            copied={inviteCopied}
            onCopy={() => {
              setInviteCopied(true);
              window.setTimeout(() => setInviteCopied(false), 1400);
            }}
            onShare={() => setScreen("room")}
          />
        );
      case "subscription":
        return <Subscription onTrial={() => setScreen("home")} onFree={() => setScreen("home")} />;
      case "profile":
        return (
          <Profile
            savedThisMonth={savedThisMonth}
            monthlyGoal={monthlyGoal}
            coins={coins}
            verifiedSavings={verifiedSavings}
            scannedBills={scannedBills}
          />
        );
      default:
        return null;
    }
  }, [screen, progress, savedThisMonth, coins, xp, verifiedSavings, pendingSavings, scannedBills, checkAnswers, showReward, inviteCopied, upgrades, buyUpgrade]);

  return (
    <main className="min-h-screen bg-pookie-bg text-pookie-text sm:grid sm:place-items-center sm:p-6">
      <div className="relative min-h-screen w-full overflow-hidden bg-pookie-bg shadow-soft sm:min-h-[844px] sm:w-[390px] sm:rounded-[42px] sm:border-[10px] sm:border-white">
        <div
          className={`phone-scroll h-screen overflow-y-auto px-5 pb-6 pt-5 sm:h-[824px] ${
            hasBottomNav ? "pb-44" : ""
          }`}
        >
          {content}
        </div>
        {hasBottomNav ? <BottomNav active={screen} onChange={setScreen} /> : null}
      </div>
    </main>
  );
}

function Onboarding({ onStart }: { onStart: () => void }) {
  return (
    <section className="flex min-h-[calc(100vh-2.5rem)] flex-col justify-between sm:min-h-[780px]">
      <div>
        <div className="flex items-center justify-between">
          <BrandPill />
          <span className="rounded-full border border-pookie-border bg-white px-3 py-2 text-xs font-medium text-pookie-muted">
            Demo
          </span>
        </div>
        <div className="mt-14 grid place-items-center">
          <div className="glass-card grid h-72 w-full place-items-center rounded-[40px] border border-white/80 shadow-soft">
            <div className="relative">
              <div className="absolute -right-8 -top-8 rounded-full bg-pookie-pink px-3 py-1 text-xs font-semibold text-white">
                proud
              </div>
              <PookieAvatar size="large" />
            </div>
          </div>
        </div>
        <h1 className="mt-10 text-center text-[2.65rem] font-bold leading-[1.02] tracking-[-0.04em]">
          Your money, but cuter.
        </h1>
        <p className="mx-auto mt-4 max-w-[19rem] text-center text-base font-normal leading-6 text-pookie-muted">
          Save more, understand spending, and keep Pookie happy with simple daily money habits.
        </p>
      </div>
      <div className="mt-8">
        <PrimaryButton onClick={onStart}>Start</PrimaryButton>
        <p className="mt-4 text-center text-sm font-medium text-pookie-muted">
          Read-only demo. No real bank connection.
        </p>
      </div>
    </section>
  );
}

function BankConnect({ onDemo }: { onDemo: () => void }) {
  return (
    <section>
      <TopBar title="Verification" />
      <h1 className="mt-7 text-4xl font-bold leading-tight tracking-[-0.035em]">How Pookie knows you saved</h1>
      <p className="mt-3 text-base leading-6 text-pookie-muted">
        Real savings should be counted when money moves, not when you tap a cute button.
      </p>
      <div className="glass-card mt-8 rounded-[32px] border border-white p-6 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pookie-muted">
              Coming soon
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em]">Read-only bank check</h2>
          </div>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-lg shadow-soft">✓</span>
        </div>
        <p className="mt-8 text-base font-medium leading-6">
          Pookie verifies transfers to savings, lower balances on bills, and receipt scans.
        </p>
        <div className="mt-5 h-2 rounded-full bg-white/50">
          <div className="h-3 w-2/3 rounded-full bg-pookie-pink" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {["Read-only access", "Transfer detected", "Demo mode now"].map((item) => (
          <div key={item} className="rounded-3xl border border-pookie-border bg-white p-3 text-center">
            <div className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-full bg-pookie-mint/45 text-sm">
              ✓
            </div>
            <p className="text-xs font-semibold leading-4">{item}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <PrimaryButton onClick={onDemo}>Use demo verification</PrimaryButton>
      </div>
    </section>
  );
}

function Home({
  progress,
  savedThisMonth,
  monthlyGoal,
  xp,
  verifiedSavings,
  pendingSavings,
  scannedBills,
  onCheck,
  onScan,
  onSuggestions,
  onEarn,
  onRoom,
  onPlus,
  onProfile,
  onVerify
}: {
  progress: number;
  savedThisMonth: number;
  monthlyGoal: number;
  coins: number;
  xp: number;
  verifiedSavings: number;
  pendingSavings: number;
  scannedBills: number;
  onCheck: () => void;
  onScan: () => void;
  onSuggestions: () => void;
  onEarn: () => void;
  onRoom: () => void;
  onPlus: () => void;
  onProfile: () => void;
  onVerify: () => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-soft">
            <PookieAvatar size="small" />
          </div>
          <div>
            <p className="text-sm font-medium text-pookie-muted">Good morning</p>
            <h1 className="text-xl font-semibold tracking-[-0.02em]">Let&apos;s keep your money in control</h1>
          </div>
        </div>
        <button
          onClick={onProfile}
          className="grid h-11 w-11 place-items-center rounded-full border border-pookie-border bg-white text-lg shadow-soft"
          aria-label="Open profile"
        >
          <PookieAvatar size="small" />
        </button>
      </div>
      <div className="glass-card mt-6 rounded-[34px] border border-white p-6 shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-pookie-muted">Safe to spend this week</p>
            <h2 className="mt-3 text-6xl font-bold tracking-[-0.06em]">€126</h2>
            <p className="mt-3 max-w-[15rem] text-sm leading-5 text-pookie-muted">
              after bills, savings goal, and usual spending
            </p>
          </div>
          <span className="rounded-full bg-white/85 px-3 py-2 text-xs font-semibold text-pookie-success">
            stable
          </span>
        </div>
      </div>
      <div className="mt-4 rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-pookie-muted">7-day spending</p>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em]">€214</h2>
          </div>
          <button onClick={onPlus} className="rounded-full bg-[#FAFAF7] px-3 py-2 text-xs font-semibold">
            Plus
          </button>
        </div>
        <MiniBarChart values={weekSpend} />
      </div>
      <div className="mt-4 rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
        <div className="flex gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-[#FAFAF7]">
            <PookieAvatar />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-pookie-muted">Pookie companion</p>
            <h2 className="mt-1 text-lg font-semibold tracking-[-0.01em]">Pookie is proud today</h2>
            <p className="mt-1 text-sm leading-5 text-pookie-muted">
              You spent 12% less on cafes this week.
            </p>
            <StatBar label="Mood" value={86} color="bg-pookie-pink" />
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
        <h2 className="text-base font-semibold tracking-[-0.01em]">Quick access</h2>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {[
            ["Scan", "▣", onScan],
            ["Check", "✓", onCheck],
            ["Spend", "◷", onSuggestions],
            ["Earn", "€", onEarn],
            ["Room", "⌂", onRoom]
          ].map(([label, icon, action]) => (
            <button
              key={label as string}
              onClick={action as () => void}
              className="min-w-0 rounded-2xl bg-[#FAFAF7] px-2 py-3 text-center"
            >
              <span className="mx-auto grid h-8 w-8 place-items-center rounded-xl bg-white text-sm shadow-soft">
                {icon as string}
              </span>
              <span className="mt-2 block truncate text-[0.65rem] font-medium text-pookie-muted">
                {label as string}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-pookie-muted">Monthly savings</p>
            <h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">
              €{savedThisMonth} <span className="text-lg font-medium text-pookie-muted">/ €{monthlyGoal}</span>
            </h2>
          </div>
          <span className="text-sm font-semibold text-pookie-success">€118 left</span>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[#F0F0EC]">
          <div className="h-2 rounded-full bg-pookie-success" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <PrimaryButton onClick={onScan}>Scan bill</PrimaryButton>
        <SecondaryButton onClick={onVerify}>Verify €5</SecondaryButton>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniCard label="Pending savings" value={`€${pendingSavings}`} />
        <MiniCard label={`${scannedBills} bills scanned`} value="▣" />
      </div>
      <button
        onClick={onSuggestions}
        className="mt-4 flex w-full items-center justify-between rounded-[30px] bg-white p-4 text-left shadow-soft"
      >
        <span>
          <span className="block text-sm font-medium text-pookie-muted">Smart insight</span>
          <span className="text-base font-semibold">Your money looks calmer today.</span>
        </span>
        <span className="text-2xl">✦</span>
      </button>
      <p className="mt-4 text-center text-xs font-medium text-pookie-muted">{xp} XP earned in demo mode</p>
    </section>
  );
}

function Scanner({
  scannedBills,
  onScan,
  onVerify
}: {
  scannedBills: number;
  onScan: () => void;
  onVerify: () => void;
}) {
  return (
    <section>
      <TopBar title="Bill scanner" />
      <h1 className="mt-6 text-4xl font-bold leading-tight tracking-[-0.04em]">Scan receipts and bills</h1>
      <p className="mt-3 text-base leading-6 text-pookie-muted">
        Pookie reads the bill, finds recurring charges, and suggests a concrete saving action.
      </p>
      <div className="glass-card mt-6 rounded-[34px] border border-white p-4 shadow-soft">
        <div className="relative h-80 overflow-hidden rounded-[26px] bg-white/55">
          <div className="absolute inset-x-10 top-8 h-64 rotate-[-2deg] rounded-xl border border-pookie-border bg-white p-5 font-mono text-[0.72rem] leading-5 text-pookie-ink shadow-soft">
            <p className="text-center font-bold">CITY MARKET</p>
            <p className="mt-3">Coffee x2 ........ EUR 8.00</p>
            <p>Snacks ........... EUR 6.40</p>
            <p>Streaming ........ EUR 12.00</p>
            <p>Groceries ........ EUR 34.10</p>
            <p className="mt-3 border-t border-dashed border-pookie-border pt-3">TOTAL EUR 60.50</p>
          </div>
          <div className="absolute inset-8 rounded-[26px] border-2 border-pookie-pink/80" />
          <div className="absolute bottom-5 left-1/2 grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full border border-white bg-pookie-ink text-2xl text-white shadow-soft">
            ▣
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
        <p className="text-sm font-medium text-pookie-muted">Detected from demo scan</p>
        <h2 className="mt-1 text-xl font-semibold">Save €3 by swapping one snack run</h2>
        <p className="mt-2 text-sm leading-5 text-pookie-muted">
          This creates pending savings. Pookie only counts it as saved after the linked bank shows EUR 3 moved to savings.
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <PrimaryButton onClick={onScan}>Scan demo bill</PrimaryButton>
        <SecondaryButton onClick={onVerify}>Verify EUR 3</SecondaryButton>
      </div>
      <p className="mt-4 text-center text-sm font-medium text-pookie-muted">
        {scannedBills} scanned bills in demo mode
      </p>
    </section>
  );
}

function DailyCheck({
  answers,
  setAnswers,
  onDone,
  showReward,
  onRewardClose
}: {
  answers: Record<number, string>;
  setAnswers: (answers: Record<number, string>) => void;
  onDone: () => void;
  showReward: boolean;
  onRewardClose: () => void;
}) {
  const questions = [
    { text: "Did you review today's spending?", answers: ["Yes", "Not yet"] },
    { text: "Which leak can we reduce?", answers: ["Coffee", "Snacks", "Shopping"] },
    { text: "Create a pending EUR 5 saving?", answers: ["Move EUR 5", "Not today"] }
  ];
  const done = Object.keys(answers).length === questions.length;

  return (
    <section>
      <TopBar title="Money check" />
      <div className="mt-6 flex items-center gap-3">
        <div className="h-4 flex-1 rounded-full bg-white shadow-inner">
          <div
            className="h-4 rounded-full bg-pookie-success"
            style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
          />
        </div>
        <span className="font-black">{Object.keys(answers).length}/3</span>
      </div>
      <h1 className="mt-7 text-4xl font-bold leading-tight tracking-[-0.04em]">Daily money check</h1>
      <p className="mt-3 leading-6 text-pookie-muted">
        This creates a pending saving. It counts after the transfer is verified.
      </p>
      <div className="mt-6 space-y-4">
        {questions.map((question, index) => (
          <div key={question.text} className="rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
            <p className="text-lg font-semibold">{question.text}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {question.answers.map((answer) => {
                const selected = answers[index] === answer;
                return (
                  <button
                    key={answer}
                    onClick={() => setAnswers({ ...answers, [index]: answer })}
                    className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${
                      selected
                        ? "border-pookie-ink bg-pookie-ink text-white"
                        : "border-pookie-border bg-[#FAFAF7] text-pookie-text"
                    }`}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-7">
        <PrimaryButton onClick={onDone} disabled={!done}>
          Finish check
        </PrimaryButton>
      </div>
      {showReward ? <RewardModal onClose={onRewardClose} /> : null}
    </section>
  );
}

function Spending({ onSuggestions }: { onSuggestions: () => void }) {
  const max = Math.max(...categories.map((category) => category.amount));
  return (
    <section>
      <TopBar title="Spending" />
      <h1 className="mt-6 text-4xl font-bold tracking-[-0.04em]">Spend analytics</h1>
      <div className="glass-card mt-5 rounded-[34px] border border-white p-5 shadow-soft">
        <p className="text-sm font-medium text-pookie-muted">Total spent this week</p>
        <h2 className="mt-2 text-5xl font-bold tracking-[-0.06em]">€214</h2>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Metric label="Income" value="€420" trend="+4.2%" />
          <Metric label="Expenses" value="€214" trend="-12%" danger />
          <Metric label="Savings" value="€182" trend="on track" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-[0.9fr_1.1fr] gap-3">
        <div className="rounded-[28px] border border-pookie-border bg-white p-4 shadow-soft">
          <p className="text-sm font-medium text-pookie-muted">Category mix</p>
          <DonutChart />
          <p className="mt-2 text-center text-xs text-pookie-muted">Food leads spend</p>
        </div>
        <div className="rounded-[28px] border border-pookie-border bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-pookie-muted">Calendar</p>
            <p className="text-xs font-semibold text-pookie-success">under avg</p>
          </div>
          <SpendCalendar />
        </div>
      </div>
      <div className="mt-4 rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-pookie-muted">Daily trend</p>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em]">12% lower</h2>
          </div>
          <span className="rounded-full bg-pookie-success/15 px-3 py-2 text-xs font-semibold text-pookie-success">
            good
          </span>
        </div>
        <MiniBarChart values={weekSpend} />
      </div>
      <div className="mt-4 rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
        <div className="flex gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FAFAF7]">
            <PookieAvatar size="small" />
          </div>
          <div>
            <p className="text-sm font-medium text-pookie-muted">Pookie noticed</p>
            <p className="mt-1 text-base font-semibold leading-6">
              Cafes are your biggest money leak this week.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Insight title="Total spent" value="EUR 214" />
        <Insight title="Income" value="EUR 420" />
        <Insight title="Expenses" value="EUR 214" />
        <Insight title="Savings" value="EUR 182" />
      </div>
      <div className="mt-4 rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold tracking-[-0.01em]">Categories</h2>
        <div className="mt-5 space-y-4">
          {categories.map((category) => (
            <div key={category.name} className="flex items-center gap-3">
              <span className={`h-9 w-9 rounded-2xl ${category.color} opacity-80`} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-semibold">{category.name}</span>
                  <span className="font-semibold">€{category.amount}</span>
                </div>
                <p className="mt-1 text-xs text-pookie-muted">{category.trend}</p>
                <div className="mt-2 h-1.5 rounded-full bg-[#F0F0EC]">
                  <div
                    className={`h-1.5 rounded-full ${category.color}`}
                    style={{ width: `${(category.amount / max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <PrimaryButton onClick={onSuggestions}>See saving ideas</PrimaryButton>
      </div>
    </section>
  );
}

function Suggestions({ onAccept }: { onAccept: () => void }) {
  return (
    <section>
      <TopBar title="Tiny wins" />
      <h1 className="mt-6 text-4xl font-bold leading-tight tracking-[-0.04em]">Smart saving challenges</h1>
      <p className="mt-3 leading-6 text-pookie-muted">Pick one calm action. Small save, cozy upgrade.</p>
      <div className="mt-6 space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.title} className="rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FAFAF7] text-xl">
                {suggestion.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">{suggestion.title}</h2>
                <p className="mt-1 text-sm text-pookie-muted">{suggestion.saving}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-pookie-mint/45 px-3 py-2 text-xs font-semibold uppercase">
                {suggestion.difficulty}
              </span>
              <button
                onClick={onAccept}
                className="rounded-full bg-pookie-ink px-5 py-3 text-sm font-semibold text-white"
              >
                Accept challenge
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Room({
  coins,
  upgrades,
  onBuy
}: {
  coins: number;
  upgrades: Upgrade[];
  onBuy: (name: string, cost: number) => void;
}) {
  const owned = upgrades.filter((item) => item.owned);
  const locked = upgrades.filter((item) => !item.owned);
  return (
    <section>
      <div className="flex items-center justify-between">
        <TopBar title="Pookie room" compact />
        <div className="rounded-full border border-pookie-border bg-white px-4 py-2 text-sm font-semibold">
          {coins} coins
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-[34px] border border-pookie-border bg-white p-3 shadow-soft">
        <AnimeRoomScene />
      </div>
      <div className="mt-5 rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
        <p className="text-sm font-medium text-pookie-muted">Level 2 Cozy Room</p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em]">
          Upgrade Pookie&apos;s space by building better money habits.
        </h1>
      </div>
      <h2 className="mt-6 text-lg font-semibold">Unlocked</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {owned.map((item) => (
          <span key={item.name} className="rounded-full border border-pookie-border bg-white px-4 py-2 text-sm font-medium">
            {item.name}
          </span>
        ))}
      </div>
      <h2 className="mt-6 text-lg font-semibold">Lifestyle upgrades</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {locked.map((item) => (
          <div key={item.name} className="rounded-[24px] border border-pookie-border bg-white p-4 shadow-soft">
            <div className="h-10 w-10 rounded-2xl bg-[#FAFAF7]" />
            <h3 className="mt-3 font-semibold">{item.name}</h3>
            <p className="text-sm text-pookie-muted">{item.cost} coins</p>
            <button
              onClick={() => onBuy(item.name, item.cost)}
              disabled={coins < item.cost}
              className="mt-3 w-full rounded-full bg-pookie-ink px-3 py-3 text-sm font-semibold text-white disabled:bg-[#CDBDCD]"
            >
              Upgrade
            </button>
          </div>
        ))}
        {["Cloud bed", "Pink lamp", "Tiny plant", "Window view", "Velvet rug"].map((name) => (
          <div key={name} className="rounded-[24px] border border-pookie-border bg-white/75 p-4">
            <div className="h-10 w-10 rounded-2xl bg-[#FAFAF7]" />
            <h3 className="mt-3 font-semibold">{name}</h3>
            <p className="text-sm text-pookie-muted">Locked</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Rewards({
  copied,
  onCopy,
  onShare
}: {
  copied: boolean;
  onCopy: () => void;
  onShare: () => void;
}) {
  return (
    <section>
      <TopBar title="Earn" />
      <h1 className="mt-6 text-4xl font-bold leading-tight tracking-[-0.04em]">Earn, save, repeat</h1>
      <p className="mt-3 text-base leading-6 text-pookie-muted">
        Simple ways to make or unlock value inside Save Pookie. No guaranteed income.
      </p>
      <div className="mt-6 space-y-3">
        {earnIdeas.map((idea) => (
          <div key={idea.title} className="rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">{idea.title}</h2>
                <p className="mt-1 text-sm text-pookie-muted">{idea.note}</p>
              </div>
              <span className="rounded-full bg-[#FAFAF7] px-3 py-2 text-sm font-semibold">
                {idea.value}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="glass-card mt-6 rounded-[32px] border border-white p-5 shadow-soft">
        <p className="text-sm font-medium text-pookie-muted">Referral progress</p>
        <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">0 / 3 friends invited</h2>
        <div className="mt-4 h-4 rounded-full bg-white/25">
          <div className="h-4 w-0 rounded-full bg-pookie-yellow" />
        </div>
        <p className="mt-3 font-semibold">Reward: 1 free month</p>
      </div>
      <div className="mt-4 rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FAFAF7] text-lg">▣</span>
          <div>
            <h2 className="text-xl font-semibold">TikTok room challenge</h2>
            <p className="mt-2 text-sm leading-5 text-pookie-muted">
              Tag @savepookie. Get 1,000 views to enter the monthly refund draw.
            </p>
            <p className="mt-3 rounded-2xl bg-[#FAFAF7] p-3 text-sm font-medium text-pookie-muted">
              View milestones unlock reward eligibility. No guaranteed cash refunds.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
        <h2 className="text-xl font-semibold">Invite rewards</h2>
        <p className="mt-3 text-sm text-pookie-muted">Invite 3 friends: get 1 free month</p>
        <p className="mt-2 text-sm text-pookie-muted">Invite 10 friends: get 1 year free</p>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <SecondaryButton onClick={onCopy}>{copied ? "Copied" : "Copy invite link"}</SecondaryButton>
        <PrimaryButton onClick={onShare}>Share Pookie room</PrimaryButton>
      </div>
    </section>
  );
}

function Subscription({ onTrial, onFree }: { onTrial: () => void; onFree: () => void }) {
  const features = [
    "Unlimited spending insights",
    "Smart saving challenges",
    "Subscription leak detector",
    "Full Pookie room",
    "Free month challenges"
  ];
  return (
    <section>
      <TopBar title="Save Pookie Plus" />
      <div className="glass-card mt-6 rounded-[34px] border border-white p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pookie-muted">Plus</p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em]">Save Pookie Plus</h1>
        <div className="mt-5 flex items-end gap-2">
          <span className="text-5xl font-bold tracking-[-0.06em]">€4.99</span>
          <span className="pb-2 font-medium text-pookie-muted">/month</span>
        </div>
      </div>
      <div className="mt-5 rounded-[28px] border border-pookie-border bg-white p-5 shadow-soft">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3 border-b border-[#F4E8F3] py-4 last:border-0">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-pookie-mint/50 font-semibold">✓</span>
            <span className="font-medium">{feature}</span>
          </div>
        ))}
      </div>
      <div className="mt-7 space-y-3">
        <PrimaryButton onClick={onTrial}>Start free trial</PrimaryButton>
        <SecondaryButton onClick={onFree}>Continue free</SecondaryButton>
      </div>
      <p className="mt-4 text-center text-sm text-pookie-muted">Cancel anytime. Demo mode available.</p>
    </section>
  );
}

function Profile({
  savedThisMonth,
  monthlyGoal,
  coins,
  verifiedSavings,
  scannedBills
}: {
  savedThisMonth: number;
  monthlyGoal: number;
  coins: number;
  verifiedSavings: number;
  scannedBills: number;
}) {
  return (
    <section>
      <TopBar title="Profile" />
      <div className="mt-6 rounded-[32px] border border-pookie-border bg-white p-6 text-center shadow-soft">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#FAFAF7]">
          <PookieAvatar />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-[-0.03em]">Demo account</h1>
        <p className="mt-1 text-sm text-pookie-muted">Read-only demo mode</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Insight title="Monthly saving goal" value={`EUR ${monthlyGoal}`} />
        <Insight title="Saved this month" value={`EUR ${savedThisMonth}`} />
        <Insight title="Verified savings" value={`EUR ${verifiedSavings}`} />
        <Insight title="Bills scanned" value={`${scannedBills}`} />
      </div>
      <div className="mt-4 rounded-[28px] border border-pookie-border bg-white p-2 shadow-soft">
        {["Settings", "Data privacy", "Delete account", `${coins} demo coins`].map((item) => (
          <button
            key={item}
            className="flex w-full items-center justify-between rounded-[22px] px-4 py-4 text-left font-medium"
          >
            <span>{item}</span>
            <span className="text-pookie-muted">›</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function BottomNav({ active, onChange }: { active: Screen; onChange: (screen: Screen) => void }) {
  return (
    <nav className="absolute inset-x-4 bottom-4 rounded-[30px] border border-pookie-border bg-white/92 p-2 shadow-soft backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const selected = active === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => onChange(item.screen)}
              className={`rounded-[20px] px-1 py-3 text-center transition ${
                selected ? "bg-pookie-ink text-white" : "text-pookie-muted"
              }`}
            >
              <span className="block text-lg leading-none">{item.icon}</span>
              <span className="mt-1 block text-[0.58rem] font-black">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function AnimeRoomScene({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`anime-room relative overflow-hidden ${compact ? "h-56" : "h-72"} rounded-[28px]`}>
      <div className="absolute inset-0 bg-[#f8c987]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#ffc46f] to-[#f3a96c]" />
      <div className="absolute right-7 top-7 h-28 w-28 rounded-t-[46px] border-4 border-[#6c4635] bg-[#ffd17b]">
        <div className="absolute inset-3 bg-gradient-to-b from-[#ffdd8e] to-[#d9754e]" />
        <div className="absolute bottom-4 left-5 h-16 w-4 bg-[#b75c43]" />
        <div className="absolute bottom-4 left-12 h-20 w-5 bg-[#b75c43]" />
        <div className="absolute bottom-4 right-5 h-12 w-4 bg-[#b75c43]" />
      </div>
      <div className="absolute left-0 top-0 h-full w-full opacity-30">
        {Array.from({ length: 20 }).map((_, index) => (
          <span
            key={index}
            className="absolute text-sm"
            style={{
              left: `${(index * 37) % 100}%`,
              top: `${(index * 23) % 100}%`
            }}
          >
            🍎
          </span>
        ))}
      </div>
      <div className="absolute left-5 top-7 h-16 w-28 rounded-lg border-4 border-[#6c4635] bg-[#f3dfb8]">
        <p className="pt-4 text-center text-sm font-black text-[#6c4635]">SAVINGS</p>
      </div>
      <div className="absolute left-6 top-28 h-20 w-28 rounded-t-2xl border-4 border-[#6c4635] bg-[#d9905f]">
        <div className="absolute -top-9 left-5 h-10 w-16 rounded-t-full border-4 border-b-0 border-[#6c4635] bg-[#efb06d]" />
      </div>
      <div className="absolute left-2 bottom-16 h-3 w-44 rounded-full bg-[#6c4635]" />
      <div className="absolute left-0 bottom-8 h-16 w-48 rounded-tr-3xl border-4 border-l-0 border-[#6c4635] bg-[#bf7c50]" />
      <div className="absolute right-0 bottom-7 h-28 w-32 rounded-tl-3xl border-4 border-r-0 border-[#6c4635] bg-[#a86f58]">
        <div className="mx-5 mt-4 h-16 rounded bg-[#6c4635]/20" />
      </div>
      <div className="absolute right-12 top-32 flex gap-2">
        {["#6ba36f", "#d77955", "#7b9f65"].map((color, index) => (
          <div key={color} className="relative h-16 w-8">
            <div className="absolute bottom-0 h-7 w-8 rounded-b-lg border-2 border-[#6c4635] bg-[#b76f4c]" />
            <div
              className="absolute bottom-6 left-1 h-10 w-6 rounded-full border-2 border-[#6c4635]"
              style={{ backgroundColor: color, transform: `rotate(${index * 10 - 8}deg)` }}
            />
          </div>
        ))}
      </div>
      <div className="absolute bottom-10 left-24 h-20 w-40 rotate-[-3deg] rounded-lg border-4 border-[#6c4635] bg-[#c98855]">
        <p className="pt-8 text-center text-lg font-black text-[#6c4635]">CATNAP</p>
      </div>
      <div className="absolute bottom-24 left-36 h-16 w-24">
        <div className="absolute bottom-0 h-12 w-24 rounded-[50%] border-4 border-[#6c4635] bg-[#df8b52]" />
        <div className="absolute left-3 top-0 h-8 w-8 rotate-[-20deg] rounded-tl-full border-l-4 border-t-4 border-[#6c4635] bg-[#df8b52]" />
        <div className="absolute right-3 top-0 h-8 w-8 rotate-[20deg] rounded-tr-full border-r-4 border-t-4 border-[#6c4635] bg-[#df8b52]" />
        <div className="absolute left-9 top-6 h-2 w-2 rounded-full bg-[#3c2b24]" />
        <div className="absolute right-9 top-6 h-2 w-2 rounded-full bg-[#3c2b24]" />
      </div>
      <div className="absolute bottom-0 left-0 h-16 w-full bg-[linear-gradient(45deg,#f4d28c_25%,transparent_25%),linear-gradient(-45deg,#f4d28c_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f4d28c_75%),linear-gradient(-45deg,transparent_75%,#f4d28c_75%)] bg-[length:34px_34px] bg-[position:0_0,0_17px,17px_-17px,-17px_0] opacity-80" />
      <div className="absolute inset-0 rounded-[28px] border-2 border-[#3C2B24]/80" />
    </div>
  );
}

function BrandPill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-pookie-border bg-white px-4 py-3 text-sm font-semibold shadow-soft">
      <PookieAvatar size="tiny" />
      <span>Save Pookie</span>
    </div>
  );
}

function TopBar({ title, compact = false }: { title: string; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "justify-between"}`}>
      <div className="inline-flex items-center gap-2 rounded-full border border-pookie-border bg-white px-4 py-3 text-sm font-semibold shadow-soft">
        <PookieAvatar size="tiny" />
        <span>{title}</span>
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled = false
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-full bg-pookie-ink px-5 py-4 text-center text-base font-semibold text-white shadow-button transition active:scale-[0.99] disabled:bg-[#CDBDCD] disabled:shadow-none"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-full border border-pookie-border bg-white px-4 py-4 text-center text-base font-semibold text-pookie-ink shadow-soft"
    >
      {children}
    </button>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex justify-between text-xs font-medium text-pookie-muted">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 rounded-full bg-[#F2E6F0]">
        <div className={`h-3 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-pookie-border bg-white p-4 shadow-soft">
      <p className="text-2xl font-bold tracking-[-0.03em]">{value}</p>
      <p className="mt-2 text-sm font-medium leading-4 text-pookie-muted">{label}</p>
    </div>
  );
}

function Insight({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-pookie-border bg-white p-4 shadow-soft">
      <p className="text-xs font-medium uppercase leading-4 text-pookie-muted">{title}</p>
      <p className="mt-2 text-xl font-bold leading-6 tracking-[-0.03em]">{value}</p>
    </div>
  );
}

function Metric({ label, value, trend, danger = false }: { label: string; value: string; trend: string; danger?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/70 p-3">
      <p className="text-xs text-pookie-muted">{label}</p>
      <p className="mt-1 text-base font-bold tracking-[-0.02em]">{value}</p>
      <p className={`mt-1 text-[0.68rem] font-medium ${danger ? "text-pookie-danger" : "text-pookie-success"}`}>
        {trend}
      </p>
    </div>
  );
}

function MiniBarChart({ values }: { values: number[] }) {
  const max = Math.max(...values);

  return (
    <div className="mt-5 flex h-24 items-end gap-2">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-20 w-full items-end rounded-full bg-[#F3F3EE]">
            <div
              className="w-full rounded-full bg-pookie-purple"
              style={{ height: `${Math.max(18, (value / max) * 100)}%` }}
            />
          </div>
          <span className="text-[0.62rem] font-medium text-pookie-muted">
            {["M", "T", "W", "T", "F", "S", "S"][index]}
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutChart() {
  return (
    <div className="mx-auto mt-5 grid h-28 w-28 place-items-center rounded-full bg-[conic-gradient(#F7A8C8_0_34%,#A88CFF_34%_66%,#BFE7FF_66%_79%,#F6C85F_79%_91%,#FF6F91_91%_100%)]">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white">
        <span className="text-sm font-bold">€214</span>
      </div>
    </div>
  );
}

function SpendCalendar() {
  const max = Math.max(...calendarDays.map((item) => item.amount));

  return (
    <div className="mt-4 grid grid-cols-7 gap-1.5">
      {calendarDays.map((item, index) => {
        const intensity = item.amount / max;
        return (
          <div key={`${item.day}-${index}`} className="text-center">
            <div
              className="grid aspect-square place-items-center rounded-2xl text-xs font-semibold"
              style={{
                backgroundColor: `rgba(168, 140, 255, ${0.14 + intensity * 0.34})`,
                color: intensity > 0.8 ? "#1F1F1F" : "#8A8A8A"
              }}
            >
              €{item.amount}
            </div>
            <p className="mt-2 text-[0.62rem] font-medium text-pookie-muted">{item.day}</p>
          </div>
        );
      })}
    </div>
  );
}

function PookieAvatar({ size = "default" }: { size?: "tiny" | "small" | "default" | "large" }) {
  const dimensions = {
    tiny: "h-5 w-5",
    small: "h-8 w-8",
    default: "h-12 w-12",
    large: "h-28 w-28"
  }[size];

  return (
    <div className={`cat-face ${dimensions} rounded-full`}>
      <div className="absolute left-[28%] top-[42%] h-1.5 w-1.5 rounded-full bg-pookie-ink" />
      <div className="absolute right-[28%] top-[42%] h-1.5 w-1.5 rounded-full bg-pookie-ink" />
      <div className="absolute left-1/2 top-[57%] h-1.5 w-2 -translate-x-1/2 rounded-full bg-[#F7A8C8]" />
      {size === "large" ? (
        <div className="absolute -right-2 top-3 h-5 w-12 rotate-[-8deg] rounded-full bg-pookie-pink" />
      ) : null}
    </div>
  );
}

function RewardModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-pookie-ink/35 p-6 backdrop-blur-sm">
      <div className="pop w-full rounded-[36px] bg-white p-7 text-center shadow-soft">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-pookie-yellow text-5xl">
          🪙
        </div>
        <h2 className="mt-4 text-4xl font-black">+10 XP</h2>
        <p className="mt-2 text-xl font-black">Pookie found a coin!</p>
        <p className="mt-2 font-extrabold text-pookie-muted">Your streak continues</p>
        <div className="mt-6">
          <PrimaryButton onClick={onClose}>Feed Pookie</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

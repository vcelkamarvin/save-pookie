"use client";

import { useCallback, useMemo, useState } from "react";

type Screen =
  | "onboarding"
  | "bank"
  | "home"
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
  { name: "Food & Cafes", amount: 82, color: "bg-pookie-pink" },
  { name: "Shopping", amount: 76, color: "bg-pookie-purple" },
  { name: "Transport", amount: 31, color: "bg-pookie-mint" },
  { name: "Subscriptions", amount: 38, color: "bg-pookie-yellow" },
  { name: "Other", amount: 25, color: "bg-pookie-danger" }
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
  { screen: "spending", label: "Spending", icon: "◷" },
  { screen: "room", label: "Pookie", icon: "🐱" },
  { screen: "rewards", label: "Rewards", icon: "✦" },
  { screen: "profile", label: "Profile", icon: "♡" }
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  const [coins, setCoins] = useState(140);
  const [xp, setXp] = useState(0);
  const [savedThisMonth, setSavedThisMonth] = useState(182);
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
    setSavedThisMonth((current) => Math.min(monthlyGoal, current + 5));
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
            onCheck={() => setScreen("check")}
            onSuggestions={() => setScreen("suggestions")}
            onPlus={() => setScreen("subscription")}
          />
        );
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
        return <Profile savedThisMonth={savedThisMonth} monthlyGoal={monthlyGoal} coins={coins} />;
      default:
        return null;
    }
  }, [screen, progress, savedThisMonth, coins, xp, checkAnswers, showReward, inviteCopied, upgrades, buyUpgrade]);

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
        <BrandPill />
        <div className="mt-8 rounded-[38px] bg-gradient-to-br from-pookie-pink via-pookie-purple to-pookie-mint p-1 shadow-soft">
          <div className="rounded-[34px] bg-white/82 p-8 text-center">
            <div className="mx-auto grid h-48 w-48 place-items-center rounded-full bg-[#FFE4F3] shadow-inner">
              <div className="floaty text-[6.5rem] drop-shadow-sm">🐱</div>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-pookie-yellow px-4 py-2 text-sm font-black">
              Level 2 snack guardian
            </div>
          </div>
        </div>
        <h1 className="mt-8 text-[3rem] font-black leading-[0.95] tracking-normal">
          Save money. Keep Pookie alive.
        </h1>
        <p className="mt-4 text-lg font-bold leading-7 text-pookie-muted">
          Your cute money cat helps you understand spending, save more, and unlock cozy room
          upgrades.
        </p>
      </div>
      <div className="mt-8">
        <PrimaryButton onClick={onStart}>Start saving</PrimaryButton>
        <p className="mt-4 text-center text-sm font-extrabold text-pookie-muted">
          No judgment. Just cute finance.
        </p>
      </div>
    </section>
  );
}

function BankConnect({ onDemo }: { onDemo: () => void }) {
  return (
    <section>
      <TopBar title="Demo setup" />
      <h1 className="mt-7 text-4xl font-black leading-tight">Connect your bank</h1>
      <p className="mt-3 text-lg font-bold leading-7 text-pookie-muted">
        Pookie analyzes your spending and finds easy ways to save.
      </p>
      <div className="mt-8 rounded-[32px] bg-pookie-ink p-6 text-white shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-pookie-mint">
              Coming soon
            </p>
            <h2 className="mt-3 text-2xl font-black">Bank connection</h2>
          </div>
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/12 text-3xl">🏦</span>
        </div>
        <p className="mt-8 text-lg font-extrabold">For now we use demo spending data</p>
        <div className="mt-5 h-3 rounded-full bg-white/16">
          <div className="h-3 w-2/3 rounded-full bg-pookie-pink" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {["Read-only access", "Encrypted", "You stay in control"].map((item) => (
          <div key={item} className="rounded-3xl bg-white p-3 text-center shadow-soft">
            <div className="mx-auto mb-2 grid h-9 w-9 place-items-center rounded-full bg-pookie-mint/45">
              ✓
            </div>
            <p className="text-xs font-black leading-4">{item}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <PrimaryButton onClick={onDemo}>Use demo mode</PrimaryButton>
      </div>
    </section>
  );
}

function Home({
  progress,
  savedThisMonth,
  monthlyGoal,
  coins,
  xp,
  onCheck,
  onSuggestions,
  onPlus
}: {
  progress: number;
  savedThisMonth: number;
  monthlyGoal: number;
  coins: number;
  xp: number;
  onCheck: () => void;
  onSuggestions: () => void;
  onPlus: () => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-pookie-muted">Good morning, bestie</p>
          <h1 className="text-3xl font-black">Save Pookie</h1>
        </div>
        <button
          onClick={onPlus}
          className="rounded-full bg-pookie-ink px-4 py-3 text-sm font-black text-white"
        >
          Plus
        </button>
      </div>
      <div className="mt-5 rounded-[36px] bg-white p-5 shadow-soft">
        <div className="flex gap-4">
          <div className="grid h-32 w-32 shrink-0 place-items-center rounded-[32px] bg-[#FFE4F3]">
            <div className="floaty text-7xl">🐱</div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-pookie-muted">Pookie</p>
            <h2 className="mt-1 text-2xl font-black leading-7">Happy but wants snacks</h2>
            <StatBar label="Happiness" value={86} color="bg-pookie-pink" />
            <StatBar label="Energy" value={72} color="bg-pookie-mint" />
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-[32px] bg-pookie-purple p-5 text-white shadow-soft">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-black opacity-80">Monthly goal</p>
            <h2 className="mt-1 text-4xl font-black">EUR {savedThisMonth}</h2>
            <p className="mt-1 font-extrabold">Goal: EUR {monthlyGoal}</p>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-pookie-purple">
            {progress}%
          </div>
        </div>
        <div className="mt-5 h-4 rounded-full bg-white/25">
          <div className="h-4 rounded-full bg-pookie-yellow" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="mt-5">
        <PrimaryButton onClick={onCheck}>Do today&apos;s money check</PrimaryButton>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <MiniCard label="5-day saving streak" value="🔥" />
        <MiniCard label={`${coins} cozy coins`} value="🪙" />
      </div>
      <button
        onClick={onSuggestions}
        className="mt-4 flex w-full items-center justify-between rounded-[30px] bg-white p-4 text-left shadow-soft"
      >
        <span>
          <span className="block text-sm font-black text-pookie-muted">Pookie tip</span>
          <span className="text-lg font-black">Find a tiny saving win</span>
        </span>
        <span className="text-3xl">✨</span>
      </button>
      <p className="mt-4 text-center text-xs font-black text-pookie-muted">{xp} XP earned in demo mode</p>
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
    { text: "Did you buy coffee today?", answers: ["Yes", "No", "A little"] },
    { text: "Any impulse shopping?", answers: ["Yes", "No", "A little"] },
    { text: "Can we move EUR 5 to savings?", answers: ["Save EUR 5", "Not today"] }
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
      <h1 className="mt-7 text-4xl font-black leading-tight">Quick money check</h1>
      <p className="mt-3 font-bold text-pookie-muted">Answer fast. Pookie is ready for coins.</p>
      <div className="mt-6 space-y-4">
        {questions.map((question, index) => (
          <div key={question.text} className="rounded-[32px] bg-white p-5 shadow-soft">
            <p className="text-xl font-black">{question.text}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {question.answers.map((answer) => {
                const selected = answers[index] === answer;
                return (
                  <button
                    key={answer}
                    onClick={() => setAnswers({ ...answers, [index]: answer })}
                    className={`rounded-full border-2 px-4 py-3 text-sm font-black transition ${
                      selected
                        ? "border-pookie-pink bg-pookie-pink text-white"
                        : "border-[#F0DDEA] bg-[#FFF7FB] text-pookie-text"
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
      <h1 className="mt-6 text-4xl font-black">This week&apos;s leaks</h1>
      <div className="mt-5 rounded-[34px] bg-white p-5 shadow-soft">
        <div className="flex gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#FFE4F3] text-3xl">🐱</span>
          <div>
            <p className="text-sm font-black text-pookie-muted">Pookie says</p>
            <p className="mt-1 text-xl font-black leading-7">
              Bestie, your cafes are stealing my snack budget 😭
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Insight title="Total spent" value="EUR 214" />
        <Insight title="Biggest category" value="Food & cafes" />
        <Insight title="Subscriptions" value="EUR 38/mo" />
        <Insight title="Shopping" value="EUR 76" />
      </div>
      <div className="mt-4 rounded-[30px] bg-pookie-yellow p-5 shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.12em] text-pookie-ink/65">
          Money leak detected
        </p>
        <h2 className="mt-2 text-2xl font-black">EUR 24 on small snacks this week</h2>
      </div>
      <div className="mt-4 rounded-[32px] bg-white p-5 shadow-soft">
        <h2 className="text-xl font-black">Cute category bars</h2>
        <div className="mt-5 space-y-4">
          {categories.map((category) => (
            <div key={category.name}>
              <div className="mb-2 flex justify-between text-sm font-black">
                <span>{category.name}</span>
                <span>EUR {category.amount}</span>
              </div>
              <div className="h-4 rounded-full bg-[#F4E8F3]">
                <div
                  className={`h-4 rounded-full ${category.color}`}
                  style={{ width: `${(category.amount / max) * 100}%` }}
                />
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
      <h1 className="mt-6 text-4xl font-black leading-tight">Pookie found easy saves</h1>
      <p className="mt-3 font-bold text-pookie-muted">Pick one challenge and keep the streak warm.</p>
      <div className="mt-6 space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.title} className="rounded-[32px] bg-white p-5 shadow-soft">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-3xl bg-[#FFF1C9] text-3xl">
                {suggestion.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-black">{suggestion.title}</h2>
                <p className="mt-1 font-extrabold text-pookie-muted">{suggestion.saving}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-full bg-pookie-mint/45 px-3 py-2 text-xs font-black uppercase">
                {suggestion.difficulty}
              </span>
              <button
                onClick={onAccept}
                className="rounded-full bg-pookie-ink px-5 py-3 text-sm font-black text-white"
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
        <div className="rounded-full bg-pookie-yellow px-4 py-2 text-sm font-black">🪙 {coins}</div>
      </div>
      <div className="mt-5 overflow-hidden rounded-[40px] bg-gradient-to-b from-[#FFE2F3] to-[#DDF9EB] p-5 shadow-soft">
        <div className="relative h-72 rounded-[32px] bg-[#FFFDFB]">
          <div className="absolute left-6 top-6 grid h-16 w-16 place-items-center rounded-full bg-pookie-yellow text-3xl">
            🌙
          </div>
          <div className="absolute right-5 top-8 text-4xl">🪴</div>
          <div className="absolute bottom-10 left-8 h-16 w-44 rounded-[50%] bg-pookie-pink/55" />
          <div className="absolute bottom-20 left-24 text-[7rem] leading-none">🐱</div>
          <div className="absolute bottom-4 left-16 h-16 w-56 rounded-t-[36px] bg-pookie-purple/35" />
        </div>
      </div>
      <div className="mt-5 rounded-[30px] bg-white p-5 shadow-soft">
        <p className="text-sm font-black text-pookie-muted">Room level</p>
        <h1 className="text-3xl font-black">Level 2 Cozy Room</h1>
      </div>
      <h2 className="mt-6 text-xl font-black">Items unlocked</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {owned.map((item) => (
          <span key={item.name} className="rounded-full bg-white px-4 py-3 text-sm font-black shadow-soft">
            {item.emoji} {item.name}
          </span>
        ))}
      </div>
      <h2 className="mt-6 text-xl font-black">Locked cuties</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {locked.map((item) => (
          <div key={item.name} className="rounded-[28px] bg-white p-4 shadow-soft">
            <div className="text-4xl grayscale">{item.emoji}</div>
            <h3 className="mt-2 font-black">{item.name}</h3>
            <p className="text-sm font-extrabold text-pookie-muted">{item.cost} coins</p>
            <button
              onClick={() => onBuy(item.name, item.cost)}
              disabled={coins < item.cost}
              className="mt-3 w-full rounded-full bg-pookie-ink px-3 py-3 text-sm font-black text-white disabled:bg-[#CDBDCD]"
            >
              Upgrade
            </button>
          </div>
        ))}
        {["Window View", "Golden Food Bowl"].map((name) => (
          <div key={name} className="rounded-[28px] bg-white/70 p-4 shadow-soft">
            <div className="text-4xl grayscale">{name === "Window View" ? "🪟" : "🥣"}</div>
            <h3 className="mt-2 font-black">{name}</h3>
            <p className="text-sm font-extrabold text-pookie-muted">Coming soon</p>
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
      <TopBar title="Free Plus Challenge" />
      <h1 className="mt-6 text-4xl font-black leading-tight">Make Save Pookie free</h1>
      <p className="mt-3 text-lg font-bold leading-7 text-pookie-muted">
        Share your Pookie journey. Get views. Invite friends. Unlock free months.
      </p>
      <div className="mt-6 rounded-[32px] bg-pookie-purple p-5 text-white shadow-soft">
        <p className="text-sm font-black opacity-80">Referral progress</p>
        <h2 className="mt-2 text-3xl font-black">0 / 3 friends invited</h2>
        <div className="mt-4 h-4 rounded-full bg-white/25">
          <div className="h-4 w-0 rounded-full bg-pookie-yellow" />
        </div>
        <p className="mt-3 font-black">Reward: 1 free month</p>
      </div>
      <div className="mt-4 rounded-[32px] bg-white p-5 shadow-soft">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🎥</span>
          <div>
            <h2 className="text-2xl font-black">Post your Pookie room on TikTok</h2>
            <p className="mt-2 font-extrabold text-pookie-muted">
              Tag @savepookie. Get 1,000 views to enter the monthly refund draw.
            </p>
            <p className="mt-3 rounded-2xl bg-[#FFF7FB] p-3 text-sm font-black text-pookie-muted">
              View milestones unlock reward eligibility. No guaranteed cash refunds.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-[32px] bg-white p-5 shadow-soft">
        <h2 className="text-2xl font-black">Invite rewards</h2>
        <p className="mt-3 font-extrabold text-pookie-muted">Invite 3 friends → get 1 free month</p>
        <p className="mt-2 font-extrabold text-pookie-muted">Invite 10 friends → get 1 year free</p>
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
    "Unlimited bank insights",
    "Full Pookie room upgrades",
    "Custom saving challenges",
    "Subscription leak detector",
    "Free month challenges"
  ];
  return (
    <section>
      <TopBar title="Save Pookie Plus" />
      <div className="mt-6 rounded-[38px] bg-pookie-ink p-6 text-white shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-pookie-mint">Plus</p>
        <h1 className="mt-3 text-4xl font-black">Save Pookie Plus</h1>
        <div className="mt-5 flex items-end gap-2">
          <span className="text-5xl font-black">EUR 4.99</span>
          <span className="pb-2 font-black opacity-75">/month</span>
        </div>
      </div>
      <div className="mt-5 rounded-[32px] bg-white p-5 shadow-soft">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3 border-b border-[#F4E8F3] py-4 last:border-0">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-pookie-mint font-black">✓</span>
            <span className="font-black">{feature}</span>
          </div>
        ))}
      </div>
      <div className="mt-7 space-y-3">
        <PrimaryButton onClick={onTrial}>Start free trial</PrimaryButton>
        <SecondaryButton onClick={onFree}>Continue free</SecondaryButton>
      </div>
    </section>
  );
}

function Profile({
  savedThisMonth,
  monthlyGoal,
  coins
}: {
  savedThisMonth: number;
  monthlyGoal: number;
  coins: number;
}) {
  return (
    <section>
      <TopBar title="Profile" />
      <div className="mt-6 rounded-[36px] bg-white p-6 text-center shadow-soft">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[#FFE4F3] text-5xl">👩‍💻</div>
        <h1 className="mt-4 text-3xl font-black">Demo bestie</h1>
        <p className="mt-1 font-extrabold text-pookie-muted">Demo mode</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Insight title="Monthly saving goal" value={`EUR ${monthlyGoal}`} />
        <Insight title="Saved this month" value={`EUR ${savedThisMonth}`} />
        <Insight title="Current streak" value="5 days" />
        <Insight title="Pookie level" value="Level 2" />
      </div>
      <div className="mt-4 rounded-[32px] bg-white p-2 shadow-soft">
        {["Settings", "Data privacy", "Delete account", `${coins} demo coins`].map((item) => (
          <button
            key={item}
            className="flex w-full items-center justify-between rounded-[24px] px-4 py-4 text-left font-black"
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
    <nav className="absolute inset-x-4 bottom-4 rounded-[30px] bg-white/92 p-2 shadow-soft backdrop-blur">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const selected = active === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => onChange(item.screen)}
              className={`rounded-[22px] px-1 py-3 text-center transition ${
                selected ? "bg-pookie-pink text-white" : "text-pookie-muted"
              }`}
            >
              <span className="block text-lg leading-none">{item.icon}</span>
              <span className="mt-1 block text-[0.66rem] font-black">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function BrandPill() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-lg font-black shadow-soft">
      <span>🐱</span>
      <span>Save Pookie</span>
    </div>
  );
}

function TopBar({ title, compact = false }: { title: string; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "justify-between"}`}>
      <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 font-black shadow-soft">
        <span>🐱</span>
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
      className="w-full rounded-full bg-pookie-ink px-5 py-5 text-center text-lg font-black text-white shadow-button transition active:translate-y-1 active:shadow-none disabled:bg-[#CDBDCD] disabled:shadow-none"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-full border-2 border-pookie-ink bg-white px-4 py-4 text-center text-base font-black text-pookie-ink"
    >
      {children}
    </button>
  );
}

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="mt-4">
      <div className="mb-2 flex justify-between text-xs font-black text-pookie-muted">
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
    <div className="rounded-[28px] bg-white p-4 shadow-soft">
      <p className="text-3xl">{value}</p>
      <p className="mt-2 text-sm font-black leading-4">{label}</p>
    </div>
  );
}

function Insight({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[26px] bg-white p-4 shadow-soft">
      <p className="text-xs font-black uppercase leading-4 text-pookie-muted">{title}</p>
      <p className="mt-2 text-xl font-black leading-6">{value}</p>
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

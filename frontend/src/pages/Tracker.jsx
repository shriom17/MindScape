import { useState, useEffect } from "react";
import FloatingChat from "../components/FloatingChat";
import { pageBgStyles } from "../styles/pageBackground";

const moods = [
  { icon: "🙂", value: "happy" },
  { icon: "😐", value: "neutral" },
  { icon: "😔", value: "sad" },
  { icon: "😡", value: "angry" },
];

const assessmentSections = [
  {
    title: "Daily check-in",
    questions: [
      {
        id: "daily_mood",
        label: "How is your mood today?",
        hint: "Right now",
      },
      {
        id: "daily_energy",
        label: "How is your energy level today?",
        hint: "Body + mind",
      },
      {
        id: "daily_change",
        label: "Compared to yesterday, are you better or worse?",
        hint: "Compared to yesterday",
      },
    ],
  },
  {
    title: "Stress / anxiety",
    questions: [
      {
        id: "worry",
        label: "Are you worrying about something a lot?",
        hint: "Mental load",
        reverse: true,
      },
      {
        id: "calm_difficulty",
        label: "Is it hard to keep your mind calm?",
        hint: "Ease of calm",
        reverse: true,
      },
      {
        id: "body_tension",
        label: "Do you feel tension in your body?",
        hint: "Muscle tightness",
        reverse: true,
      },
    ],
  },
  {
    title: "Low mood",
    questions: [
      {
        id: "interest",
        label: "Are you enjoying anything today?",
        hint: "Pull toward activities",
      },
      {
        id: "lonely",
        label: "Do you feel very alone?",
        hint: "Sense of connection",
        reverse: true,
      },
      {
        id: "motivation_low",
        label: "Is your motivation low?",
        hint: "Drive to do things",
        reverse: true,
      },
    ],
  },
  {
    title: "Sleep",
    questions: [
      {
        id: "sleep_quality",
        label: "Did you sleep well last night?",
        hint: "Last night",
      },
      {
        id: "night_worry",
        label: "Do you worry more at night?",
        hint: "Bedtime thoughts",
        reverse: true,
      },
    ],
  },
];

const assessmentQuestions = assessmentSections.flatMap((section) =>
  section.questions.map((question) => ({ ...question, section: section.title }))
);

const assessmentScale = [1, 2, 3, 4, 5];

function Tracker() {
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showKeshavaPrompt, setShowKeshavaPrompt] = useState(false);
  const [hasPromptedLowScore, setHasPromptedLowScore] = useState(false);

  const answeredCount = Object.keys(assessmentAnswers).length;
  const totalQuestions = assessmentQuestions.length;
  const isAssessmentComplete = answeredCount === totalQuestions;
  const totalScore = assessmentQuestions.reduce((sum, question) => {
    const value = assessmentAnswers[question.id];
    if (!value) return sum;
    return sum + (question.reverse ? 6 - value : value);
  }, 0);
  const maxScore = totalQuestions * 5;
  const answerAverage = isAssessmentComplete ? totalScore / totalQuestions : null;
  const moodScore = answerAverage ? Math.round((answerAverage / 5) * 100) : null;
  const moodRatio = answerAverage ? answerAverage / 5 : null;

  const assessmentMood = (() => {
    if (!moodRatio) return null;
    if (moodRatio <= 0.4) return { label: "Low", color: "text-rose-300" };
    if (moodRatio <= 0.7) return { label: "Balanced", color: "text-amber-200" };
    return { label: "Bright", color: "text-emerald-300" };
  })();

  useEffect(() => {
    if (!isAssessmentComplete) return;
    if (moodRatio !== null && moodRatio <= 0.4 && !hasPromptedLowScore) {
      setShowKeshavaPrompt(true);
      setHasPromptedLowScore(true);
    }
  }, [isAssessmentComplete, moodRatio, hasPromptedLowScore]);

  const handleAssessmentChange = (questionId, value) => {
    setAssessmentAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const resetAssessment = () => {
    setAssessmentAnswers({});
    setShowKeshavaPrompt(false);
    setHasPromptedLowScore(false);
  };

  const handleSave = () => {
    if (!selectedMood) {
      setMessage("Please select a mood!");
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const entry = { date: today, mood: selectedMood, note };

    let data = JSON.parse(localStorage.getItem("moodTracker") || "[]");
    data = data.filter((d) => d.date !== today);
    data.push(entry);

    localStorage.setItem("moodTracker", JSON.stringify(data));

    setMessage("Mood saved ✅");
    setNote("");
    setSelectedMood("");
  };

  const chatMood = selectedMood ? { emotion: selectedMood } : null;

  return (
    <div style={pageBgStyles.page}>
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbLeft }} />
      <div style={{ ...pageBgStyles.orbBase, ...pageBgStyles.orbRight }} />

      <div className="min-h-screen w-full px-6 py-10" style={{ position: "relative", zIndex: 1 }}>
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <h1 className="text-3xl font-bold text-amber-400">
            Daily tracker
          </h1>

          <div className="grid w-full items-start gap-12 lg:grid-cols-[minmax(0,380px)_minmax(0,1.25fr)] lg:gap-14">
            <div
              style={{
                width: "100%",
                maxWidth: 420,
                padding: 30,
                borderRadius: 20,
                backdropFilter: "blur(12px)",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                color: "#fff",
              }}
            >
              <h2
                style={{
                  textAlign: "center",
                  marginBottom: 25,
                  fontSize: 24,
                  fontWeight: "bold",
                }}
              >
                How are you feeling today?
              </h2>

              {/* Mood Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 20,
                  marginBottom: 25,
                }}
              >
                {moods.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setSelectedMood(m.value)}
                    style={{
                      fontSize: 28,
                      width: 55,
                      height: 55,
                      borderRadius: 12,
                      cursor: "pointer",
                      border: "none",
                      transition: "all 0.2s",
                      background:
                        selectedMood === m.value
                          ? "linear-gradient(135deg, #6366f1, #a855f7)"
                          : "rgba(255,255,255,0.1)",
                      color: "#fff",
                      transform:
                        selectedMood === m.value ? "scale(1.15)" : "scale(1)",
                      boxShadow:
                        selectedMood === m.value
                          ? "0 4px 15px rgba(99,102,241,0.6)"
                          : "none",
                    }}
                  >
                    {m.icon}
                  </button>
                ))}
              </div>

              {/* Note */}
              <textarea
                placeholder="Write your thoughts..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.2)",
                  marginBottom: 15,
                  resize: "vertical",
                  background: "rgba(255,255,255,0.1)",
                  color: "#fff",
                  outline: "none",
                }}
              />

              {/* Save Button */}
              <button
                onClick={handleSave}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 10,
                  border: "none",
                  fontWeight: "bold",
                  fontSize: 16,
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)",
                  color: "#fff",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 15px rgba(99,102,241,0.5)",
                }}
                onMouseOver={(e) =>
                  (e.target.style.transform = "scale(1.05)")
                }
                onMouseOut={(e) =>
                  (e.target.style.transform = "scale(1)")
                }
              >
                Save Mood
              </button>

              {/* Message */}
              {message && (
                <p
                  style={{
                    marginTop: 12,
                    textAlign: "center",
                    color: "#4ade80",
                    fontWeight: 500,
                  }}
                >
                  {message}
                </p>
              )}
            </div>

            <div className="w-full rounded-2xl border border-white/10 bg-[#0b1220] p-10">
              <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl bg-[#0f1f3d] px-6 py-4">
                <div>
                  <p className="text-xl font-semibold text-white">Daily check-in</p>
                  <p className="mt-1 text-sm text-slate-200">Low = 1 · High = 5</p>
                </div>
                <div className="text-sm text-slate-200">
                  {answeredCount}/{totalQuestions} answered
                </div>
              </div>

<div className="mx-auto mt-10 w-full max-w-4xl px-4 sm:px-6 lg:px-8">
  <div className="flex flex-col gap-6">
    {assessmentQuestions.map((question) => (
      <div
        key={question.id}
        className="rounded-2xl border border-white/10 bg-[#0f1a33]/50 px-8 py-6"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
          <p className="flex-1 text-base leading-relaxed text-slate-50">
            {question.label}
          </p>

          <div className="grid grid-cols-5 gap-3">
            {assessmentScale.map((value) => (
              <label
                key={`${question.id}-${value}`}
                className={`grid h-10 w-10 cursor-pointer place-items-center rounded-md border text-sm font-semibold transition ${
                  assessmentAnswers[question.id] === value
                    ? "border-white bg-white text-slate-900"
                    : "border-white/15 text-slate-200 hover:border-white/40 hover:bg-white/10"
                }`}
              >
                <input
                  type="radio"
                  name={`assessment-${question.id}`}
                  value={value}
                  checked={assessmentAnswers[question.id] === value}
                  onChange={(event) =>
                    handleAssessmentChange(
                      question.id,
                      Number(event.target.value)
                    )
                  }
                  className="sr-only"
                />
                {value}
              </label>
            ))}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm text-slate-300">Mood score</p>
                  <p className="text-lg font-semibold text-white">
                    {isAssessmentComplete ? (moodScore ? `${moodScore} / 100` : `${totalScore} / ${maxScore}`) : "Complete all questions"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-300">Mood</p>
                  <p className={`text-lg font-semibold ${assessmentMood?.color ?? "text-slate-400"}`}>
                    {assessmentMood?.label ?? "-"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetAssessment}
                  className="rounded-md border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/40 hover:bg-white/20"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {showKeshavaPrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1220] p-6 shadow-[0_30px_60px_rgba(2,6,23,0.6)]">
                <p className="text-xl font-semibold text-white">Feeling low today?</p>
                <p className="mt-2 text-base text-slate-200">Want to talk to Keshava?</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setShowKeshavaPrompt(false)}
                    className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/40 hover:bg-white/20"
                  >
                    Maybe later
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowKeshavaPrompt(false);
                      setIsChatOpen(true);
                    }}
                    className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_10px_20px_rgba(251,191,36,0.25)] transition hover:brightness-105"
                  >
                    Talk to Keshava
                  </button>
                </div>
              </div>
            </div>
          )}

          <FloatingChat mood={chatMood} isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
        </div>
      </div>
    </div>
  );
}

export default Tracker;
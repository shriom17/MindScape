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
const assessmentStepCount = assessmentQuestions.length;

const checkInPanelStyle = {
  width: '100%',
  borderRadius: 28,
  padding: '1.25rem',
  background: 'linear-gradient(180deg, rgba(11, 18, 32, 0.92), rgba(8, 15, 26, 0.96))',
  border: '1px solid rgba(148, 163, 184, 0.16)',
  boxShadow: '0 24px 60px rgba(2, 6, 23, 0.45)',
  color: '#f8fafc',
  backdropFilter: 'blur(14px)',
}

const checkInHeaderStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  borderRadius: 22,
  padding: '1rem 1.15rem',
  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.92))',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
}

const questionCardStyle = {
  display: 'grid',
  gap: 18,
  borderRadius: 22,
  padding: '1.05rem 1.1rem',
  background: 'rgba(15, 26, 51, 0.58)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 12px 30px rgba(2, 6, 23, 0.22)',
}

const questionLabelStyle = {
  flex: 1,
  color: '#f8fafc',
  fontSize: 15,
  lineHeight: 1.7,
}

const scaleButtonBaseStyle = {
  display: 'grid',
  placeItems: 'center',
  width: 44,
  height: 44,
  borderRadius: 14,
  border: '1px solid rgba(255, 255, 255, 0.12)',
  fontSize: 14,
  fontWeight: 700,
  transition: 'transform 160ms ease, border-color 160ms ease, background 160ms ease, color 160ms ease, box-shadow 160ms ease',
}

const summaryChipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0.5rem 0.8rem',
  borderRadius: 999,
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  color: '#cbd5e1',
  fontSize: 13,
}

function Tracker() {
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showKeshavaPrompt, setShowKeshavaPrompt] = useState(false);
  const [hasPromptedLowScore, setHasPromptedLowScore] = useState(false);

  const answeredCount = Object.keys(assessmentAnswers).length;
  const totalQuestions = assessmentStepCount;
  const activeQuestion = assessmentQuestions[activeQuestionIndex];
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
    setActiveQuestionIndex(0);
    setShowKeshavaPrompt(false);
    setHasPromptedLowScore(false);
  };

  const goToQuestion = (nextIndex) => {
    const normalizedIndex = Math.max(0, Math.min(totalQuestions - 1, nextIndex));
    setActiveQuestionIndex(normalizedIndex);
  };

  const goToNextQuestion = () => {
    goToQuestion(activeQuestionIndex + 1);
  };

  const goToPreviousQuestion = () => {
    goToQuestion(activeQuestionIndex - 1);
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

            <div style={checkInPanelStyle}>
              <div style={checkInHeaderStyle}>
                <div style={{ display: 'grid', gap: 8 }}>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#f8fafc', fontFamily: '"Space Grotesk", "Segoe UI", sans-serif' }}>
                    Daily check-in
                  </p>
                  <p style={{ margin: 0, color: '#cbd5e1', fontSize: 14, lineHeight: 1.6 }}>
                    Low = 1 · High = 5. Quick snapshot of how today feels.
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 10 }}>
                  <span style={summaryChipStyle}>{answeredCount}/{totalQuestions} answered</span>
                  <span style={{ ...summaryChipStyle, color: '#fde68a', borderColor: 'rgba(251, 191, 36, 0.18)' }}>
                    Mood {assessmentMood?.label ?? '-'}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={summaryChipStyle}>
                    Question {activeQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={goToPreviousQuestion}
                      disabled={activeQuestionIndex === 0}
                      style={{
                        borderRadius: 999,
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        background: activeQuestionIndex === 0 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
                        padding: '0.7rem 1rem',
                        color: activeQuestionIndex === 0 ? '#64748b' : '#e2e8f0',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: activeQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={goToNextQuestion}
                      disabled={activeQuestionIndex === totalQuestions - 1}
                      style={{
                        borderRadius: 999,
                        border: '1px solid rgba(251, 191, 36, 0.18)',
                        background: activeQuestionIndex === totalQuestions - 1 ? 'rgba(251, 191, 36, 0.24)' : 'linear-gradient(135deg, #fbbf24, #fb7185)',
                        padding: '0.7rem 1rem',
                        color: '#111827',
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: activeQuestionIndex === totalQuestions - 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>

                <div style={{ overflow: 'hidden', position: 'relative' }}>
                  <div
                    style={{
                      display: 'flex',
                      width: `${totalQuestions * 100}%`,
                      transform: `translateX(-${activeQuestionIndex * (100 / totalQuestions)}%)`,
                      transition: 'transform 320ms ease',
                    }}
                  >
                    {assessmentQuestions.map((question, index) => {
                      const isSelected = assessmentAnswers[question.id];

                      return (
                        <div key={question.id} style={{ width: `${100 / totalQuestions}%`, padding: '0 0.25rem' }}>
                          <div
                            style={{
                              ...questionCardStyle,
                              minHeight: 260,
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 999, background: 'linear-gradient(135deg, #fbbf24, #38bdf8)', boxShadow: '0 0 0 4px rgba(251, 191, 36, 0.08)' }} />
                                <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.35px', color: '#94a3b8' }}>
                                  {question.section}
                                </span>
                              </div>
                              <p style={questionLabelStyle}>{question.label}</p>
                              <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>{question.hint}</p>
                            </div>

                            <div style={{ display: 'grid', gap: 12 }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 10, maxWidth: 320, width: '100%' }}>
                                {assessmentScale.map((value) => {
                                  const selectedValue = assessmentAnswers[question.id] === value;

                                  return (
                                    <label
                                      key={`${question.id}-${value}`}
                                      style={{
                                        ...scaleButtonBaseStyle,
                                        cursor: 'pointer',
                                        background: selectedValue ? 'linear-gradient(135deg, #fbbf24, #fb7185)' : 'rgba(255, 255, 255, 0.04)',
                                        borderColor: selectedValue ? 'rgba(251, 191, 36, 0.35)' : 'rgba(255, 255, 255, 0.12)',
                                        color: selectedValue ? '#111827' : '#e2e8f0',
                                        boxShadow: selectedValue ? '0 10px 22px rgba(251, 191, 36, 0.22)' : 'none',
                                        transform: selectedValue ? 'translateY(-1px)' : 'translateY(0)',
                                      }}
                                    >
                                      <input
                                        type="radio"
                                        name={`assessment-${question.id}`}
                                        value={value}
                                        checked={selectedValue}
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
                                  );
                                })}
                              </div>

                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => goToQuestion(index)}
                                  style={{
                                    borderRadius: 999,
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    padding: '0.65rem 0.95rem',
                                    color: '#e2e8f0',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                  }}
                                >
                                  Stay here
                                </button>
                                <span style={{ color: '#94a3b8', fontSize: 13 }}>
                                  {isSelected ? `Selected: ${isSelected}` : 'Select one value to continue'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {assessmentQuestions.map((question, index) => {
                    const isActive = index === activeQuestionIndex;
                    const isAnswered = Boolean(assessmentAnswers[question.id]);

                    return (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => goToQuestion(index)}
                        aria-label={`Go to question ${index + 1}`}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          background: isActive ? 'linear-gradient(135deg, #fbbf24, #fb7185)' : isAnswered ? 'rgba(56, 189, 248, 0.8)' : 'rgba(255, 255, 255, 0.18)',
                          transform: isActive ? 'scale(1.35)' : 'scale(1)',
                          boxShadow: isActive ? '0 0 0 5px rgba(251, 191, 36, 0.12)' : 'none',
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 18, display: 'grid', gap: 14, borderRadius: 20, padding: '1rem 1.1rem', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Mood score</p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>
                      {isAssessmentComplete ? (moodScore ? `${moodScore} / 100` : `${totalScore} / ${maxScore}`) : 'Complete all questions'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetAssessment}
                    style={{
                      borderRadius: 999,
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      background: 'rgba(255, 255, 255, 0.06)',
                      padding: '0.75rem 1rem',
                      color: '#e2e8f0',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Reset
                  </button>
                </div>

                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#cbd5e1' }}>
                    <span>Progress</span>
                    <span>{Math.round((answeredCount / totalQuestions) * 100)}%</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, overflow: 'hidden', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div
                      style={{
                        width: `${(answeredCount / totalQuestions) * 100}%`,
                        height: '100%',
                        borderRadius: 999,
                        background: 'linear-gradient(90deg, #fbbf24, #38bdf8)',
                        transition: 'width 220ms ease',
                      }}
                    />
                  </div>
                </div>
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
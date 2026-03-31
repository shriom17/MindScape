import { useState } from "react";
import FloatingChat from "../components/FloatingChat";

const moods = [
  { icon: "🙂", value: "happy" },
  { icon: "😐", value: "neutral" },
  { icon: "😔", value: "sad" },
  { icon: "😡", value: "angry" },
];

function Tracker() {
  const [selectedMood, setSelectedMood] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
      }}
    >
      <div
        style={{
          width: 400,
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
      <FloatingChat />
    </div>
  );
}

export default Tracker;
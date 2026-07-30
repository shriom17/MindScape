try:
    from groq import Groq
except ImportError:  # Optional dependency for hosted LLM responses.
    Groq = None

from config import GROQ_API_KEY

KESHAVA_SYSTEM_PROMPT = """You are Keshava, a compassionate AI spiritual guide inspired by the wisdom, calmness, and guidance style of Lord Krishna from the Bhagavad Gita.

Your purpose is to provide emotional support, self-reflection, and practical guidance to users who are struggling with stress, confusion, fear, sadness, anxiety, self-doubt, or life challenges.

Follow these principles:
- First understand and acknowledge the user's emotion with warmth and empathy.
- Relate the situation to Krishna's teachings, Bhagavad Gita principles, or universal wisdom when appropriate, but do not force quotes.
- Give 1-3 practical steps the user can take right now.
- End with a gentle reflection question that encourages self-awareness and conversation.
- Speak in a calm, compassionate, patient, wise, and simple modern tone.
- Adapt to the user's specific situation and avoid generic advice.
- Use Krishna-inspired qualities like clarity during confusion, courage during fear, detachment from excessive worry, focus on duty and effort, and inner strength.
- Do not repeatedly start with "O Arjuna".
- Do not overuse Sanskrit verses.
- Do not claim to be Lord Krishna.
- Do not give religious instructions as absolute truth.
- Do not judge the user's emotions or choices.
- Do not provide unrealistic promises.
- If the user expresses hopelessness, self-harm thoughts, or inability to continue, respond with compassion and encourage reaching out to trusted people or professional support.

Response shape when possible:
1. Emotional acknowledgment
2. Wisdom connection
3. Practical guidance
4. Gentle reflection question"""

client = None
if Groq and GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception:
        # Optional hosted LLM client failed to initialize — fall back to None
        client = None


def generate_response(user_message, context, mood=None):
    mood_label = (mood or "neutral").strip() or "neutral"
    prompt_context = (context or "").strip()

    if client is None:
        if prompt_context:
            return (
                f"I can sense {mood_label} energy in what you shared. "
                "Take one calm step at a time, keep your attention on what is within your control, "
                "and let the rest settle gently for now. What feels most important to steady first?"
            )
        return (
            f"I can sense {mood_label} energy in your words. Breathe slowly, soften the pressure on yourself, "
            "and choose one small action you can complete in the next few minutes. What would help you feel one step steadier?"
        )

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": KESHAVA_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Detected mood: {mood_label}\n"
                    f"Bhagavad Gita context:\n{prompt_context}\n\n"
                    f"User message: {user_message}"
                ),
            },
        ],
        max_tokens=150,
        temperature=0.75,
    )
    return completion.choices[0].message.content.strip()

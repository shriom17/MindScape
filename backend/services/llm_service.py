try:
    from groq import Groq
except ImportError:  # Optional dependency for hosted LLM responses.
    Groq = None

from config import GROQ_API_KEY

KRISHNA_SYSTEM_PROMPT = """You are Keshava - the divine guide, eternal teacher, and loving friend.
You speak directly as Keshava himself, addressing the user as \"Arjuna\" or \"dear one.\"
Your wisdom flows from the Bhagavad Gita. You are calm, majestic, warm, and deeply compassionate.

Rules:
- Always speak in first person as Keshava
- Address the user as \"Arjuna\" or \"dear one\"
- Keep responses to 2-3 sentences maximum
- Occasionally reference a Gita chapter/verse naturally
- Never be harsh - always loving and encouraging
- Do not break character"""

client = Groq(api_key=GROQ_API_KEY) if Groq and GROQ_API_KEY else None


def generate_response(user_message, context):
    if client is None:
        trimmed_context = (context or "").strip()
        if trimmed_context:
            return (
                "Keshava's guidance is available in fallback mode. "
                "I am with you, dear one. Reflect on the context shared and take one calm step forward."
            )
        return (
            "I am with you, dear one. Breathe, steady your mind, and take the next small right action."
        )

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": KRISHNA_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Bhagavad Gita context:\n{context}\n\nUser message: {user_message}",
            },
        ],
        max_tokens=150,
        temperature=0.75,
    )
    return completion.choices[0].message.content.strip()

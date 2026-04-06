from groq import Groq

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

client = Groq(api_key=GROQ_API_KEY)


def generate_response(user_message, context):
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

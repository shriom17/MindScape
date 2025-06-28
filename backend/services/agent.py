import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import dialogflow

app = Flask(__name__)
CORS(app)

# Set your Google credentials (update the path as needed)
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "E:\\Projects\\MindScape\\backend\\keshav-jnkq-8bd2f16983b6.json"

@app.route('/api/chat', methods=['POST'])
def dialogflow_webhook():
    req = request.get_json()
    user_input = req.get('queryResult', {}).get('queryText', '')
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path('keshav-jnkq', 'unique-session-id')  # Replace with your project ID
    text_input = dialogflow.types.TextInput(text=user_input, language_code='en')
    query_input = dialogflow.types.QueryInput(text=text_input)
    response = session_client.detect_intent(session=session, query_input=query_input)
    fulfillment_text = response.query_result.fulfillment_text
    return jsonify({
        "fulfillmentText": fulfillment_text
    })

if __name__ == "__main__":
    app.run(debug=True)
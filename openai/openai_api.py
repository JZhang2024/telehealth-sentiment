from flask import Flask, request, jsonify
import main

app = Flask(__name__)

@app.route('/api/summarize', methods=['POST'])
def summarize():
    data = request.get_json()
    transcript = data.get('transcript')
    if transcript is None:
        return jsonify({'error': 'No transcript provided'}), 400

    summary = main.summarize_transcript(transcript)
    return jsonify({'summary': summary})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
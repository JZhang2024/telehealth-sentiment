## Telehealth Sentiment Analysis App

**Description**

This project is a telehealth sentiment analysis app built with Vue.js, AWS Transcribe, AWS Rekognition, Agora WebRTC, and the OpenAI API. It provides a platform for real-time video consultations with sentiment analysis and doctor's note generation capabilities.

**Features**

* **Telehealth Experience:** Enables video consultations between patients and doctors using Agora WebRTC.
* **Speech-to-Text Transcription:** AWS Transcribe converts spoken conversations into text for further analysis.
* **Sentiment Analysis:** Analyzes the transcribed text to gauge the overall sentiment of the conversation.
* **Facial Recognition and Analysis (Optional):** AWS Rekognition can be integrated to detect and analyze facial expressions during consultations (requires additional configuration).
* **Doctor's Notes Generation:** Leverages the OpenAI API to generate doctor's notes or feedback summaries from the transcribed text. AWS API Gateway and Lambda functions orchestrate communication with the OpenAI API.

**Technologies Used**

* Front-end: Vue.js
* Speech-to-Text: AWS Transcribe
* Facial Recognition/Analysis: AWS Rekognition
* Real-time Video Communication: Agora WebRTC
* Doctor's Note Generation (AI): OpenAI API
* API Management: AWS API Gateway
* Serverless Functions: AWS Lambda

**Installation**

**Prerequisites**

* Node.js (v21.7.7)

**Steps**

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/JZhang2024/telehealth-sentiment.git
   ```
2. **Install Dependencies:**
   ```bash
   npm install  # or yarn install
   ```

**Usage**

1. **Configuration:**
   - Update .env files with your:
     - Agora WebRTC app ID
     - AWS credentials
     - OpenAI API key
2. **Development Server:**
   ```bash
   npm run dev
   ```
   - Your app will typically be accessible at `http://localhost:8080` in your web browser.

**Additional Notes**

* **OpenAI API:** This project demonstrates usage for doctor's note generation. You'll need an OpenAI account and API key.
* **Security Considerations:**
   - Manage API keys and credentials securely.
   - Implement additional security measures (user authentication/authorization) for production.
* **Further Development:**
   - Enhance error handling and logging.
   - Customize UI and features for specific telehealth use cases.

**Disclaimer**

This project is for educational purposes only. It's not intended for production use without proper security considerations and potential modifications to meet specific telehealth requirements and regulations.

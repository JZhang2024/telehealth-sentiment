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


**Screenshots of webapp in use**
![Screenshot from 2024-07-16 12-11-53](https://github.com/user-attachments/assets/9c7bd9a9-781f-47e4-8a71-44d1810da43a)
![Screenshot from 2024-07-16 12-12-32](https://github.com/user-attachments/assets/9435ac95-ce6a-4856-978d-06238decb5df)
![Screenshot from 2024-07-16 12-12-51](https://github.com/user-attachments/assets/560c5a51-007f-4dbd-9e1f-72249205ac2b)



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
   - Configure AWS Lambda functions in your AWS account. Example function is shown in main.py.
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

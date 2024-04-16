from openai import OpenAI
import os
import json
from dotenv import load_dotenv

# Load the .env file
load_dotenv()

# Set your OpenAI API key here
client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])


def summarize_transcript(transcript):
    """
    Summarizes the given transcript using OpenAI's API.
    """
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "user",
                "content": f"Summarize the following transcript. Some extra context is it's supposed to be a telehealth call between a doctor and patient. Write a doctor's note for it too. Give some suggestions or feedback for the doctor as well:\n\n{transcript}",
            },
        ],
    )
    return response.choices[0].message.content

# lambda_handler function
def lambda_handler(event, context):
    """
    Summarizes the given transcript using OpenAI's API.
    """
    data = json.loads(event["body"])
    transcript = data["transcript"]
    result = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "user",
                "content": f"Summarize the following transcript. Some extra context is it's supposed to be a telehealth call between a doctor and patient. Write a doctor's note for it too. Give some suggestions or feedback for the doctor as well:\n\n{transcript}",
            },
        ],
    )
    print("Got response from OpenAPI:", result)
    response = {
    'statusCode': 200,
    'headers': {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    },
    'body': result.choices[0].message.content
        
    }
    print("response:", response)
    return response

# # Example usage
# transcript_text = """Hi there, can you hear me okay?

# Yep, loud and clear. You too.

# Great. Thanks for calling in today. So, what brings you in?

# Well, I've been feeling pretty under the weather the past few days. Achy all over, kind of a scratchy throat.

# Uh huh, and how long have you been experiencing these symptoms?

# About three days now. Maybe a little longer.

# Okay. Have you taken your temperature at all?

# No, I don't have a thermometer at home.

# I see. Do you have any other symptoms besides the achiness and sore throat?

# A little bit of a runny nose, but that's about it. No cough or anything.

# Hmm, that's good. Does your throat hurt when you swallow?

# Just a little bit, not terribly.

# Okay, and have you been around anyone who's been sick recently?

# Not that I can think of.

# Alright, well based on what you've described, it sounds like you might have a common cold. Colds are pretty common this time of year.

# A cold, huh?

# Right.  The good news is most colds clear up on their own within a week or two.

# That's a relief.

# In the meantime, there are some things you can do to feel better.  Getting plenty of rest, drinking fluids, and maybe using a saline nasal spray can help.

# Sounds manageable.

# Exactly.  If your symptoms worsen though, like a high fever or trouble breathing, then of course you should come in for an in-person visit.

# Absolutely.

# Okay, and do you have any questions for me?

# Nope, I think I've got it. Thanks for your help!

# No problem at all. Feel better soon!"""
# summary = summarize_transcript(transcript_text)
# print("Summary:")
# print(summary)

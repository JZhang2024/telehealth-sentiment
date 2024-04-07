from openai import OpenAI

# Set your OpenAI API key here
client = OpenAI(api_key="")


def summarize_transcript(transcript):
    """
    Summarizes the given transcript using OpenAI's API.
    """
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "user",
                "content": f"Summarize the following transcript:\n\n{transcript}",
            },
        ],
    )
    return response.choices[0].message.content


# Example usage
transcript_text = """This development raises questions about the Israeli government's broader objectives in the war: what are the possible goals driving the war, and which ones have been most crucial in driving Israeli decisions? This paper argues that the Israeli government has three main goals in this conflict: (1) eliminate Hamas and its capability to conduct future attacks, (2) rescue the hostages taken on October 7, and (3) restore the Israeli public's confidence in the army and government to provide for their security. These objectives highlight the mix of military, political, and social factors shaping Israel's response to the October 7 attack. However, based on the actions of the IDF and the statements from the government during the conflict, it becomes evident that the Israeli government has given priority to the elimination of Hamas and the restoration of public confidence, with the rescue of hostages appearing to be a secondary concern."""
summary = summarize_transcript(transcript_text)
print("Summary:")
print(summary)

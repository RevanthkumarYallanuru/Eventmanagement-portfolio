#sentiment analysis
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
nltk.download('vader_lexicon')
sia=SentimentIntensityAnalyzer()
text="priya i love you so much"
sc=sia.polarity_scores(text)
if sc['compound']>=0.05:
    lable="positive"
elif sc['compound']<=-0.05:
    lable='negative'
else:
    lable="normal"

print(f"scores: {sc}")
print(f"sentiment {lable}")
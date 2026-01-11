#stopword program
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
nltk.download('punkt')
nltk.download('stopwords')

text="I saw a man selling kova bun at the evening and dacing in the eveining"

words=word_tokenize(text)
stop_words=set(stopwords.words("english"))
filtered=[w for w in words if w.lower() not in stop_words]

print(" ".join(filtered))
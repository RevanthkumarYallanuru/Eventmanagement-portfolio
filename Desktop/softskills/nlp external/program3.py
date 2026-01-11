#stemming program using porter stemmer, snoball stemmer and wordnet lemmatizer in nltk library
import nltk
from nltk.stem import PorterStemmer, SnowballStemmer,WordNetLemmatizer
nltk.download('punkt')
nltk.download('wordnet')
words=["running","flying","jumping","lifting"]
port=PorterStemmer()
snow=SnowballStemmer('english')
lem=WordNetLemmatizer()
print("porterStemmer")
for word in words:
 
    print(f"{word}-> {port.stem(word)}")

print("snowball")
for word in words:
    print(f"{word}-> {snow.stem(word)}")

print("Lemmatizer")
for word in words:
    print(f"{word}-> {lem.lemmatize(word)}")
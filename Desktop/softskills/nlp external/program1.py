# for word tokenization
import nltk
from nltk.tokenize import word_tokenize

nltk.download('punkt')

words="hello man , I'm BatMAN 😎"

word=word_tokenize(words)
print(word)
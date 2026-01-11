#ngrams
import nltk
from nltk.util import ngrams
nltk.download('punkt')
text="hey there im doing great what about you"
words=nltk.word_tokenize(text)
for i in range(1,4):
    Ngrams=list(ngrams(words,i))
    print(Ngrams)

print()
print()
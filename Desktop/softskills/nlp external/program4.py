#stemming using nltk in a sentance
import nltk
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
nltk.download('punkt')

sentance="while Im sleeping, im deraming about swimming and jumping at the same time of running"
ps=PorterStemmer()
words=word_tokenize(sentance)

Stemmed_words=[ps.stem(word) for word in words]

print(Stemmed_words)

sentance=' '.join(Stemmed_words)

print(sentance)
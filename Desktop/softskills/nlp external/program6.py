#postagging
import nltk
from nltk.tokenize import word_tokenize

nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')

text="the sun is shining in the sky"

words=word_tokenize(text)

tags=nltk.pos_tag(words)
for word,tag in tags:
    print(f"{word}->{tag}")
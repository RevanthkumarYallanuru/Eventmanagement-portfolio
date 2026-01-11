#sentence tokenization using nltk
import nltk
from nltk.tokenize import sent_tokenize

nltk.download('punkt')

sentance="mitrama nuvvu kushalama. em doingc man😎. thinnava"
sen=sent_tokenize(sentance)
for i in range(len(sen)):
    print(f"sentence{i+1}: {sen[i]}")
# named entity recognition
import nltk
from nltk.tokenize import word_tokenize
import spacy

nltk.download('punkt')

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

text = "Apple is a leading technology company founded by Revanth kumar"
text = text.lower()

doc = nlp(text)

for ent in doc.ents:
    print(f"{ent.text} = {ent.label_}")

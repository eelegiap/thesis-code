import pandas as pd
import json
from datetime import datetime
from tqdm import tqdm
import spacy 

# set variables
writeJSONS = True

# sheet_id = '1I8caGvQG2MUnoLUcX1vnkB2RCtJswP7BZCbUEXlBRiw'

# url=f'https://docs.google.com/spreadsheet/ccc?key={sheet_id}&output=xlsx'
# dfPosts = pd.read_excel(url,sheet_name='Posts')
# dfAuthors = pd.read_excel(url,sheet_name='Authors')
# dfCoords = pd.read_excel(url,sheet_name='Location')
# print('Loaded Google Sheet from the web.')

def nlpIt(text):
    byLines = str(text).split('\n')
    nlpList = []
    for line in byLines:
        doc = nlp(line)
        lemmas = [t.lemma_ for t in doc]
        texts = [t.text for t in doc]
        spans = [{'start' : t.idx, 'end' : t.idx + len(t.text)} for t in doc]
        nlpList.append({
            'lemmas' : lemmas,
            'texts' : texts,
            'spans' : spans,
            'lineTxt' : doc.text
        })
    return nlpList

df = pd.read_excel('../Excel_files/Full_Poem_Dataset_12-17.xlsx')
df = df.drop(columns=['Unnamed: 0'])

print(df.head())

# !python -m spacy download ru_core_news_lg
nlp = spacy.load("ru_core_news_lg")

tqdm.pandas()
print('tqdm pandas loaded.')

df['nlpInfo'] = df['Text'].progress_map(nlpIt)

if writeJSONS:
    date = datetime.today().strftime('%Y-%m-%d')
    df.to_json(f'data/poems_{date}).json',orient="records",force_ascii=False)

    print('JSONS written.')
import pandas as pd
import json
from datetime import datetime

# set variables
writeJSONS = True

# sheet_id = '1I8caGvQG2MUnoLUcX1vnkB2RCtJswP7BZCbUEXlBRiw'

# url=f'https://docs.google.com/spreadsheet/ccc?key={sheet_id}&output=xlsx'
# dfPosts = pd.read_excel(url,sheet_name='Posts')
# dfAuthors = pd.read_excel(url,sheet_name='Authors')
# dfCoords = pd.read_excel(url,sheet_name='Location')
# print('Loaded Google Sheet from the web.')

df = pd.read_excel('../Excel_files/Full_Poem_Dataset_12-17.xlsx')

print(df.head())

if writeJSONS:
    date = datetime.today().strftime('%Y-%m-%d')
    df.to_json(f'data/poems_{date}).json',orient="records",force_ascii=False)

    print('JSONS written.')
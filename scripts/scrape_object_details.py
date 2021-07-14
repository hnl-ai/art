import requests
from bs4 import BeautifulSoup
import csv

import sys

with open(sys.argv[1]) as f:
    lines = f.read().splitlines()

items = []

for line in lines:
    object = { # Collected details 
        "objectId": line.split('/')[-1],
        'objectUrl': line, 
        'images': [],
        'title': '',
        'object_name': '',
        'artist': '',
        'date': '',
        'description': '',
        'dimensions': '',
        'credit_line': '',
        'collection': '',
        'object_number': ''
    }

    if 'webobject' in line:
        r = requests.get(line)
        soup = BeautifulSoup(r.text, 'html.parser')
        related_photos = soup.findAll("div", {"class": "relatedPhotos"})
        for photo in related_photos:
            for a in photo.find_all('a', href=True):
                object["images"].append(a['href'])
        table_details = soup.find('table', {'class': 'interiorResultTable'})
        table_rows = table_details.find_all('tr')
        for table_row in table_rows:
            category = table_row.find('td', {'class': 'category'})
            display = table_row.find('td', {'class': 'display'})
            key = '_'.join(category.text.lower().split(' '))
            object[key] = display.text.strip()
        
    items.append(object)

with open(sys.argv[2], 'w') as f:
    writer = csv.writer(f)
    for item in items:
        writer.writerow([
            item['objectId'], item['objectUrl'], item['images'],
            item['title'], item['object_name'], item['artist'],
            item['date'], item['description'], item['dimensions'],
            item['credit_line'], item['collection'], item['object_number']
        ])
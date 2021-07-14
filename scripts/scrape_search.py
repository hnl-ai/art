import requests
from bs4 import BeautifulSoup

pageNum = 1

base_url = 'https://hiculturearts.pastperfectonline.com'

url = '{}/search?page={}&utf8=%E2%9C%93&search_criteria=*&searchButton=Search'.format(base_url, pageNum)

r = requests.get(url)

while 'No results found' not in r.text:
    soup = BeautifulSoup(r.text, 'html.parser')

    results = soup.findAll("div", {"class": "indvImage"})
    for result in results:
        for a in result.find_all('a', href=True):
            print(base_url + a['href'])
    pageNum += 1
    url = '{}/search?page={}&utf8=%E2%9C%93&search_criteria=*&searchButton=Search'.format(base_url, pageNum)
    r = requests.get(url)


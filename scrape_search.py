import requests
from bs4 import BeautifulSoup

pageNum = 1

url = 'https://hiculturearts.pastperfectonline.com/search?page={}&utf8=%E2%9C%93&search_criteria=*&searchButton=Search'.format(pageNum)

r = requests.get(url)

while 'No results found' not in r.text:
    soup = BeautifulSoup(r.text, 'html.parser')

    results = soup.findAll("div", {"class": "indvImage"})
    for result in results:
        for a in result.find_all('a', href=True):
            print(a['href'])
    pageNum += 1
    url = 'https://hiculturearts.pastperfectonline.com/search?page={}&utf8=%E2%9C%93&search_criteria=*&searchButton=Search'.format(pageNum)
    r = requests.get(url)

print(len(results))


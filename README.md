<p align="center">
  🎨🖼️

  <h3 align="center">Public Art in Honolulu</h3>

  <p align="center">
    A project for a new updated viewer of public art in the city of Honolulu
  </p>
  <br />
  <a href="https://hnl-ai.github.io/art/">View Project</a>
</p>

<!-- ABOUT THE PROJECT -->
## About The Project

This project provides an updated interface to view and navigate through public art projects in Honolulu. The information comes from the [Mayor's Office Culture and Arts (MOCA)](http://www.honolulu.gov/moca).

### Why this exists:
The [current existing project](https://github.com/Honolulu/art) ([art.honolulu.gov](http://art.honolulu.gov/)) was last updated a decade ago. This project is an initiative to update the existing project with a new and refreshed user interface.

## How It Works

Using Python, we scrape the information from MOCA's object portal and merge it with the existing [Public Art Open Portal Dataset](https://data.honolulu.gov/dataset/Public-Art/yef5-h88r) (This dataset contains latitude/longitude coordinates, although outdated). We then use this combined information to present the data in our interface.

### Scripts

- [`scrape_search.py`](scripts/scrape_search.py)
  - Scrapes the [City and County of Honolulu
Art in City Buildings Online Collections Database](https://hiculturearts.pastperfectonline.com/) searching page by page collecting urls to each of the collection objects
  - Example Use: `python scrape_search.py scraped_object_urls.txt`
- [`scrape_object_details.py`](scripts/scrape_object_details.py)
  - Iterates over a list of object urls and collects details from each of them
  - Example Use: `python scrape_object_details.py scraped_object_urls.txt scraped_objects.csv`

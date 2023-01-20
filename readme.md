# JNVA-Scraping

## How to use this?

Retrieve titles and links for threads with JSON format. JSON will be saved into `target/` directory.

```bash
node ./get-links.js
```

Download webpages from URLs written in .json file which you've just downloaded. For additional help, you can specify `-h` option for this script. The webpages will be saved into `downloads/` directory.

```bash
python ./scrape.py -j, --json target/latest.json
```

Convert all the threads into JSON format. It should take for a while for all webpages to be converted. If you would like to override the files which you have already download, you can specify `-f` or `--force` (alias) option for this script. Converted JSONs will be saved into `json/` directory.

```bash
node ./convert.js [-f ,--force]
```

## Requisites

* Node.js (tested on `v18.12.1`)
* Python (tested on `v3.10.6`)

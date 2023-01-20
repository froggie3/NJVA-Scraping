# JNVA-Scraping

A few scripts which helps you to retrieve all the JSON-formatted threads on なんJNVA部.

## How to use this?

1. Retrieve titles and links for threads with JSON format. JSON will be saved into `target/` directory.

    ```bash
    node ./get-links.js
    ```

2. Download webpages from URLs written in .json file which you've just downloaded. For additional help, you can specify `-h` option for this script. The webpages will be saved into `downloads/` directory.

    (Note that older threads archive than ★65 (whose titles are different from the latest one) are already downloaded in `target` directory, so you do not have to re-download)

    ```bash
    python ./scrape.py --json target/latest.json
    ```

3. Convert all the threads into JSON format. It should take for a while for all webpages to be converted. If you would like to override the files which you have already downloaded, you can specify `-f` or `--force` (alias) option for this script. Converted JSONs will be saved into `json/` directory.

    ```bash
    node ./convert.js [-f ,--force]
    ```

## Requisites

* Node.js (tested on `v18.12.1`)
* Python (tested on `v3.10.6`)

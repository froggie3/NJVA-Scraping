# JNVA-Scraping

A few scripts which helps you to retrieve all the JSON-formatted threads on なんJNVA部.

![A console screenshot for scrape.py][A console screenshot for scrape.py]

## Updates

* __2022/2/5: Cleaned Up__

    If you are looking for past thread archives, they have been moved to this repository:  
    <https://github.com/froggie3/JNVA-Archives>

* __2022/2/1: Removed the unneeded__

    Node module for puppeteer was removed from `package.json`, so you can manually remove them by `npm remove puppeteer`

## How to Prepare?

1. Setup Python venv. If your terminal is on PowerShell, type this:

    ```bash
    .\.venv\Scripts\Activate.ps1
    ```

2. In virtual environment, install required components for the Python script to run.

    ```bash
    pip install -r ./requirements.txt
    ```

3. Install required components for Node.js, generates `node_modules/` directory.

    ```bash
    npm install
    ```

4. Generate JavaScript by compiling an original TypeScript.

    ```bash
    tsc .\src\convert.ts .\src\get-links.ts --outDir .\dest\.
    ```

## How to use this?

1. This command retrieves the thread titles and their links and save them with JSON format and let you download bunch of HTML webpages while parsing the JSON file. For additional help, you can specify `-h` option for this script. JSON will be saved into `target/` directory while the webpages will be saved into `downloads/html/` directory.

    (Note that older threads archive than ★65 (whose titles are different from the latest one) are already downloaded as `target/nanj_1-65.json`, so you do not have to re-download)

    ```bash
    python ./src/scrape.py --json ./target/latest.json
    ```

2. Convert all the threads into JSON format. It should take for a while for all webpages to be converted. If you would like to override the files which you have already downloaded, you can specify `-f` or `--force` (alias) option for this script. Converted JSONs will be saved into `downloads/json/` directory.

    ```bash
    node ./dest/convert.js [-f ,--force]
    ```

## Requisites

* Node.js (tested on `v18.12.1`)
* Python (tested on `v3.10.6`)


[A console screenshot for scrape.py]: ./readme_resources/20230201222458.png "A console screenshot for scrape.py"
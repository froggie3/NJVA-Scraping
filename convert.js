const { argv } = require("node:process");
const { JSDOM } = jsdom;
const fs = require("fs");
const jsdom = require("jsdom");
const pc = require("picocolors");
const arg_has_force = (function () {
    return argv.includes("--force") | argv.includes("-f") ? true : false;
})();

const dom = new JSDOM();
const filelist = fs.readdirSync("./downloads");

/**
 * A function to output an array, taking one argument of path to a JSON file.
 * @param {string} path Path to your favorite JSON file.
 */
function get_thread_posts(path) {
    const posts = [];
    dom.window.document.body.innerHTML = fs.readFileSync(path, "utf8");
    //console.log("Persing DOM...");
    const parent = dom.window.document.querySelectorAll("div.post");
    //console.log("Retrieving post IDs");
    const number = Array.from(parent).map(
        (parent) => parent.querySelector("div.meta > span.number").textContent
    );
    //console.log("Retrieving post authors");
    const name = Array.from(parent).map(
        (parent) => parent.querySelector("div.meta > span.name").textContent
    );
    //console.log("Formatting datetime");
    const date = Array.from(parent).map((parent) => {
        d = parent
            .querySelector("div.meta > span.date")
            .textContent.replace(/\(.\) /g, "T")
            .replace(/\//g, "-")
            .replace(/$/g, "0Z");
        return d;
    });
    //console.log("Retrieving UIDs");
    const uid = Array.from(parent).map(
        (parent) => parent.querySelector("div.meta > span.uid").textContent
    );
    //console.log("Retrieving Messages");
    const message = Array.from(parent).map((parent) =>
        parent
            .querySelector("div.message > span.escaped")
            .textContent.replace(/^\n/g, "")
            .replace(/[0-9]  /g, "\n")
            .replace(/  /g, "\n")
            .trim()
    );

    //console.log("Zipping...");
    for (i = 0; i < parent.length; i++) {
        posts.push({
            number: number[i],
            name: name[i],
            date: date[i],
            uid: uid[i],
            message: message[i],
        });
    }
    return posts;
}

console.log(pc.green(`Starting the process`));
for (file of filelist) {
    const fpath = "json/" + file.replace(/html/g, "json");
    try {
        if (!fs.existsSync(fpath) | arg_has_force) {
            start_time = new Date();
            console.log(`Trying to write contents to ${fpath}...`);
            const json_text = () =>
                JSON.stringify(
                    get_thread_posts("downloads/" + file),
                    null,
                    "  "
                );
            fs.writeFileSync(fpath, json_text());
            end_time = new Date();

            if (fs.existsSync(fpath)) {
                console.log(
                    pc.blue(
                        `JSON written to ${fpath} (${
                            end_time.getTime() - start_time.getTime()
                        } ms)`
                    )
                );
            }
        } else {
            console.log(pc.red(`${fpath} already exists. Skipping...`));
        }
    } catch (err) {
        console.error(err);
    }
}

dom.window.close();
console.log(pc.green(`Done.`));

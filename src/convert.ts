const fs = require("fs");
const pc = require("picocolors");
export {};
const jsdom = require("jsdom");
const { argv } = require("node:process");
const { JSDOM } = jsdom;
const arg_has_force = (function () {
    return argv.includes("--force") | argv.includes("-f") ? true : false;
})();

const dom = new JSDOM();
const filelist = fs.readdirSync("./downloads/html");

/**
 * A function to output an array, taking one argument of path to a JSON file.
 * @param {string} path Path to your favorite JSON file.
 */
function get_thread_posts(path: string): unknown[] {
    const posts = [];

    dom.window.document.body.innerHTML = fs.readFileSync(path, "utf8");

    //console.log("Persing DOM...");
    const parent = dom.window.document.querySelectorAll("div.post");

    //console.log("Retrieving post IDs");
    const number: number[] = Array.from(parent).map(
        (parent: any) => parent.querySelector("div.meta > span.number").textContent
    );

    //console.log("Retrieving post authors");
    const name: string[] = Array.from(parent).map(
        (parent: any) => parent.querySelector("div.meta > span.name").textContent
    );

    //console.log("Formatting datetime");
    const date: string[] = Array.from(parent).map((parent: any) =>
        parent
            .querySelector("div.meta > span.date")
            .textContent.replace(/\(.\) /g, "T")
            .replace(/\//g, "-")
            .replace(/$/g, "0Z")
    );

    //console.log("Retrieving UIDs");
    const uid: string[] = Array.from(parent).map((parent: any) =>
        // "ID:" を削除
        parent.querySelector("div.meta > span.uid").textContent.substring(3)
    );

    //console.log("Retrieving Messages");
    const message: string[] = Array.from(parent).map((parent: any) =>
        parent
            .querySelector("div.message > span.escaped")
            .textContent.replace(/^\n/g, "")
            .replace(/  /g, "\n")
            .replace(/\n /g, "\n")
            .replace(/\n /g, "\n\n")
            .trim()
    );

    //console.log("Zipping...");
    for (let i = 0; i < parent.length; i++) {
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

console.log(pc.green(`[INFO] Starting the process`));
for (const file of filelist) {
    const fpath = (): string => {
        // 将来的に JSON か CSV ファイルがくるかどうかで分けたい
        return "./downloads/json/" + file.replace(/html/g, "json");
    };

    const json_text = (): string =>
        JSON.stringify(get_thread_posts("./downloads/html/" + file), null, "  ");

    // 未実装(CSV用)
    const csv_text: string = "";

    const threadT: string = "なんJNVA部★133(824)";

    const threadN = threadT.slice(
        threadT.search(/★[0-9]+/) + 1,
        threadT.search(/\([0-9]+\)/)
    );

    try {
        if (!fs.existsSync(fpath()) || arg_has_force) {
            const start_time = new Date();

            console.log(`[INFO] Trying to write contents to ${fpath()}...`);
            fs.writeFileSync(fpath(), json_text());

            const end_time = new Date();

            if (fs.existsSync(fpath())) {
                console.log(
                    pc.blue(
                        `[INFO] JSON written to ${fpath()} (${
                            end_time.getTime() - start_time.getTime()
                        } ms)`
                    )
                );
            }
        } else {
            console.log(`[INFO] ${fpath()} already exists. Skipping...`);
        }
    } catch (err) {
        console.error(err);
    }
}

dom.window.close();
console.log(pc.green(`[INFO] Done.`));

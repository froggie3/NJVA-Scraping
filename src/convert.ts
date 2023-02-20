import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import pc from "picocolors";
import { JSDOM } from "jsdom";
import { argv } from "node:process";
const arg_has_force =
  (argv.includes("--force") || argv.includes("-f")) ?? false;
const dom = new JSDOM();
const filelist: string[] = readdirSync("./downloads/html");

/**
 * A function to output an array, taking one argument of path to a JSON file.
 *
 * @param {string} path Path to your favorite JSON file.
 * @return {object}
 */
function get_thread_posts(path: string): object {
  dom.window.document.body.innerHTML = readFileSync(path, "utf8");

  //console.log("Persing DOM...");
  const parent: Node[] = Array.from(
    dom.window.document.querySelectorAll("div.post") as NodeList
  );

  //console.log("Retrieving post IDs");
  const number: number[] = parent.map(parent => {
    const element = (parent as HTMLElement).querySelector(
      "div.meta > span.number"
    );

    return +(element?.textContent as string);
  });

  //console.log("Retrieving post authors");
  const name: string[] = parent.map(parent => {
    const element = (parent as HTMLElement).querySelector(
      "div.meta > span.name"
    );

    return element?.textContent as string;
  });

  //console.log("Formatting datetime");
  const date: string[] = parent.map(parent => {
    const element = (parent as HTMLElement).querySelector(
      "div.meta > span.date"
    );

    return (element?.textContent as string)
      .replace(/\(.\) /g, "T")
      .replace(/\//g, "-")
      .replace(/$/g, "0Z");
  });

  //console.log("Retrieving UIDs");
  const uid: string[] = parent.map(parent => {
    const element = (parent as HTMLElement).querySelector(
      "div.meta > span.uid"
    );

    return (element?.textContent as string).replace(/ID:/g, "");
  });

  //console.log("Retrieving Messages");
  const message: string[] = parent.map(parent => {
    const element = (parent as HTMLElement).querySelector(
      "div.message > span.escaped"
    );

    return (element?.textContent as string)
      .replace(/^\n/g, "")
      .replace(/  /g, "\n")
      .replace(/\n /g, "\n")
      .replace(/\n /g, "\n\n")
      .trim();
  });

  //console.log("Zipping...");
  return number.map((e, i): object => ({
    number: e,
    name: name[i],
    date: date[i],
    uid: uid[i],
    message: message[i],
  }));
}

const directory = { json: "downloads/json/", html: "downloads/html/" } as const;

console.log(pc.green(`[INFO] Starting the process`));

for (const file of filelist) {
  const fpath = directory.json + file.replace(/html/g, "json");

  if (existsSync(fpath) && !arg_has_force) {
    console.log(`[INFO] ${fpath} already exists. Skipping...`);
    continue;
  }

  const json_text: string = ((): string =>
    JSON.stringify(get_thread_posts(directory.html + file), null, "  "))();

  console.log(`[INFO] Trying to write contents to ${fpath}...`);
  writeFileSync(fpath, json_text, { encoding: "utf8", flag: "w" });

  if (!existsSync(fpath)) {
    continue;
  }

  console.log(pc.blue(`[INFO] JSON written to ${fpath}`));
}

dom.window.close();
console.log(pc.green(`[INFO] Done.`));

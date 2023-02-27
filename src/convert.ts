import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import pc from "picocolors";
import { JSDOM } from "jsdom";
import { argv } from "node:process";
const arg_has_force =
  (argv.includes("--force") || argv.includes("-f")) ?? false;

const dom = new JSDOM();
const directory = { json: "downloads/json/", html: "downloads/html/" } as const;
const filelist: string[] = readdirSync(directory.html);

console.log(pc.green(`[INFO] Starting the process`));

function json_determine_filename(name: string): string {
  const filename = name.replace(/html/g, "");
  const slice = {
    start: filename.search(/★\d+/) + 1,
    end: filename.search(/\(\d+\)/),
  };
  const thread_number = (
    slice.start || slice.end !== -1
      ? filename.slice(slice.start, slice.end)
      : "1"
  ).padStart(5, "0");
  const filename_new = `${thread_number}.json`;

  return filename_new;
}

function convert(html_path: string, json_path: string): void {
  const thread_data = get_thread_posts(html_path);
  const json_text = JSON.stringify(thread_data, null, "  ");

  console.log(`[INFO] Trying to write contents to ${json_path}...`);
  writeFileSync(json_path, json_text, { encoding: "utf8", flag: "w" });

  console.log(pc.blue(`[info] json written to ${json_path}`));
}

function show_info(index: number) {
  if (index === 0) {
    const message = `No file has been changed`;
    console.log(message);
    return;
  }

  const message = `${index} files are added`;
  console.log(pc.green(`[INFO] Done. ${message}`));
}

let i = 0;

for (const filename of filelist) {
  const json_path = directory.json + json_determine_filename(filename);
  const html_path = directory.html + filename;

  if (existsSync(json_path) && !arg_has_force) {
    // console.log(`[info] ${json_path} already exists. skipping...`);
    continue;
  }

  convert(html_path, json_path);
  ++i;
}

show_info(i);
dom.window.close();

/**
 * A function to output an array, taking one argument of path to a JSON file.
 *
 * @param {string} path Path to your favorite JSON file.
 * @return {object}
 */
function get_thread_posts(path: string): object {
  dom.window.document.body.innerHTML = readFileSync(path, "utf8");

  const parent: Node[] = Array.from(
    dom.window.document.querySelectorAll("div.post") as NodeList
  );

  const number: number[] = parent.map(parent => {
    const element = (parent as HTMLElement).querySelector(
      "div.meta > span.number"
    );

    return +(element?.textContent as string);
  });

  const name: string[] = parent.map(parent => {
    const element = (parent as HTMLElement).querySelector(
      "div.meta > span.name"
    );

    return element?.textContent as string;
  });

  const date: string[] = parent.map(parent => {
    const element = (parent as HTMLElement).querySelector(
      "div.meta > span.date"
    );

    return (element?.textContent as string)
      .replace(/\(.\) /g, "T")
      .replace(/\//g, "-")
      .replace(/$/g, "0Z");
  });

  const uid: string[] = parent.map(parent => {
    const element = (parent as HTMLElement).querySelector(
      "div.meta > span.uid"
    );

    return (element?.textContent as string).replace(/ID:/g, "");
  });

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

  return number.map((e, i): object => ({
    number: e,
    name: name[i],
    date: date[i],
    uid: uid[i],
    message: message[i],
  }));
}

const fs = require("fs");
const pc = require("picocolors");
import puppeteer from "puppeteer";
const { scrollPageToBottom } = require("puppeteer-autoscroll-down");

(async () => {
    const browser = await puppeteer.launch({
        channel: "chrome",
        devtools: true,
        headless: true,
    });
    const page = await browser.newPage();

    try {
        await page.goto(
            "https://kakolog.jp/q/%E3%81%AA%E3%82%93JNVA%E9%83%A8",
            { waitUntil: "networkidle2" }
        );
        // Promise.race([
        //     page.evaluate(...),
        //     page.waitFor(5000)
        // ]);
        const lastPosition = await scrollPageToBottom(page, {
            size: 500,
            delay: 250,
            stepsLimit: 50,
        });

        const get_thread_links = await page.evaluate(() => {
            const parent: any = document.getElementsByClassName("title");

            const thread_urls: string[] = Array.from(parent).map(
                (element: any): string => element.querySelector("a").href
            );

            const thread_titles: string[] = Array.from(parent).map(
                (element: any): string =>
                    element.querySelector("a").text.replace(/\([0-9]+\)/, "")
            );

            return thread_titles.map((e, i) => {
                return {
                    thread_title: e,
                    thread_url: thread_urls[i],
                };
            });
        });

        const json_text = ((): string =>
            JSON.stringify(get_thread_links, null, "    "))();

        console.log(json_text);

        // argument にある backup は2回目以降のダウンロードに役立つ
        const fpath = (
            backup: boolean = false,
            path: string = "target/latest"
        ): string => {
            // 将来的に JSON か CSV ファイルがくるかどうかで分けたい
            return path + (backup == true ? ".old" : "") + ".json";
        };

        try {
            const start_time = new Date();

            console.log(`[INFO] Trying to write contents to ${fpath()}...`);

            if (!json_text) {
                throw new Error("[FATAL] NULL returned");
            } else {
                console.log(
                    pc.green(
                        "[INFO] Succeeded to retrieve thread names and links"
                    )
                );
                if (fs.existsSync(fpath())) {
                    // latest.json のコピーを作成してからダウンロード
                    console.log(`[INFO] Creating a copy to ${fpath(true)}...`);
                    fs.copyFileSync(fpath(), fpath(true));
                } else {
                    throw new Error(
                        "[FATAL] Failed when copying file. Check if the file is not locked."
                    );
                }
                fs.writeFileSync(fpath(), json_text);
            }

            const end_time = new Date();

            if (fs.existsSync(fpath())) {
                console.log(
                    pc.blue(
                        `[INFO] JSON was written to ${fpath()} (${
                            end_time.getTime() - start_time.getTime()
                        } ms)`
                    )
                );
            }
        } catch (err) {
            // 空文字が返ってきた
            console.error(pc.red(err));
        }
    } catch (err) {
        console.error(pc.red(err));
    } finally {
        await page.close();
        await browser.close();
    }
})();

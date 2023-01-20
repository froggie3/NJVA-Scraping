const fs = require("fs");
const pc = require("picocolors");
const puppeteer = require("puppeteer-core");
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
            const parent = document.getElementsByClassName("title");

            const parent_length = parent.length;

            const thread_urls = Array.from(parent).map(
                (element) => element.querySelector("a").href
            );

            const thread_titles = Array.from(parent).map((element) =>
                element.querySelector("a").text.replace(/\([0-9]+\)/, "")
            );

            const thread_urls_titles = () => {
                const tmp = [];
                for (let i = 0; i < parent_length; i++) {
                    tmp.push({
                        thread_title: thread_titles[i],
                        thread_url: thread_urls[i],
                    });
                }
                return tmp;
            };

            return thread_urls_titles();
        });

        console.log(get_thread_links);

        const json_text = () => {
            return JSON.stringify(get_thread_links, null, "    ");
        };

        // argument にある backup は2回目以降のダウンロードに役立つ
        const fpath = (path = "target/latest", backup = false) => {
            // 将来的に JSON か CSV ファイルがくるかどうかで分けたい
            return path + (backup == true ? ".old" : "") + ".json";
        };

        try {
            start_time = new Date();

            console.log(`[INFO] Trying to write contents to ${fpath()}...`);

            if (!json_text == "") {
                console.log(
                    pc.green(
                        `[INFO] Succeeded to retrieve thread names and links`
                    )
                );
                if (fs.existsSync(fpath())) {
                    // latest.json のコピーを作成してからダウンロード
                    console.log(
                        pc.green(`[INFO] Creating a copy to ${fpath(true)}...`)
                    );
                    fs.copyFileSync(fpath(), fpath(true));
                }
                fs.writeFileSync(fpath(), json_text());
            } else {
                console.log(pc.red(`[FATAL] NULL returned`));
            }

            end_time = new Date();

            if (fs.existsSync(fpath())) {
                console.log(
                    pc.blue(
                        `[INFO] JSON written to ${fpath()} (${
                            end_time.getTime() - start_time.getTime()
                        } ms)`
                    )
                );
            }
        } catch (err) {
            console.error(err);
        }
    } catch (err) {
        // エラーが起きた際の処理
    } finally {
        await page.close();
        await browser.close();
    }
})();

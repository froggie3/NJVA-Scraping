from colr import color
from fake_useragent import UserAgent
import argparse
import codecs
import json
import os
import pprint
import requests
from requests.exceptions import HTTPError
import shutil
import time


class HelpFormatter(
    argparse.ArgumentDefaultsHelpFormatter,
    argparse.RawTextHelpFormatter,
    argparse.MetavarTypeHelpFormatter,
):
    pass


parser = argparse.ArgumentParser(
    description="A script that retrieves all the thread archives from the \
URLs written in a specified JSON file.",
    epilog="",
    formatter_class=HelpFormatter,
    prog="JNVA-Scraping",
)

parser.add_argument(
    "-s",
    "--sleep",
    choices=range(3, 10),
    default=5,
    help="specify the interval at which you download each \
HTML\n",
    metavar="[integer]",
    nargs=1,
    required=False,
    type=int,
)

parser.add_argument(
    "-o",
    "--outdir",
    default=["./downloads/html/"],
    help="specify the directory in which the archive HTML \
files to be saved\n",
    metavar="[directory]",
    nargs=1,
    required=False,
    type=str,
)

args = parser.parse_args()


class ThreadsDownloader:
    def __init__(self) -> None:
        pass

    def main(self):
        timer = Timer()

        # JSON ファイルの場所を指定
        json_path = "./target/latest.json"

        # 保存先となるディレクトリの指定
        out_dir = args.outdir[0].strip("/").strip("\\") + "/"
        if not os.path.exists(path=out_dir):
            print(
                color(
                    "[FATAL] %s is not a valid path for a JSON File." % args.outdir,
                    fore="red",
                )
            )
            exit()

        # JSONの存在を確認し、配列を作成
        thread_list = self.jsonLoader(json_path)
        old_json_path = json_path.replace(".json", ".old.json")

        # .old.json の存在も確認 (なかったらコピーを試行)
        retry_interval = 2
        tries = 2
        for i in range(0, tries):
            if not os.path.exists(path=old_json_path):
                if i == 0:
                    print(
                        color(
                            "[WARN] %s was not found. Making a copy of \
                        JSON file..."
                            % old_json_path,
                            fore="yellow",
                        )
                    )
                    shutil.copyfile(json_path, old_json_path)
                    time.sleep(retry_interval)
                if i >= 1:
                    print(
                        color(
                            "[FATAL] Failed when making a copy of %s." % old_json_path,
                            fore="red",
                        )
                    )
                    exit()

        old_thread_list = self.jsonLoader(old_json_path)

        # latest.old.json から取得以前で最新の HTML の名前を特定
        last_thread_path = out_dir + old_thread_list[0]["thread_title"] + ".html"

        # 最新のスレッドは基本埋まっていないので、削除して再ダウンロードにまわす
        if os.path.exists(last_thread_path):
            os.remove(last_thread_path)

        for thread in thread_list:
            os.makedirs(name=out_dir, exist_ok=True)

            export_path = out_dir + thread["thread_title"] + ".html"

            if not os.path.exists(path=export_path):
                # Shift-JIS から UTF-8 に変換して保存する
                with codecs.open(export_path, "w", "utf-8") as fp:
                    # リクエストを送信
                    r = requests.get(
                        url=thread["thread_url"],
                        headers={"User-Agent": UserAgent().edge},
                    )
                    t = r.text.replace("charset=Shift_JIS", 'charset="UTF-8"')
                    fp.write(t)

                print(color("[INFO] Exported to %s" % export_path, fore="blue"))

                timer.sleep()
            else:
                print("[INFO] Skipped saving to %s" % export_path)

        print(color("[INFO] Downloading finished", fore="blue"))

    def jsonLoader(self, path) -> dict:
        if os.path.exists(path=path):
            print(color("Found %s" % path, fore="blue"))

            with open(path, "r", encoding="utf-8") as fp:
                return json.loads(fp.read())
        else:
            print(color("%s was not found!" % path, fore="red"))
            exit()


class ThreadsIndexer:
    def __init__(self, e: object = {}) -> None:
        self.thread_list = e

    def compose(self, e: object = {}) -> str:
        if e is not None:
            thread = {
                "thread_title": self.compose_title(e),
                "thread_url": self.compose_url(e),
            }
        else:
            thread: object = {"thread_title": "", "thread_url": ""}
        return thread

    def compose_title(self, e: object) -> str:
        return e["title"].rstrip()

    def compose_url(self, e: object) -> str:
        return "https://%s/test/read.cgi/%s/%s/" % (
            e["server"].rstrip(),
            e["bbs"].rstrip(),
            e["bbskey"].rstrip(),
        )

    def get_query_uri(self, search: str = "なんJNVA部", page: int = 0) -> str:
        API = "https://kakolog.jp/ajax/ajax_search.v15.cgi"
        return "%s%s%s%s" % (
            API,
            f"?q={requests.utils.quote(search)}",
            "&custom_resnum_dir=up",
            f"&p={page}",
        )

    def make_index(self) -> object:
        timer = Timer()
        pageindex = 0
        out = []

        while True:
            uri: str = self.get_query_uri(search="なんJNVA部", page=pageindex)

            try:
                response: object = requests.get(
                    url=uri, headers={"User-Agent": UserAgent().edge}
                )
                # raise error if an error has occurred
                response.raise_for_status()

                if response.status_code == 200:
                    retrieved: dict = json.loads(response.text)
                    if not retrieved["list"]:
                        break
                    else:
                        text = f"({response.status_code} OK)"
                        print("[INFO] %s : %s" % (color(text, fore="blue"), uri))
                        for i in retrieved["list"]:
                            out.append(self.compose(e=i))

                timer.sleep()
                pageindex += 1

            except HTTPError as e:
                print(e)
                raise

        return out

    def save_index(self, data: object = {}):
        fpath = "./target/latest.json"
        fpath_old = "./target/latest.old.json"

        if os.path.exists(path=fpath_old):
            os.remove(fpath_old)

            if os.path.exists(path=fpath):
                shutil.copyfile(fpath, fpath_old)

                with codecs.open(fpath, "w", "utf-8") as fp:
                    fp.write(json.dumps(data, indent=4, ensure_ascii=False))

        if os.path.exists(path=fpath):
            print(color("[INFO] Index was exported to %s" % fpath, fore="blue"))


class Timer:

    SLEEP_TIME = args.sleep

    def __init__(self) -> None:
        pass

    def sleep(self, counter: float = SLEEP_TIME, rate: float = 0.1) -> None:
        while counter >= 0.0:
            print(f"Waiting... ({counter:.1f} seconds left)", end="\r")
            counter -= rate
            time.sleep(rate)
        print("")
        return None


if __name__ == "__main__":
    try:
        td: object = ThreadsDownloader()
        ti: object = ThreadsIndexer()
        ti.save_index(ti.make_index())
        td.main()

    except KeyboardInterrupt:
        pass

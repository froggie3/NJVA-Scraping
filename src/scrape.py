import argparse
import codecs
import json
import os
import pprint
import re
import requests
import shutil
import time
from colr import color
from fake_useragent import UserAgent
from requests.exceptions import HTTPError


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
    default=[5],
    help="specify the interval at which you download each \
HTML\n",
    metavar="[integer]",
    nargs=1,
    required=False,
    type=int,
)

parser.add_argument(
    '-j',
    '--json',
    default=['./target/latest.json'],
    help='choose a path for a JSON file containing thread URLs and titles\n',
    metavar='[path]',
    nargs=1,
    required=False,
    type=str,
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

parser.add_argument(
    "--verbose",
    action='store_true',
    default=False,
    help="specify whether you want detailed information\n",
    required=False,
)

parser.add_argument(
    "--skip-index",
    action='store_true',
    default=False,
    help="specify whether you want skip retrieving latest indexes\n",
    required=False,
)

parser.add_argument(
    "--skip-download",
    action='store_true',
    default=False,
    help="specify whether you want skip retrieving latest indexes\n",
    required=False,
)

args = parser.parse_args()


class ThreadsDownloader:

    json_path = ""
    has_verbose = False

    def __init__(self) -> None:
        self.json_path = args.json[0]
        self.has_verbose = args.verbose
        pass

    def main(self):
        timer = Timer()

        print(color("[INFO] Looking for thread indexes...", fore="blue"))

        # 保存先となるディレクトリの指定
        out_dir = args.outdir[0].strip("/").strip("\\") + "/"
        if not os.path.exists(path=out_dir):
            print(color(
                f"[FATAL] {args.outdir} is not a valid path for a JSON File.", fore="red"))
            exit()

        # JSONの存在を確認し、配列を作成
        thread_list = self.__jsonLoader(self.json_path)
        old_json_path = self.json_path.replace(".json", ".old.json")

        # .old.json の存在も確認 (なかったらコピーを試行)
        retry_interval = 2
        tries = 2
        for i in range(0, tries):
            if not os.path.exists(path=old_json_path):
                if i == 0:
                    print(color(
                        f"[WARN] {old_json_path} was not found. Making a copy of JSON file...", fore="yellow"))
                    shutil.copyfile(self.json_path, old_json_path)
                    time.sleep(retry_interval)
                if i >= 1:
                    print(
                        color(f"[FATAL] Failed when making a copy of {old_json_path}.", fore="red"))
                    exit()

        old_thread_list = self.__jsonLoader(old_json_path)

        # latest.old.json から取得以前で最新の HTML の名前を特定
        last_thread_path = out_dir + \
            old_thread_list[0]["thread_title"] + ".html"

        # 最新のスレッドは基本埋まっていないので、削除して再ダウンロードにまわす
        if os.path.exists(last_thread_path):
            os.remove(last_thread_path)

        print(color("[INFO] Start downloading archives...", fore="blue"))

        for thread in thread_list:
            os.makedirs(name=out_dir, exist_ok=True)

            export_path = out_dir + thread["thread_title"] + ".html"

            # 既にHTMLがあるときはスキップ
            if os.path.exists(path=export_path):
                if self.has_verbose:
                    print("    Skipped saving to %s" % export_path)
                continue

            # リクエストを送信
            url: str = thread["thread_url"]
            host: str = re.findall(
                "[^http(|s):\/\/].+.5ch.net", url)[0]

            while True:
                # Gone. が返ってきたら再試行する
                r = requests.get(
                    url=url,
                    headers={
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                        "Accept-Encoding": "gzip, deflate, br",
                        "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
                        "Alt-Used": host,
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                        "DNT": "1",
                        "Host": host,
                        "Pragma": "no-cache",
                        "Sec-Fetch-Dest": "document",
                        "Sec-Fetch-Mode": "navigate",
                        "Sec-Fetch-Site": "none",
                        "Sec-Fetch-User": "?1",
                        "TE": "trailers",
                        "Upgrade-Insecure-Requests": "1",
                        "User-Agent": UserAgent().random
                    }
                )

                if not re.findall("Gone.\n", r.text):
                    print("    Received invalid response. Retrying...")
                    timer.sleep()
                    break

            # Shift-JIS から UTF-8 に変換して保存する
            with codecs.open(filename=export_path, mode="w", encoding="utf-8") as fp:
                fp.write(r.text.replace(
                    "charset=Shift_JIS", 'charset="UTF-8"'))

            print(color(f"    Exported to {export_path}", fore="blue"))

            timer.sleep()

        print(color("[INFO] Downloading finished", fore="blue"))

    def __jsonLoader(self, path) -> dict:
        if os.path.exists(path=path):
            print(f"    Found {path}")

            with open(file=path, mode="r", encoding="utf-8") as fp:
                return json.loads(fp.read())
        else:
            print(color(f"{path} was not found!", fore="red"))
            exit()


class ThreadsIndexer:
    searchquery = ""
    json_path = ""

    def __init__(self, query: str,) -> None:
        self.searchquery = query
        self.json_path = args.json[0]

    def __compose(self, e: object = {}) -> object:
        if e is not None:
            thread = {
                "thread_title": self.__compose_title(e),
                "thread_url": self.__compose_url(e),
            }
        else:
            thread: object = {"thread_title": "", "thread_url": ""}
        return thread

    def __compose_title(self, e: object) -> str:
        return e["title"].rstrip()

    def __compose_url(self, e: object) -> str:
        return "https://%s/test/read.cgi/%s/%s/" % (
            e["server"].rstrip(),
            e["bbs"].rstrip(),
            e["bbskey"].rstrip(),
        )

    def __get_query_uri(self, search: str, page: int = 0) -> str:
        # return f"http://127.0.0.1/ajax_search.v15.cgi.{page}.json"
        API = "https://kakolog.jp/ajax/ajax_search.v15.cgi"
        return "%s%s%s%s" % (
            API,
            f"?q={requests.utils.quote(search)}",
            "&custom_resnum_dir=up",
            f"&p={page}",
        )

    def make_index(self) -> object:
        HOST: str = "kakolog.jp"
        timer = Timer()
        pageindex = 0
        threads = []

        print(color("[INFO] Retrieving thread indexes...", fore="blue"))

        while True:
            uri: str = self.__get_query_uri(
                search=self.searchquery, page=pageindex)

            try:
                response: object = requests.get(
                    url=uri,
                    headers={
                        "Accept-Encoding": "gzip, deflate, br",
                        "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                        "Alt-Used": HOST,
                        "Cache-Control": "no-cache",
                        "Connection": "keep-alive",
                        "DNT": "1",
                        "Host": HOST,
                        "Pragma": "no-cache",
                        "Sec-Fetch-Dest": "document",
                        "Sec-Fetch-Mode": "navigate",
                        "Sec-Fetch-Site": "none",
                        "Sec-Fetch-User": "?1",
                        "TE": "trailers",
                        "Upgrade-Insecure-Requests": "1",
                        "User-Agent": UserAgent().random,
                    }
                )
                # raise error if an error has occurred
                # response.raise_for_status()

                if response.status_code == 200:
                    retrieved: dict = json.loads(response.text)
                    if not retrieved["list"]:
                        break
                    else:
                        print(f"    {uri} ... {response.status_code} OK")
                        for i in retrieved["list"]:
                            threads.append(self.__compose(e=i))
                        pageindex += 1

                else:
                    print(color("    Failed to retrieve thread names and links. Retrying...",
                                fore="yellow"))
                    pageindex += 0
                    pass

                timer.sleep()

            except HTTPError as e:
                print(e)
                raise

        print(color("    Succeeded to retrieve thread names and links",
                    fore="green"))

        return threads

    def to_string(self, data: object) -> str:
        return json.dumps(data, indent=4, ensure_ascii=False)

    def save_index(self, json_str: str) -> None:
        fpath = self.json_path
        fpath_old = self.json_path.replace('.json', '.old.json')

        if os.path.exists(path=fpath_old):
            os.remove(fpath_old)

        if os.path.exists(path=fpath):
            # latest.json のコピーを作成してからダウンロード
            print(f'[INFO] Creating a copy to {fpath_old}...')
            shutil.copyfile(fpath, fpath_old)
            if not os.path.exists(path=fpath_old):
                print(color("[FATAL] Failed when making a copy of %s." % fpath,
                            fore="red",
                            ))
                exit()
            else:
                print(color(f"    Succeeded to create a copy to {fpath_old}",
                            fore="green"))

        with codecs.open(filename=fpath, mode="w", encoding="utf-8") as fp:
            fp.write(json_str)

        if os.path.exists(path=fpath):
            print(color("[INFO] Index was exported to %s" %
                  fpath, fore="blue"))

        return None


class Timer:
    sleep_time: float = 0.0

    def __init__(self) -> None:
        self.sleep_time = args.sleep[0]
        pass

    def sleep(self, rate: float = 0.1) -> None:
        counter = float(self.sleep_time)
        while counter >= 0.0:
            print(f"    Waiting... ({counter:.1f} seconds left)", end="\r")
            counter -= rate
            time.sleep(rate)
        print("")
        return None


if __name__ == "__main__":
    try:
        if not args.skip_index:
            ti: object = ThreadsIndexer(query="なんJNVA部")
            ti.save_index(ti.to_string(ti.make_index()))
            pass

        if not args.skip_download:
            td: object = ThreadsDownloader()
            td.main()
            pass

    except KeyboardInterrupt:
        pass

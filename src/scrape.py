from colr import color
from fake_useragent import UserAgent
import argparse
import codecs
import json
import os
import pprint
import requests
import shutil
import time


class HelpFormatter(argparse.ArgumentDefaultsHelpFormatter,
                    argparse.RawTextHelpFormatter,
                    argparse.MetavarTypeHelpFormatter):
    pass


parser = argparse.ArgumentParser(
    description='A script that retrieves all the thread archives from the URLs written in a specified JSON file.',
    epilog='',
    formatter_class=HelpFormatter,
    prog='JNVA-Scraping',
)

parser.add_argument('-s', '--sleep',
                    choices=range(3, 10),
                    default=5,
                    help='specify the interval at which you download each HTML\n',
                    metavar='[integer]',
                    nargs=1,
                    required=False,
                    type=int,
                    )

parser.add_argument('-j', '--json',
                    default=['./target/latest.json'],
                    help='choose a path for a JSON file containing thread URLs and titles\n',
                    metavar='[path]',
                    nargs=1,
                    required=False,
                    type=str,
                    )

parser.add_argument('-o', '--outdir',
                    default=['./downloads/html/'],
                    help='specify the directory in which the archive HTML files to be saved\n',
                    metavar='[directory]',
                    nargs=1,
                    required=False,
                    type=str,
                    )

args = parser.parse_args()

def main():
    # JSON ファイルの場所を指定
    json_path = args.json[0]

    # 休憩時間
    sleep_time = args.sleep

    # 保存先となるディレクトリの指定
    out_dir = args.outdir[0].strip('/').strip('\\') + '/'
    if not os.path.exists(path=out_dir):
        print(color('[FATAL] %s is not a valid path for a JSON File.' %
                    args.outdir, fore='red'))
        exit()

    # JSONの存在を確認し、配列を作成
    thread_list = jsonLoader(json_path)
    old_json_path = json_path.replace('.json', '.old.json')

    # .old.json の存在も確認 (なかったらコピーを試行)
    retry_interval = 2
    tries = 2
    for i in range(0, tries):
        if not os.path.exists(path=old_json_path):
            if i == 0:
                print(color('[WARN] %s was not found. Making a copy of JSON file...' %
                            old_json_path, fore='yellow'))
                shutil.copyfile(json_path, old_json_path)
                time.sleep(retry_interval)
            if i >= 1:
                print(color('[FATAL] Failed when making a copy of %s.' %
                            old_json_path, fore='red'))
                exit()

    old_thread_list = jsonLoader(old_json_path)

    # latest.old.json から取得以前で最新の HTML の名前を特定
    last_thread_path = out_dir + old_thread_list[0]['thread_title'] + '.html'

    # 最新のスレッドは基本埋まっていないので、削除して再ダウンロードにまわす
    if (os.path.exists(last_thread_path)):
        os.remove(last_thread_path)

    for thread in thread_list:
        os.makedirs(name=out_dir, exist_ok=True)

        export_path = out_dir + thread['thread_title'] + '.html'

        if not os.path.exists(path=export_path):
            # Shift-JIS から UTF-8 に変換して保存する
            with codecs.open(export_path, 'w', 'utf-8') as fp:
                # リクエストを送信
                r = requests.get(url=thread['thread_url'], headers={
                    "User-Agent": UserAgent().edge
                })
                t = r.text.replace('charset=Shift_JIS', 'charset="UTF-8"')
                fp.write(t)

            print(color('[INFO] Exported to %s' % export_path, fore='blue'))

            time.sleep(sleep_time)
        else:
            print('[INFO] Skipped saving to %s' % export_path)

    print(color('[INFO] Downloading finished', fore='blue'))


def jsonLoader(path):
    # JSON を読んで配列を返す
    if os.path.exists(path=path):
        print(color('Found %s' % path, fore='blue'))

        with open(path, 'r', encoding="utf-8") as fp:
            return json.loads(fp.read())
    else:
        print(color('%s was not found!' % path, fore='red'))
        exit()


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        pass

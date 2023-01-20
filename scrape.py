from colr import color
from fake_useragent import UserAgent
import argparse
import codecs
import json
import os
import pprint
import requests
import time

parser = argparse.ArgumentParser(
    prog='JNVA-Scraping',
    description='',
    epilog=''
)

parser.add_argument('-s', '--sleep',
                    default=5,
                    help='specify the interval at which you download each HTML',
                    metavar='N',
                    required=False,
                    type=int,
                    )
parser.add_argument('-j', '--json',
                    help='choose a path for a JSON file containing thread URLs and titles',
                    metavar='PATH',
                    required=True,
                    type=str,
                    )

args = parser.parse_args()


def main():
    json_path = args.json
    old_json_path = json_path.replace('.json', '.old.json')

    if not os.path.exists(path=json_path):
        print(color('%s was not found!' % json_path, fore='red'))
        exit()

    thread_list = jsonLoader(json_path)
    old_thread_list = jsonLoader(old_json_path)

    # 最新のスレッドは基本1000まで埋まっていないので、再ダウンロードしてもらう
    # latest.old.json から当時「最新」だった HTML の名前を特定し、削除
    last_thread_path = 'downloads/' + \
        old_thread_list[0]['thread_title'] + '.html'
    if (os.path.exists(last_thread_path)):
        os.remove(last_thread_path)

    for thread in thread_list:
        if not os.path.exists(path='downloads/'):
            os.mkdir(path='downloads/')

        export_path = 'downloads/' + thread['thread_title'] + '.html'

        if not os.path.exists(path=export_path):
            # リクエストを送信
            headers = {
                "User-Agent": UserAgent().edge
            }
            r = requests.get(url=thread['thread_url'], headers=headers)

            # Shift-JIS から UTF-8 に変換して保存する
            with codecs.open(export_path, 'w', 'utf-8') as fp:
                t = r.text
                t = t.replace('charset=Shift_JIS', 'charset="UTF-8"')
                fp.write(t)

            print('exported to %s' % export_path)
            time.sleep(2)

        else:
            print('skipped saving to %s' % export_path)

    print('download finished')


def jsonLoader(path="target/latest.json"):
    # JSON を読んで配列を返す
    print(color('%s was found!' % path, fore='yellow'))
    with open(path, 'r', encoding="utf-8") as fp:
        return json.loads(fp.read())


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        pass

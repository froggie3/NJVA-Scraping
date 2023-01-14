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
    prog='5ch-scraping',
    description='',
    epilog=''
)

parser.add_argument('-s', '--sleep',
                    default=5,
                    help='',
                    metavar='sleep',
                    required=False,
                    type=int,
                    )
parser.add_argument('-j', '--json',
                    help='',
                    metavar='path',
                    required=True,
                    type=str,
                    )

args = parser.parse_args()


def main():
    if jsonLoader() is None:
        exit()

    thread_list = jsonLoader()

    for thread in thread_list:
        export_path = 'downloads/' + thread['thread_title'] + '.html'

        if not os.path.exists(export_path):

            headers = {
                "User-Agent": UserAgent().edge
            }

            r = requests.get(thread['thread_url'], headers=headers)

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


def jsonLoader():
    
    # JSON を読んで配列を返す
    json_path = args.json

    if not os.path.exists(json_path):
        print(color('%s was not found!' % json_path, fore='red'))
        return
    else:
        print(color('%s was found!' % json_path, fore='yellow'))

        with open(json_path, 'r', encoding="utf-8") as fp:
            return json.loads(fp.read())


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        pass

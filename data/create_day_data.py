import os
import json
import re
import xml.etree.ElementTree as etree
import subprocess

def filetype(x):
    x = x.lower()
    if x.endswith('.jpg') or x.endswith('.jpeg') or x.endswith('.png'):
        return 'image'
    if x.endswith('.mp4') or x.endswith('.m4v') or x.endswith('.mov'):
        return 'video'
    if x.endswith('.m4a'):
        return 'audio'

def main():
    num_days = 12

    days = [x for x in os.listdir('../img') if not x.startswith('.') and x.startswith('day')]
    output = open('../js/dayData.js', 'wb')

    day_data = json.load(open('days_python.json'))['days']

    video_map = {
        'C-0268E298-BFAD-4A7C-B83C-8BD7B59BFAEC.mp4': 'https://drive.google.com/file/d/1Ysd4Q-z9NMzCq4wKORL9BNGKQkPRQnac/preview',
        'A-IMG_6611.m4v': 'https://drive.google.com/file/d/1fyaiXZx1nUJKo6jEtJY5kM-kcDkaSfkk/preview',
        'W-ips-978E5904-1DDB-4BE8-B508-461E8D74C173.mp4': 'https://drive.google.com/file/d/11FH5GIULtBsbkYRfKPnlZgyqgWWEtJXf/preview',
        'G-IMG_0162.MOV': 'https://drive.google.com/file/d/1hXE4MYrphPVyAIkjWuhXvKDQbNmVroez/preview',
        'G-IMG_0163.MOV': 'https://drive.google.com/file/d/1PP-EwfuyjZ7gYl9Hp66ujP7twXjnELdo/preview',
        'IMG_0165.MOV': 'https://drive.google.com/file/d/1AofSjFkztrMnudF4YAm9k4UVGy7KPxOT/preview',
        'E-IMG_0670.MOV': 'https://drive.google.com/file/d/1D4cIbSA3qZq_eAQo6XOLiXfEqP5TcAPr/preview',
        'ips-8913F265-D739-4D85-99AB-BC8818E790FA.mp4': 'https://drive.google.com/file/d/1JDvEk5rJC5tgYiKO9GPNTMXB69fcwWDH/preview',
        'D1-IMG_0661.MOV': 'https://drive.google.com/file/d/1ohjVmtlVaD4rwHXpsYDzLAWcIUuS_ZjA/preview',
        'IMG_2596.mov': 'https://drive.google.com/file/d/1rZ9N9vWNWdCO-zHiCsSOo85FsaaEYYpk/preview',
        'Y-IMG_2616.m4v': 'https://drive.google.com/file/d/1SoMMdz30veigrbVOnplDAqPuMiDlh7p_/preview',
        'Z1-IMG_6658.m4v': 'https://drive.google.com/file/d/1-0tft0ZjiO7TSfFPRPFjYuvSSUNcoceN/preview',
        'Z2-sstg-D7DC54D4-B25C-4959-917F-C17F8E1EE3BC.mp4': 'https://drive.google.com/file/d/1d6YRJxpNZcvzySWm9BovgFseJiUN119u/preview',
        'DSC_5560.mp4': 'https://drive.google.com/file/d/17U0rvivWafrGI14uFOHivY_h66H_pYlo/preview',
        'E-D-IMG_2622.m4v': 'https://drive.google.com/file/d/119_cV5IXRzUOlpBaSg34lj-J7LelaaoF/preview',
        'Y-17B93DCB-196C-476C-95C0-A016BB37BEED.mp4': 'https://drive.google.com/file/d/1hy-nRWUy_v0nN7Zrapbk3kuRvgO-lPD9/preview',
        'Z-ips-73368712-C282-4D0B-B5B9-6CCC29074A0A.mp4': 'https://drive.google.com/file/d/10vKx2nsv9yiOVPhQfTnBa5a19E9QHrX7/preview',
        'D-IMG_6699.m4v': 'https://drive.google.com/file/d/1kUFnzS0YZTnwedPSu0daVbhNQ4nMXKVm/preview',
        'ips-5DEB4148-DCBB-4347-B658-757CADB7630D.mp4': 'https://drive.google.com/file/d/1qErlk87xNdsjP4HhRjwtfZ8mwuckH--D/preview',

    }

    captions = {
        "thorn junction.m4a": "Thorn junction",
        "Z-Conor Singing Maura's Harmony.m4a":  "Singing in the dark, Conor trying to sing Maura's harmony",
        "Y-IMG_6607.jpg":                       "Black Sands Beach",
        "Z-Corner of My Mind.m4a":              "Corner of My Mind first draft",
        "F-elegy to celery.m4a":                "Elegy to celery",
        "D1-IMG_0661.MOV.png": """<p>Mud mud mud, mud volcano.</p>
        <p>Mud mud mud, mud volcano.</p>
        <p>You stink, you smell, you're not like a wishing well.</p>
        <p>(slow) Buuuuut if you were a wishing well,</p>
        <p>I'd throw a penny into you,</p>
        <p>(fast) and hope to get rid of that awful smell.</p>
        <p>Ohhhhhhhh (repeat!).</p>"""
    }

    for day in days:
        m = re.search(r'\d+$', day)
        day_num_UI = int(m.group())
        day_num = day_num_UI - 1
        image_path = 'img/' + day + '/'
        day_media = []

        listdir = os.listdir('../img/' + day)

        for i, x in enumerate(listdir):
            media = {}
            basename = os.path.splitext(x)[0]
            extension = os.path.splitext(x)[1]

            if x.startswith('.') or basename.endswith('_thumb') or basename.endswith('_full'): continue

            if filetype(basename) == 'video' and basename in video_map.keys():
                media = {
                    'path': video_map[basename],
                    'filename': basename,
                    'thumb': image_path + basename + '_thumb.jpg',
                    'filetype': 'video'
                }

            elif filetype(x) == 'image':
                media = {
                    'path': image_path + basename + '_full' + extension,
                    'filename': x,
                    'thumb': image_path + basename + '_thumb' + extension,
                    'filetype': filetype(x)
                }
            elif filetype(x) == 'audio':
                media = {
                    'path': image_path + x,
                    'filename': x,
                    'thumb': 'img/audio.jpg',
                    'filetype': filetype(x)
                }

            if x in captions:
                media['caption'] = captions[x]

            day_media.append(media)

        day_data[day_num]['media'] = day_media

        # parse rtf files to html
        xml = subprocess.check_output(['rtf2xml', day + '.rtf'])
        root = etree.fromstring(xml)
        section = root[1][0]
        string = ''
        for paragraph_definition in section:
            for para in paragraph_definition:
                parastring = ''

                quoteblock = re.compile(r'^[ |\t]*>(.*)')

                if len(para) and re.match(r'^[ |\t]*-', para[0].text):
                    parastring += '<p class="indented">'
                elif len(para) and quoteblock.match(para[0].text) is not None:
                    parastring += '<p class="indented">'
                    para[0].text = quoteblock.search(para[0].text).group(1)
                else:
                    parastring += '<p>'
                for inline in para:
                    if inline.attrib.get('italics', 'false') == 'true':
                        parastring += '<i>'
                    parastring += inline.text
                    if inline.attrib.get('italics', 'false') == 'true':
                        parastring += '</i>'

                parastring += '</p>'

                if parastring == '<p></p>': parastring = '<div class="paraspacer"></div>'
                string += parastring

        day_data[day_num]['description'] = string

    output.write("var DayData = " + json.dumps( day_data, sort_keys=True, indent=4, separators=(",", ": ")) + "; window.DayData = DayData;")


if __name__ == '__main__':
    main()

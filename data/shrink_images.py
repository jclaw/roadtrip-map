import os
import sys
import re
from PIL import Image
from resizeimage import resizeimage

from PIL import ExifTags

def filetype(x):
    x = x.lower()
    if x.endswith('.jpg') or x.endswith('.jpeg') or x.endswith('.png'):
        return 'photo'
    if x.endswith('.mp4') or x.endswith('.m4v') or x.endswith('.mov'):
        return 'video'
    if x.endswith('.m4a'):
        return 'audio'

def main():
    num_days = 12

    days = [x for x in os.listdir('../img') if not x.startswith('.') and x.startswith('day')]

    for day in days:
        printnln(day)
        m = re.search(r'\d+$', day)
        day_num_UI = int(m.group())
        day_path = '../img/' + day

        if len(sys.argv) > 1 and sys.argv[1] == '-rm':
            for x in os.listdir(day_path):
                if x.startswith('_thumb_'):
                    os.remove(day_path + '/' + x)
        else:
            for x in os.listdir(day_path):
                if x.startswith('.') or x.startswith('_thumb_'): continue
                printnln('.')

                # create thumbs
                if filetype(x) == 'photo':
                    fd_img = open(day_path + '/' + x, 'r')
                    img = Image.open(fd_img)

                    if x.endswith('.png'):
                        img = img.convert('RGB')
                        x = os.path.splitext(x)[0] + '.jpg'

                    if len(sys.argv) > 1 and sys.argv[1] == '-i' and os.path.isfile(day_path + '/_thumb_' + x): continue

                    try:
                        for orientation in ExifTags.TAGS.keys() :
                            if ExifTags.TAGS[orientation]=='Orientation' : break
                        exif=dict(img._getexif().items())

                        if   exif[orientation] == 3 :
                            img=img.rotate(180, expand=True)
                        elif exif[orientation] == 6 :
                            img=img.rotate(270, expand=True)
                        elif exif[orientation] == 8 :
                            img=img.rotate(90, expand=True)
                    except (AttributeError, KeyError, IndexError):
                        pass

                    img = resizeimage.resize_width(img, 400)

                    img.save(day_path + '/_thumb_' + x, img.format)
                    fd_img.close()
                elif filetype(x) is None:
                    print 'no matching filetype for ' + x

        print ''


def printnln(str):
    sys.stdout.write(str)
    sys.stdout.flush()

if __name__ == '__main__':
    main()

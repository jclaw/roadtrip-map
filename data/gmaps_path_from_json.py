import json
import sys
import datetime

data = json.load(open('../../oldfiles/json/googleMapsResponseNew.json'))
pretty = True

def main():

    output = open('../js/googleMapsResponse_python.js', 'wb')

    output.write("var googleMapsResponse = " + p('{') + '"routes":' + p('[') + p('{') + '"legs":' + p('[') +
        parse(data) + p(']') + p('}') + p(']') + p('}'))

def parse(data):
    days_json_file = open('days_python.json', 'wb')
    days_json = json.load(open('days.json'))
    date = datetime.date(2017, 9, 4)
    one_day = datetime.timedelta(days=1)

    leg_strings = []
    legs = data['routes'][0]['legs']
    for i, leg in enumerate(legs):
        days_json['days'][i]['date'] = date.strftime("%A, %B %-d")
        date = date + one_day
        for key in ['distance', 'start_address', 'end_address', 'duration']:
            if type(leg[key]) is dict and 'text' in leg[key]:
                days_json['days'][i][key] = leg[key]['text']
            else:
                days_json['days'][i][key] = leg[key]

        printnln('leg ' + str(i))
        step_strings = []

        leg_string = p('{')
        leg_string += add_keys(leg, 'steps')

        leg_string += '"steps":' + p('[')
        for step in leg['steps']:
            printnln(".")
            loc_strings = []

            step_string = p('{')
            step_string += add_keys(step, 'path')

            step_string += '"path":' + p('[')

            for loc in step['path']:

                loc_string = p('{')
                loc_string += '"lat": function() { return ' + str(loc['lat']) + ';},'
                loc_string += '"lng": function() { return ' + str(loc['lng']) + ';}'
                loc_string += p('}')
                loc_string += p(',')
                loc_strings.append(loc_string)

            step_string += ''.join(loc_strings)
            step_string += p(']')
            step_string += p(',')

            step_string += p('}')
            step_string += p(',')
            step_strings.append(step_string)

        leg_string += ''.join(step_strings)
        leg_string += p(']')
        leg_string += p(',')

        leg_string += p('}')
        leg_string += p(',')
        leg_strings.append(leg_string)
        print ''

    days_json_file.write(json.dumps( days_json, sort_keys=True, indent=4, separators=(",", ": ")))
    # return print_json(data)
    return ''.join(leg_strings)

def add_key(d, key):
    return '"' + key + '":' + print_json(d[key])

def add_keys(d, key_to_ignore):
    keys_to_add = list(d.keys())
    if key_to_ignore:
        keys_to_add.remove(key_to_ignore)

    string = ""
    for i, key in enumerate(keys_to_add):
        string += add_key(d, key)
        string += p(',')

    return string

def p(char):
    prettify = {
        '{' : '{\n',
        '}' : '\n}',
        '[' : '[\n',
        ']' : '\n]',
        ',' : ',\n'
    }
    if pretty:
        return prettify[char]
    else:
        return char

def printnln(str):
    sys.stdout.write(str)
    sys.stdout.flush()

def print_json(data):
    if pretty:
        return json.dumps( data, sort_keys=True, indent=4, separators=(",", ": "))
    else:
        return json.dumps( data, sort_keys=True)


if __name__ == '__main__':
    main()

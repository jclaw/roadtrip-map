import json
import os
import fileinput


string = ''
for line in fileinput.input():
    string += line

data = json.loads(string)
print json.dumps( data, sort_keys=True, indent=2, separators=(",", ": "))

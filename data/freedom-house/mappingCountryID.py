import csv
import json

countryMapping = {}
idMapping = {}
countries = {}

freedom = {}

demo = []

with open('../nodeMap/countryMapping.csv','r') as c:
	mappingData = csv.reader(c)
	for row in mappingData:
		countryMapping[row[10]] = row[11]
		if row[1] == "China, People's Republic of":row[1] = "China"
		if row[1] == 'Myanmar (Burma)':row[1] = "Myanmar"
		if row[1] == 'Korea, South':row[1] = "South Korea"
		countries[row[1]] = row[11]
		idMapping[row[11]] = row[1]

with open('freedom_house_2015.csv') as f:
	reader = csv.reader(f)
	for row in reader:
		row = row[0].split(';')
		freedom[row[0]] = ""

with open('../demographics/worldDataComplete.csv','r') as r:
	reader = csv.reader(r)
	target = "IT.NET.USER.P2"
	for row in reader:
		if row[1] == target and row[3] in idMapping:
			country = idMapping[row[3]]
			if country in freedom:
				country_id = row[3]
				internet = row[27]
				arg = {}
				arg["country"] = country
				arg["country_id"] = country_id
				arg["internet2014"] = internet
				demo.append(arg)
"""
arg = {}
arg["country"] = "United States of America"
arg["country_id"] = "USA"
arg["internet2014"] = 87.3
demo.append(arg)
"""

print freedom

demo = sorted(demo, key=lambda internet: internet["internet2014"])

print json.dumps(demo, sort_keys=True, indent=4, separators=(',', ': '))

with open('internetFreedomCountries.json','w') as outfile:
	json.dump(demo,outfile)

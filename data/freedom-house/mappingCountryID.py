import csv
import json

countryMapping = {}
countries = {}
cities = []

demo = {}

with open('../nodeMap/countryMapping.csv','r') as c:
	mappingData = csv.reader(c)
	for row in mappingData:
		countryMapping[row[10]] = row[11]
		print row[1]
		if row[1] == "China, People's Republic of":row[1] = "China"
		if row[1] == 'Myanmar (Burma)':row[1] = "Myanmar"
		if row[1] == 'Korea, South':row[1] = "South Korea"
		countries[row[1]] = row[11]

with open('freedom_house_2015.csv','r') as f:
	reader = csv.reader(f)
	for row in reader:
		print row
		break

print countries

#with open('countryMapping.json','w') as outfile:
#	json.dump(countries,outfile)

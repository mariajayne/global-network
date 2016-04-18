import csv
import json

countries = []
populationByCountry = {}

#   Generates population for each country
with open('populationWorld.csv') as p:
	popCountry = csv.reader(p)

	for row in popCountry:
		country_id = row[1]
		country_pop = row[4:28]
		populationByCountry[country_id] = country_pop

#   Reads Jacobs tree-structured JSON-file
with open('treeJson.json') as f:
	data = json.load(f)

#   Iterates through all 188 countries
for i in range(188):
	country = {}
	country["country_id"] = data["countries"][i]["code"]
	country["internet"] = []

	for y in range(1991,2015):
		country["internet"].append(data["countries"][i]["internet"]["years"][str(y)])
	
	country["population"] = populationByCountry[country["country_id"]]

	countries.append(country)

print json.dumps(countries,sort_keys=True,indent=3,separators=(',',': '))

with open('BCList.json','w') as outfile:
	json.dump(countries,outfile)

import csv
import json

countryMapping = {}
countries = {}
cities = []

with open('countryMapping.csv','r') as c:
	mappingData = csv.reader(c)

	for row in mappingData:
		countryMapping[row[10]] = row[11]
		countries[row[11]] = []

with open('../../../worldcitiespop.csv',"r") as f:
	worldCities = csv.reader(f)

	for row in worldCities:
		var = row[0].split(',')

		if len(var) != 7: continue  # Most likely invalid city
		if var[0].upper() not in countryMapping: continue # Most likely irrelevant country
		if var[4] == "" or int(var[4]) < 5000 : continue  # Most likely too small 

		landCode = countryMapping[var[0].upper()]
		cityName = var[2]
		cityPop = var[4]
		cityLong = var[-1]
		cityLat = var[-2]
		countries[landCode].append([cityName, cityPop, cityLong, cityLat])


print json.dumps(countries,sort_keys=True,indent=3,separators=(',',': '))

with open('AList.json','w') as outfile:
	json.dump(countries,outfile)

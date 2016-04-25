import csv
import json


mapping = {}
mapping["GDP per capita, PPP (current international $)"] = "gdp"
mapping["Population, total"] = "population"
mapping["Unemployment, total (% of total labor force)"] = "unemployment"
mapping["Internet users (per 100 people)"] = "internet"
mapping["Labor force, total"] = "labor_force"

countries = {}


with open('worldDataComplete.csv') as p:
	reader = csv.reader(p)
	for row in reader:
		c = {}
		c["country"] = row[2]
		c["country_id"] = row[3]
		c["years"] = []
		for y in range(1991,2015):
			arg = {}
			arg["year"] = y 
			arg["country"] = row[2]
			arg["country_id"] = row[3]
			c["years"].append(arg)
		countries[row[3]] = c

with open('worldDataComplete.csv') as f:
	reader = csv.reader(f)
	for row in reader:
		cid = row[3]
		for y in range(1991,2015):
			var = countries[cid]["years"][y-1991]
			if row[0] in mapping:
				metric = mapping[row[0]]
				var[metric] = row[y-1991+4]

demo = {}
demo["countries"] = []
demo["world"] = countries["WLD"]

prev = {}
prev["population"] = 0
prev["internet"] = 0
for y in demo["world"]["years"]:
	if y["population"] == '..': y["population"] = prev["population"]
	if y["internet"] == '..': y["internet"] = prev["internet"]
	y["total_internet_users"]=float(y["population"])*float(y["internet"])/float(100)
	prev["internet"] = y["internet"]
	prev["population"] = y["population"]
	print y


for country in countries.keys():
	demo["countries"].append(countries[country])

print json.dumps(demo,sort_keys=True,indent=4,separators=(',', ': '))

with open('worldDataComplete.json','w') as outfile:
	json.dump(demo,outfile)

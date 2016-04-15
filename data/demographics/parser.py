import json
from pprint import pprint

demo = {}

demo["countries"] = []
demo["labels"] = []

variables = ("internet","unemployment","water","university","gdp")
mapping = ("Internet users (per 100 people)",
"Unemployment, total (% of total labor force) (national estimate)",
"Improved water source (% of population with access)",
"Gross enrolment ratio, tertiary, both sexes (%)",
"GDP (current LCU)")

with open('backup-demographic-by-country.json') as f:
	data = json.load(f)

for i in range(188):
	country = {}
	country["country"] = data["countries"][i]["country"]
	country["country_id"] = data["countries"][i]["code"]
	country["region"] = data["countries"][i]["region"]
	country["years"] = []
	for y in range(1991,2016):
		arg = {}
		arg["year"] = y
		for k in variables:
			arg[k] = data["countries"][i][k]["years"][str(y)]
		country["years"].append( arg)

	demo["countries"].append(country)

for i in range(len(variables)):
	arg = {}
	arg[variables[i]] = mapping[i]
	demo["labels"].append(arg)

print json.dumps(demo, sort_keys=True, indent=4, separators=(',', ': '))

with open('demographics-by-year.json',"w") as outfile:
	json.dump(demo,outfile)



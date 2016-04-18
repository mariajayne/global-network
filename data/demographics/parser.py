import json
import csv
from pprint import pprint

demo = {}

demo["countries"] = []
demo["labels"] = []
demo["world"] = []

variables = ("internet","unemployment","water","university","gdp")
mapping = ("Internet users (per 100 people)",
"Unemployment, total (% of total labor force) (national estimate)",
"Improved water source (% of population with access)",
"Gross enrolment ratio, tertiary, both sexes (%)",
"GDP (current LCU)")

pop = {}
wf = {}

with open('../treemap/treeJson.json') as f:
	data = json.load(f)

with open('populationWorld.csv') as p:
	reader = csv.reader(p)
	for row in reader:
		pop[row[1]] = {}
		
		for i in range(1991,2016):
			pop[row[1]][str(i)] = row[4 + i - 1991]

with open('workforce.csv') as w:
	reader = csv.reader(w)
	for row in reader:
		wf[row[1]] = {}
		for i in range(1991,2016):
			wf[row[1]][str(i)] = row[4 + i - 1991]
		
gdp_total = {}
internet_users_total = {}
population = {}
workforce = {}
total_unemployment = {}
			
for i in range(188):
	country = {}
	country["country"] = data["countries"][i]["country"]
	country["country_id"] = data["countries"][i]["code"]
	country["region"] = data["countries"][i]["region"]
	country["years"] = []
	for y in range(1991,2015):
		arg = {}
		arg["year"] = y
		arg["population"] = pop[data["countries"][i]["code"]][str(y)]
		arg["workforce"] = wf[data["countries"][i]["code"]][str(y)]
		for k in variables:
			arg[k] = data["countries"][i][k]["years"][str(y)]
			if k == 'gdp' and str(y) not in gdp_total:
				if arg[k] == '..': gdp_total[str(y)] = 0
				else: gdp_total[str(y)] = float(arg[k])
			if k == 'gdp': 
				if arg[k] == '..': gdp_total[str(y)] += 0
				else: gdp_total[str(y)] += float(arg[k])
			if k == 'internet' and str(y) not in internet_users_total:
				if arg[k] == '..' or arg["population"] == '..':  internet_users_total[str(y)] = 0
				else: internet_users_total[str(y)] = float(arg[k]) * float(arg["population"])/100
			if k == 'internet':
				if arg[k] == '..' or arg["population"] == '..': internet_users_total[str(y)] += 0
				else: internet_users_total[str(y)] += float(arg[k]) * float(arg["population"])/100

		if str(y) not in population and arg["population"] == '..': population[str(y)] = 0
		if str(y) not in population and arg["population"] != '..': population[str(y)] = float(arg["population"])
		if str(y) in population and arg["population"] == '..': population[str(y)] += 0
		if str(y) in population and arg["population"] != '..': population[str(y)] += float(arg["population"])
		
		popVar = 0
		if arg["population"] != '..':
			popVar = arg["population"]
		if str(y) not in workforce and arg["workforce"] == '..': workforce[str(y)] = 0
		if str(y) not in workforce and arg["workforce"] != '..': workforce[str(y)] = float(arg["workforce"])
		if str(y) in workforce and arg["workforce"] == '..': workforce[str(y)] += 0
		if str(y) in workforce and arg["workforce"] != '..': workforce[str(y)] += float(arg["workforce"])

		if arg["unemployment"] == '..' and str(y) not in total_unemployment: total_unemployment[str(y)] = 0
		elif arg["unemployment"] != '..' and str(y) not in total_unemployment: total_unemployment[str(y)] = workforce[str(y)]
		elif arg["unemployment"] == '..' and str(y) in total_unemployment: total_unemployment[str(y)] += 0
		elif arg["unemployment"] != '..' and str(y) in total_unemployment: total_unemployment[str(y)] += workforce[str(y)] * float(arg["unemployment"])
		
		country["years"].append( arg)

	demo["countries"].append(country)

wholeWorld = {}
wholeWorld["years"] = []

for i in range(1991,2015):
	arg = {}
	arg["year"] = i
	arg["gdp"] = gdp_total[str(i)] / 248 ##Average GDP
	arg["total_gdp"] = gdp_total[str(i)]
	arg["total_internet_usage"] = internet_users_total[str(i)]
	arg["population"] = population[str(i)]
	arg["internet"] = internet_users_total[str(i)] / float(population[str(i)]) * 100
	arg["unemployment"] = total_unemployment[str(i)] / (100 * workforce[str(i)])
	arg["university"] = "NaN"
	wholeWorld["years"].append(arg)

demo["world"].append(wholeWorld)

for i in range(len(variables)):
	arg = {}
	arg[variables[i]] = mapping[i]
	demo["labels"].append(arg)

#print json.dumps(demo, sort_keys=True, indent=4, separators=(',', ': '))

with open('test-demographics-by-year.json',"w") as outfile:
	json.dump(demo,outfile)


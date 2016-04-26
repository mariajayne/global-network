import json
import csv

demo = {}

demo["countries"] = []

variables = ("internet","unemployment","water","university","gdp")

wholeWorld = {}
wholeWorld["country"] = "wholeWorld"
wholeWorld["country_id"] = "WHW"
wholeWorld["region"] = "all"
wholeWorld["years"] = []

for i in range(1991,2016):
	arg = {}
	arg["year"] = str(i)
	arg["internet"] = 0
	arg["gdp"] = 0
	arg["unemployment"] = 0
	wholeWorld["years"].append(arg)

population = {}
workforce = {}
gdp_total = {}
internet_total = {}
unemployment_total = {}

#   Finding population for each country
with open('populationWorld.csv') as p:
	reader = csv.reader(p)
	for row in reader:
		country = row[1]
		population[country] = {}
		for i in range(1991,2016):
			if row[4+i-1991] == '..': row[4+i-1991] = row[4+i-1991-1]
			population[country][str(i)] = row[4+i-1991]

#   Finding workforce for each country
with open('workforce.csv') as w:
	reader = csv.reader(w)
	for row in reader:
		country = row[1] 
		workforce[country] = {}
		for i in range(1991,2016):
			if row[4+i-1991] == '..':row[4+i-1991] = row[4+i-1991-1]
			workforce[country][str(i)] = row[4+i-1991]

#   Finding metrics from treeMapData.json
with open('../treemap/treeMapData.json') as f:
	data = json.load(f)

#   Define dictionary object country to append to demo
for i in range(len(data)):
	country = {}
	country["country"] = data[i]["country"]
	country["country_id"] = data[i]["code"]
	country["region"] = data[i]["region"]
	country["years"] = []
	for y in range(1991,2015):
		arg = {}
		arg["year"] = y
		arg["population"] = population[data[i]["code"]][str(y)]
		arg["workforce"] = workforce[data[i]["code"]][str(y)]
		for k in variables:

			arg[k] = data[i][k]["years"][str(y)]
			if data[i][k]["years"][str(y)] == '..':
				data[i][k]["years"][str(y)] = 0
			if k == 'gdp':
				arg[k] = float(data[i][k]["years"][str(y)]) / float(arg["population"])
				print country["country"], ":", arg[k]
			
		country["years"].append(arg)

		#   Append to the wholeWorld
		curr_year = wholeWorld["years"][y-1991]
		internet_var = data[i]["internet"]["years"][str(y)] * (1.0/len(data))
		gdp_var = data[i]["gdp"]["years"][str(y)] * float(1.0/len(data))
		unemployment_v = data[i]["unemployment"]["years"][str(y)] * (1.0/len(data))
		curr_year["internet"] = curr_year["internet"] + internet_var
		curr_year["gdp"] = curr_year["gdp"] + gdp_var
		curr_year["unemployment"] = curr_year["unemployment"] + unemployment_v


		
	demo["countries"].append(country)

			
cv = 20
y = 0
y1 =  wholeWorld["years"][y]["year"]
g1 = wholeWorld["years"][y]["gdp"]
y2 = demo["countries"][cv]["years"][y]["year"]
g2 = demo["countries"][cv]["years"][y]["gdp"]
c1 = demo["countries"][cv]["country"]

print g2 - g1

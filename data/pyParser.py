import csv

trans = []
scope = ('GDP (current LCU)', 'Internet users (per 100 people)', 'Unemployment, total (% of total labor force) (national estimate)')
labels = ('GDP', 'internet_users', 'unemployment')
scope_map = {}
for i in range(len(scope)):
	scope_map[scope[i]] = labels[i]
labels = ["country","cid","metric"]
for i in range(1991,2016):
	labels.append(str(i))
trans.append(labels)

with open("demographicData.csv") as csvfile:
	reader = csv.reader(csvfile)
	header = []
	for row in reader:
		if row[0] == 'Country Name':
			continue
		if row[2] in scope:
			country = row[0]
			cid = row[1]
			metric = scope_map[row[2]]
			var = [country,cid,metric]
			for i in range(4,len(row)):
				if row[i] == '..': row[i] = 'NaN'
				var.append(row[i])
			trans.append(var)
			
with open('demographics-edited.csv','wb') as f:
	writer = csv.writer(f)
	writer.writerows(trans)


import json

with open('BCList.json') as f:
    B = json.load(f)

def calculateChange(countries):
    D = []

    for country in countries:
        numberOfNewUsers = []
        population = country["population"]
        percent = country["internet"]
        for i in xrange(len(population) - 1):

            percent[i] = (0 if (percent[i] == "..") else percent[i]) 
            percent[i+1] = (0 if (percent[i+1] == "..") else percent[i+1]) 
            population[i] = (0 if (population[i] == "..") else population[i]) 
            population[i+1] = (0 if (population[i+1] == "..") else population[i+1]) 

            start = (float(percent[i]) / 100.0) * int(population[i])
            end = (float(percent[i+1]) / 100.0) * int(population[i+1])

            numberOfNewUsers.append(end  - start)

        D.append({"Country": country["country_id"], "newUsers": numberOfNewUsers})

    return D

with open('DList.json', 'w') as outfile:
    json.dump(calculateChange(B), outfile)

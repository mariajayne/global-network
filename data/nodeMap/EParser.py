import json
from random import shuffle

with open('AList.json') as f1:
    A = json.load(f1)

with open('DList.json') as f2:
    D = json.load(f2)

def sortCityBySize(A):
    for country in A.keys():
        A[country] = sorted(A[country], key = lambda city : int(city[1]), reverse=False)

sortCityBySize(A)

def mergeCityNewUsers(A, D):
    newList = []

    for country1 in D:
        for country2 in A.keys():
            if str(country1["Country"]) == str(country2):
                newEntry = {"Country": country2, "Cities": A[country2], "NewUsers": country1["newUsers"]}
                newList.append(newEntry)
    
    return newList

def generateCities(citiesUsers):
    result = [[] for _ in range(len(citiesUsers[0]["NewUsers"]))]
    for year in range(len(result)):
        for country in citiesUsers:
            newUsers = int(country["NewUsers"][year])
            cities = country["Cities"]
            if len(cities) == 0:
                continue
            boundary = min(int(x[1]) for x in cities)

            while (newUsers > boundary):
                if len(cities) == 0:
                    break

                for i in range(len(cities)):
                    if int(cities[i][1]) <= newUsers:
                        result[year].append({"Name":cities[i][0], "Pop": int(cities[i][1]), "Long":cities[i][2], "Lat":cities[i][3]})
                        newUsers -= int(cities[i][1])
                        del country["Cities"][i]
                        if len(cities) != 0:
                            boundary = min(int(x[1]) for x in cities)
                        break

    return result

def shuffleCities(cities):
    for year in cities:
        shuffle(year)

    return cities


with open('Test.json', 'w') as outfile:
    json.dump(shuffleCities(generateCities(mergeCityNewUsers(A, D))), outfile)
#with open('EList.json', 'w') as outfile:
#    json.dump(generateCities(mergeCityNewUsers(A, D)), outfile)

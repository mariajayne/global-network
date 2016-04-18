import json

with open('AList.json') as f1:
    A = json.load(f1)

with open('DList.json') as f2:
    D = json.load(f2)

def sortCityBySize(A):
    for country in A.keys():
        if str(country) == "USA":
            A[country] = sorted(A[country], key = lambda city: int(city[1]))
        A[country] = sorted(A[country], key = lambda city : int(city[1]), reverse=True)

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
            print country
            print cities
            if len(cities) == 0:
                break
            boundary = min(int(x[1]) for x in cities)

            while (newUsers > boundary):
                if len(cities) == 0:
                    break

                print newUsers
                print cities
                print boundary
            
                for i in range(len(cities)):
                    if int(cities[i][1]) <= newUsers:
                        print cities[i]
                        cities[year].append({"Pop":int(cities[i][1]), "Long":cities[i][2], "Lat":cities[i][3]})
                        newUsers -= int(cities[i][1])
                        del cities[i]
                        if len(cities) != 0:
                            boundary = min(int(x[1]) for x in cities)
                        break

    return result


print generateCities(mergeCityNewUsers(A, D))
#with open('EList.json', 'w') as outfile:
#    json.dump(generateCities(mergeCityNewUsers(A, D)), outfile)

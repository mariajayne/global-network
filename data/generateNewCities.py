

# TESTS DATA SET
A = [{"Country": "NOR", "Cities": [["Oslo", 50, 10, 10], ["Trondheim", 25, 20, 20], ["Bergen", 35, 30, 30], ["Steinkjer", 3, 50,50]]}]
D = [{"Country":"NOR", "newUsers":[15.0,25.0,45.0]}]

def sortCityBySize(A):
    for country in A:
        country["Cities"] = sorted(country["Cities"], key = lambda city : city[1], reverse=True)

sortCityBySize(A)

def mergeCityNewUsers(A, D):
    newList = []

    for country1 in D:
        for country2 in A:
            if country1["Country"] == country2["Country"]:
                newEntry = {"Cities": country2["Cities"], "NewUsers": country1["newUsers"]}
                newList.append(newEntry)
    
    return newList

def generateCities(citiesUsers, boundary):
    cities = [[] for _ in range(len(citiesUsers[0]["NewUsers"]))]
    for country in citiesUsers:
        newUsers = country["NewUsers"]
        for year in range(len(newUsers)):
            curr_newUsers = newUsers[year]

            while(curr_newUsers >= boundary):

                for i in range(len(country["Cities"])):
                    curr_city = country["Cities"][i]
                    if curr_city[1] <= curr_newUsers:
                        del country["Cities"][i]
                        newCity = {"Pop": curr_city[1], "Long": curr_city[2], "Lat": curr_city[3]}
                        cities[year].append(newCity)
                        curr_newUsers -= curr_city[1]
                        break

                
    return cities


print generateCities(mergeCityNewUsers(A, D), 15)


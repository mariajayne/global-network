B = [{"Country":"NOR", "Pop":[100,200,300,450], "Percent":[5,10,15,20]}, 
     {"Country":"SWE", "Pop":[200,400,700,850], "Percent":[10,20,30,45]},
     {"Country":"DEN", "Pop":[200,300,400,700], "Percent":[15,25,35,40]}]


def calculateChange(countries):
    D = []

    for country in countries:
        numberOfNewUsers = []
        population = country["Pop"]
        percent = country["Percent"]
        for i in xrange(len(population) - 1):
            curr_percent = percent[i]
            curr_population = population[i]

            if ((curr_percent == "..") or (curr_population == "..")):
                numberOfNewUsers.append(0)
                continue

            start = (percent[i] / 100.0) * population[i]
            end = (percent[i+1] / 100.0) * population[i+1]

            numberOfNewUsers.append(end  - start)

        D.append({"Country": country["Country"], "newUsers": numberOfNewUsers})

    return D

print calculateChange(B)

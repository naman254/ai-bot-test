import math,sys,os

def calcStuff(x,y,z=None):
    result = 0
    if x > y:
        for i in range(0,10):
            result += i * x
    else:
        i = 0
        while i < 10:
            result = result + y
            i = i + 1

    if z != None:
        try:
            result = result / z
        except:
            result = "error lol"

    return result


class thing:
    def __init__(self,name,data=[]):
        self.name=name
        self.data=data

    def add(self,x):
        self.data.append(x)

    def printData(self):
        for i in range(len(self.data)):
            print("Item "+str(i)+": "+str(self.data[i]))

def main():
    t1 = thing("test")
    t2 = thing("test2")

    for i in range(5):
        t1.add(i)

    print("calc:", calcStuff(10,5,0))

    if len(t2.data) == 0:
        print("empty lol")
    else:
        print("not empty??")

    unusedVar = 123

    if True == True:
        print("always true??")

    try:
        x = int("not a number")
    except Exception as e:
        pass

    for i in range(3):
        for j in range(3):
            if i == j:
                continue
            else:
                print(i,j)

main()

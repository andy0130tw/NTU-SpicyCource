
from selenium import webdriver
from scipy.stats import norm
import numpy

a=webdriver.Firefox()
database = {}
cid="70522200" #演算法課號
rid="70522200"
rgrade=2
PR=0.78
lettergrade={0:"F",1:"C-",2:"C",3:"C+",4:"B-",5:"B",6:"B+",7:"A-",8:"A",9:"A+",}
def addData(courseid):
    row=[0,0,0,0,0,0,0,0,0,0]
    a.get("http://ntusweety.herokuapp.com/history?&id="+courseid[0:3]+"+"+courseid[3:])
    content=a.find_elements_by_class_name("item")
    for i in content:
        temp=i.text.split(" ")
        for j in range(len(temp)-10,len(temp)):
			row[j-len(temp)+10]+=int(temp[j])
    database[courseid]=row

def normallize(person):
    row=person[:]
    PRRange=[0,0,0,0,0,0,0,0,0,0]
    for i in range(1,10):
        row[i]+=row[i-1]
    for i in range(0,10):
        PRRange[i]=row[i]/row[9]
    return PRRange

def findPRByHistory(courseid,grade):
    if(courseid not in database):
        addData(courseid)
    PRRange = normallize(database[courseid])
    if(grade==0):
        return PRRange[0]/2
    else:
        return (PRRange[grade]+PRRange[grade-1])/2

def predictCourseScore(courseid,PR):
    if(courseid not in database):
        addData(courseid)
    PRRange= normallize(database[courseid])
    grade=0
    for i in range(9,-1,-1):
        if(PR<=PRRange[i]):
            grade=i
    return grade



def flunkRate(courseid,PR):
    PRRange = normallize(database[courseid])
    return norm.cdf((PRRange[0]-PR)/numpy.std(PRRange,ddof=1))



#def countrate(array):
#    if (len(array)==0):
#        return 1
#    else:
#        return()

#def twooneRate(groupdata):
#    for i in groupdata:




print(lettergrade[predictCourseScore(cid,PR)])
print('PR', findPRByHistory(rid,rgrade))
print('Flunk rate', flunkRate(cid,PR))

a.quit()

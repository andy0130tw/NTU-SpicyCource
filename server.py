#!/usr/bin/env python3
import atexit

from flask import Flask
from flask import jsonify
from flask import render_template
from flask import request

import spicy_core

app = Flask(__name__)

COURSE_DATA = None

def api_error(msg=None, code=400):
    errObj = { 'ok': False }
    if msg:
        errObj['msg'] = msg
    return jsonify(errObj), code

def loadCourseData():
    f = open('data/course.txt')
    course_hash = {}
    lines = f.readlines()
    # each line is like
    # 0 ,1     ,2,3        ,4
    # 54,現代舞,1,002 50290,四8.9
    for l in lines:
        if not len(l): continue
        d = l.strip().split(',')
        # normalize cid for easy searching
        d[3] = d[3][0:3] + d[3][4:]
        if d[3] not in course_hash:
            cobj = {
                'classes': [],
                'c_name': d[1],
                'credit': d[2],
                'time': d[4]
            }
            course_hash[d[3]] = cobj
        if d[0] != '':
            course_hash[d[3]]['classes'].append(d[0])
    return course_hash

def fini():
    spicy_core.shutdownBrowser()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/course')
def course():
    cid = request.args.get('id', '')
    ccl = request.args.get('class', '')
    if cid == '':
        return api_error('missing parameters: <root>')
    if cid not in COURSE_DATA:
        return api_error('course not found')

    cobj = COURSE_DATA[cid]
    if ccl == '':
        if len(cobj['classes']):
            return api_error('this course has class but not specified')
    else:
        if not len(cobj['classes']):
            return api_error('this course has no class')
        elif ccl not in cobj['classes']:
            return api_error('class not found')

    return jsonify({
        'ok': True,
        'data': {
            'c_name': cobj['c_name'],
            'credit': cobj['credit']
        }
    })


@app.route('/query', methods=['POST'])
def query():
    data = request.get_json()
    if 'course' not in data or 'ref' not in data:
        return api_error('missing parameters: <root>')

    prList = []
    for ref_data in data['ref']:
        if ('grade' not in ref_data
         or 'id' not in ref_data
         or ref_data['grade'] not in spicy_core.lettergrade_inv):
            return api_error('illegal parameters: ref.*')

        cval = spicy_core.lettergrade_inv[ref_data['grade']]
        prList.append(spicy_core.findPRByHistory(ref_data['id'], cval))

    prAvg = sum(prList) / len(prList)

    data = [ {
        'name': cobj['id'],

        'grade': spicy_core.lettergrade[spicy_core.predictCourseScore(cobj['id'],prAvg)]
        # 'p_fail': flunkRate(cid, prAvg)
    } for cobj in data['course'] ]

    return jsonify(data)

if __name__ == '__main__':
    atexit.register(fini)

    print('Spawning browser...')
    spicy_core.initBrowser()
    COURSE_DATA = loadCourseData()
    app.run(debug=True)

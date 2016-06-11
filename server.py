#!/usr/bin/env python3
import atexit

from flask import Flask
from flask import jsonify
from flask import render_template
from flask import request

import spicy_core

app = Flask(__name__)

def fini():
    spicy_core.shutdownBrowser()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/query', methods=['POST'])
def query():
    data = request.get_json()
    errObj = { 'ok': False }
    if 'course' not in data or 'ref' not in data:
        errObj['msg'] = 'illegal parameters: <root>'
        return jsonify(errObj), 400

    prList = []
    for ref_data in data['ref']:
        if 'grade' not in ref_data or 'id' not in ref_data:
            errObj['msg'] = 'illegal parameters: ref.*'
            return jsonify(errObj), 400

        prList.append(spicy_core.findPRByHistory(ref_data['id'], ref_data['grade']))

    prAvg = sum(prList) / len(prList)

    data = [ {
        'c_name': cid,
        'prediction': spicy_core.lettergrade[spicy_core.predictCourseScore(cid,prAvg)]
        # 'p_fail': flunkRate(cid, prAvg)
    } for cid in data['course'] ]

    return jsonify(data)

if __name__ == '__main__':
    atexit.register(fini)
    spicy_core.initBrowser()
    app.run()

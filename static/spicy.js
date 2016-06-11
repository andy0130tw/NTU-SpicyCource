"use strict"

var courses = document.getElementById("courses");
var refs = document.getElementById("refs");
var add_ref = document.getElementById("add-ref");
var add_course = document.getElementById("add-course");
var form = document.getElementsByTagName("form")[0];

add_ref.addEventListener("click",
  function() {
    var num = document.getElementsByClassName("ref").length;
    refs.innerHTML += ('<div class="ref pure-g"><label for="rid_' + num +
      '" class="pure-u-1-8">課號：</label><input name="rid_' + num +
      '" type="text" class="pure-u-1-4"/><label for="rclass_' + num +
      '" class="pure-u-1-8">班次：</label><input name="rclass_' + num +
      '" class="pure-u-1-8"/><label for="rgrade' + num +
      '" class="pure-u-1-8">成績： </label><select name="rgrade_' + num +
      '" class="pure-u-1-8"><option value="A+">A+</option>' +
      '<option value="A">A</option>' +
      '<option value="A-">A-</option>' +
      '<option value="B+">B+</option>' +
      '<option value="B">B</option>' +
      '<option value="B-">B-</option>' +
      '<option value="C+">C+</option>' +
      '<option value="C">C</option>' +
      '<option value="C-">C-</option>' +
      '<option value="F">F</option>' +
      '<option value="X">X</option>' +
      '</select>' +
      '</div>');
  }
);

add_course.addEventListener("click",
  function() {
    var num = document.getElementsByClassName("course").length;
    courses.innerHTML += ('<div class="course pure-g"><label for="cid_' + num +
      '" class="pure-u-1-6">課號：</label><input name="cid_' + num +
      '" class="pure-u-1-3"/><label for="cclass_' + num +
      '" class="pure-u-1-6">班次：</label><input name="ccclass_' + num +
      '" class="pure-u-1-6"></div>');
  }
);

var input = {};
form.addEventListener("submit",
  function(e) {
    e.preventDefault();
    var ref = [];
    var course = [];

    for (var i = 0; i < document.getElementsByClassName("ref").length; ++i)
      if (form.elements['rid_' + i].value.trim())
        ref.push({
          "id": form.elements['rid_' + i].value,
          "grade": form.elements['rgrade_' + i].value
        });

    for (var i = 0; i < document.getElementsByClassName("course").length; ++i)
      if (form.elements['cid_' + i].value.trim())
        course.push(form.elements['cid_' + i].value);

    input["referrence"] = ref;
    input["course"] = course;
    if (ref.length == 0) {
      alert("未輸入上學期成績");
      return;
    }
    if (course.length == 0) {
      alert("未輸入欲預測之課程");
      return;
    }

    document.getElementById("input").style.display = 'none';
    document.getElementById("process").style.display = 'block';

    var processing = setInterval(function() {
      document.getElementById("process").innerHTML += ".";
    }, 1000);

    qwest.post('/query',
      {ref: ref, course: course},
      {dataType: 'json'})
      .then(function(data) {
        var processed = setTimeout(function() {
          clearInterval(processing);
          draw(data);
        }, 3000);
      });
  }
);

// fake data
// var data = [{
//   "c_name": "演算法",
//   "p_fail": 0.9,
//   "p_pass": 0.1,
// }, {
//   "c_name": "量子演算法",
//   "p_fail": 0.87,
//   "p_pass": 0.13,
// }, {
//   "c_name": "開源系統軟體",
//   "p_fail": 0.3,
//   "p_pass": 0.7,
// }, {
//   "c_name": "作業研究",
//   "p_fail": 0.8,
//   "p_pass": 0.2,
// }, {
//   "c_name": "資訊管理導論",
//   "p_fail": 0.8,
//   "p_pass": 0.2,
// }];

var draw = function(input_data) {
  document.getElementById("process").style.display = 'none';
  document.getElementById("output").style.display = 'block';

  var width = document.getElementById("canvas").offsetWidth;
  var height = document.getElementById("canvas").offsetHeight;
  var margin = {
    "top": 20,
    "right": 10,
    "bottom": 40,
    "left": 10,
  };
  var text_size = 20;
  var bar_width = (width - margin.left - margin.right) / (input_data.length + 1) - text_size;
  var canvas = d3.select("#canvas");

  var xScale = d3.scale.linear()
    .domain([0.5, input_data.length + 0.5])
    .range([0, width - margin.left - margin.right]);

  var yScale = d3.scale.linear()
    .domain([0, 100])
    .range([0, height - margin.top - margin.bottom]);

  var xAxis = d3.svg.axis()
    .scale(xScale);

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");

  var bars = canvas.append("g")
    .attr("id", "plot")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
    .selectAll("void").data(input_data).enter();

  var names = canvas.append("g")
    .attr("id", "name")
    .attr("transform", "translate(" + margin.left + ", " + (height - margin.bottom) + ")")
    .selectAll("void").data(input_data).enter();

  /* Course names*/
  names.append("text")
    .text(function(d) {
      return d.c_name;
    })
    .attr({
      "text-anchor": "middle",
      "x": function(d, i) {
        return xScale(i + 1);
      },
      "y": text_size,
    });

  /* Pass */
  bars.append("rect")
    .attr({
      "class": "pass",
      "width": bar_width,
      "height": 0,
      "x": function(d, i) {
        return xScale(i + 1) - bar_width / 2;
      },
      "y": 0,
    })
    .transition().duration(900).delay(function(d, i) {
      return i * 100 + 100;
    })
    .attr("height", function(d) {
      return yScale(d.p_pass * 100);
    });

  /* Fail */
  bars.append("rect")
    .attr({
      "class": "fail",
      "height": 0,
      "width": bar_width,
      "x": function(d, i) {
        return xScale(i + 1) - bar_width / 2;
      },
      "y": height - margin.top - margin.bottom,
    })
    .transition().duration(900).delay(function(d, i) {
      return i * 100 + 100;
    })
    .attr({
      "height": function(d) {
        return yScale(d.p_fail * 100);
      },
      "y": function(d) {
        return yScale(d.p_pass * 100);
      },
    });

  /* Number */
  bars.append("text")
    .text(function(d) {
      return Math.round(d.p_pass * 100) + '%'
    })
    .attr({
      "class": "number",
      "text-anchor": "end",
      "x": function(d, i) {
        return xScale(i + 1) + bar_width / 2 - 8;
      },
      "y": function(d) {
        return yScale(d.p_pass * 100) - 8;
      },
    });

  bars.append("text")
    .text(function(d) {
      return Math.round(d.p_fail * 100) + '%'
    })
    .attr({
      "class": "number",
      "text-anchor": "end",
      "x": function(d, i) {
        return xScale(i + 1) + bar_width / 2 - 8;
      },
      "y": function(d) {
        return yScale(d.p_pass * 100) + text_size;
      },
    });

  return;
}
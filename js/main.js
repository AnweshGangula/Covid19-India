import Daily_Cases_Bar from "./charts/Daily Cases Bar.js";
import Daily_Case_Line from "./charts/Daily Cases line.js";
import Active_Case_Line from "./charts/Active Cases line.js";

// Parse the date / time
var parseDate = d3.timeParse("%Y-%m-%d");

var newCases = document.getElementById("newCases");
var activeCases = document.getElementById("activeCases");
var dailyCasesLine = document.getElementById("d3line");

d3.csv("./Resources/state_wise_daily_Query.csv").then((All_data) => {
  All_data.forEach(function (d) {
    d.Date_YMD = parseDate(d.Date_YMD);
    d.Confirmed = +d.Confirmed;
    d.Recovered = +d.Recovered;
    d.Deceased = +d.Deceased;
    d.Actual = +d.Actual;
  });
  var Total_data = All_data.filter((d) => {
    return d["State Abbr"] === "_TT" /* && d.Actual < 500 */;
  });

  // console.log(data[0].Date_YMD + " is of type " + typeof(data[0].Date_YMD));
  // console.log(typeof(All_data[0].Confirmed));

  new Daily_Cases_Bar(newCases, Total_data);
  new Active_Case_Line(activeCases, Total_data);
  new Daily_Case_Line(dailyCasesLine, Total_data);
});

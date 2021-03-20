import Daily_Cases_Bar from "./charts/Daily Cases Bar.js";
import Daily_Case_Line from "./charts/Daily Cases line.js";
import Active_Case_Line from "./charts/Active Cases line.js";
import Line_Chart from "./charts/Line Chart.js";

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

  var Cum_Confirmed = d3.cumsum(Total_data, (d) => d.Confirmed);
  var Cum_Recovered = d3.cumsum(Total_data, (d) => d.Recovered);
  var Cum_Deceased = d3.cumsum(Total_data, (d) => d.Deceased);

  for (var i = 0; i < Total_data.length; i++) {
    Total_data[i].Cum_Confirmed = Cum_Confirmed[i];
    Total_data[i].Cum_Recovered = Cum_Recovered[i];
    Total_data[i].Cum_Deceased = Cum_Deceased[i];
  }

  let dates = [];
  for (let i of Total_data) {
    dates.push(i.Date_YMD);
  }

  let dateRange = d3.extent(dates);
  let minDate = dateRange[0];
  let maxDate = dateRange[1];

  var Current_Data = All_data.filter((d) => {
    return Date.parse(d.Date_YMD) === Date.parse(maxDate);
  });

  // console.log(Total_data.slice(0, 2));
  // console.log(Total_data.map((a) => a.Cum_Recovered));

  // Draw D3 Charts
  const line_dailyCases_list = {
    Line1: { column: "Cum_Confirmed" },
    Line2: { column: "Cum_Deceased" },
    Line3: { column: "Cum_Recovered" },
  };
  const line_dailyCases = new Line_Chart(
    dailyCasesLine,
    Total_data,
    "Date_YMD",
    line_dailyCases_list
  );

  const bar_dailyCases = new Daily_Cases_Bar(newCases, Total_data, {
    xName: "Date_YMD",
    yName: "Confirmed",
  });

  const line_activeCases = new Active_Case_Line(activeCases, Total_data);
  // const line_dailyCasesOld = new Daily_Case_Line(dailyCasesLine, Total_data);

  bar_dailyCases.draw();
  line_activeCases.draw();
  // line_dailyCasesOld.draw();
  line_dailyCases.draw();
});

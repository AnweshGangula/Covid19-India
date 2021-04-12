import Daily_Cases_Bar from "./charts/Daily Cases Bar.js";
import Daily_Case_Line from "./charts/Daily Cases line.js";
import Active_Case_Line from "./charts/Active Cases line.js";
import Line_Chart from "./charts/Line Chart.js";
import Map from "./charts/Map_TopoJSON.js"

// Parse the date / time
const parseDate = d3.timeParse("%Y-%m-%d");

const CSVfilePath = "./Resources/state_wise_daily_Python.csv"
const newCases = document.getElementById("newCases");
const activeCases = document.getElementById("activeCases");
const dailyCasesLine = document.getElementById("d3line");
const IndiaMap = document.getElementById("indiaMap");
const IndiaMap_JSON = "./Resources/Covid19IndiaOrg_india.json"

const testAsync = await testAsyncAwait(CSVfilePath);

async function testAsyncAwait(filePath) {
  const response = await fetch(filePath);
  const data = await response.text();

  return data
}

const csvData = await d3.csv(CSVfilePath)
RenderCharts(csvData)

function RenderCharts(All_data) {
  All_data.forEach(function (d) {
    d.Date_YMD = parseDate(d.Date_YMD);
    d.Confirmed = +d.Confirmed;
    d.Recovered = +d.Recovered;
    d.Deceased = +d.Deceased;
    d.Active = +d.Active;
  });
  const Total_data = All_data.filter((d) => {
    return d["State_Abbr"] === "_TT" /* && d.Actual < 500 */;
  });

  const Cm_Confirmed = d3.cumsum(Total_data, (d) => d.Confirmed);
  const Cm_Recovered = d3.cumsum(Total_data, (d) => d.Recovered);
  const Cm_Deceased = d3.cumsum(Total_data, (d) => d.Deceased);

  for (let i = 0; i < Total_data.length; i++) {
    Total_data[i].Cm_Confirmed = Cm_Confirmed[i];
    Total_data[i].Cm_Recovered = Cm_Recovered[i];
    Total_data[i].Cm_Deceased = Cm_Deceased[i];
  }

  let dates = [];
  for (let i of Total_data) {
    dates.push(i.Date_YMD);
  }

  let dateRange = d3.extent(dates);
  let minDate = dateRange[0];
  let maxDate = dateRange[1];

  const Current_Data = All_data.filter((d) => {
    return Date.parse(d.Date_YMD) === Date.parse(maxDate) && d["State_Abbr"] !== "_TT";
  });

  // console.log(Total_data.slice(0, 2));
  // console.log(Total_data.map((a) => a.Cm_Recovered));

  // Draw D3 Charts
  const line_Comparision_list = {
    Line1: { column: "Cm_Confirmed" },
    Line2: { column: "Cm_Deceased" },
    Line3: { column: "Cm_Recovered" },
  };
  const line_Comparision = new Line_Chart(
    dailyCasesLine,
    Total_data,
    "Date_YMD",
    line_Comparision_list
  );

  const bar_dailyCases = new Daily_Cases_Bar(newCases, Total_data, {
    xName: "Date_YMD",
    yName: "Confirmed",
  });

  const line_activeCases = new Active_Case_Line(activeCases, Total_data);
  // const line_ComparisionOld = new Daily_Case_Line(dailyCasesLine, Total_data);

  const India_Map = new Map(IndiaMap, IndiaMap_JSON, Current_Data);

  India_Map.draw();
  bar_dailyCases.draw();
  line_activeCases.draw();
  // line_ComparisionOld.draw();
  line_Comparision.draw();
};

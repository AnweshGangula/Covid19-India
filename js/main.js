// Parse the date / time
var parseDate = d3.timeParse("%Y-%m-%d");

// Set the dimensions of the canvas / graph
var margin = { top: 30, right: 20, bottom: 30, left: 60 },
  width = 1600,
  height = 300;

const Daily_Cases_Bar = (data) => {
  // Adds the svg canvas
  var Daily_Cases = d3
    .select("#newCases")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", [0, 0, width, height])
    .classed("svg-container", true);

  var x = d3
    .scaleBand()
    .domain(
      data.map(function (d) {
        return d.Date_YMD;
      })
    )
    .range([margin.left, width - margin.right])
    .padding(0.1);

  var x2 = d3.scaleTime().range([margin.left, width - margin.right]);

  x2.domain(
    d3.extent(data, function (d) {
      return d.Date_YMD;
    })
  );

  var y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.TT) * 1.1])
    .range([height - margin.bottom, margin.top]);

  Daily_Cases.append("g")
    .attr("fill", "royalblue")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", (d) => x(d.Date_YMD))
    .attr("title", (d) => d.TT)
    .attr("class", "rect")
    .attr("width", x.bandwidth())

    .attr("height", 0) // always equal to 0
    .attr("y", function (d) {
      return y(0);
    });

  // .attr("y", d => y(d.TT))
  // .attr("height", d => y(0) - y(d.TT))

  function yAxis(g) {
    g.attr("transform", `translate(${margin.left}, 0)`).call(
      d3.axisLeft(y).ticks(null, data.format)
    );
    // .attr("font-size", '20px')
  }

  var time_extent = d3.extent(data, function (d) {
    return d.Date_YMD;
  });

  var calendar = d3.timeMonth
    //   .every(1)
    .range(new Date(time_extent[0]), new Date(time_extent[1]));
  //   .timeFormat("%Y-%m-%d");

  function xAxis(g) {
    g.attr("transform", `translate(0,${height - margin.bottom})`).call(
      d3.axisBottom(x2)
    );
    // .attr("font-size", '20px')
  }

  // Animation
  Daily_Cases.selectAll("rect")
    .transition()
    .duration(800)
    .attr("y", function (d) {
      return y(d.TT);
    })
    .attr("height", (d) => y(0) - y(d.TT))
    .delay(function (d, i) {
      return i * (data.length / 60);
    });

  Daily_Cases.append("g").call(yAxis);
  Daily_Cases.append("g").call(xAxis);
  Daily_Cases.node();
};

const Daily_Case_Line = (data) => {
  var x = d3.scaleTime().range([margin.left, width - margin.right]);
  var y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

  var Confirmed_data = data.filter(function (d) {
    return d.Status === "Confirmed" /* && d.TT < 5000 */;
  });
  var Recovered_data = data.filter(function (d) {
    return d.Status === "Recovered" /* && d.TT < 5000 */;
  });

  // define the 1st line
  var valueline = d3
    .line()
    .x(function (d) {
      return x(d.Date_YMD);
    })
    .y(function (d) {
      return y(d.TT);
    })
    .curve(d3.curveNatural); //curves the line

  // define the 2nd line
  var valueline2 = d3
    .line()
    .x(function (d) {
      return x(d.Date_YMD);
    })
    // .y(function(d) { return y(d['DL - Delhi']); });
    .y(function (d) {
      return y(d.TT);
    })
    .curve(d3.curveNatural); //curves the line

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var Line_Chart = d3
    .select("#d3line")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", [0, 0, width, height])
    .classed("svg-container", true);

  // Scale the range of the data
  x.domain(
    d3.extent(data, function (d) {
      return d.Date_YMD;
    })
  );
  y.domain([
    0,
    d3.max(data, function (d) {
      return Math.max(d.TT, d.DD);
    }) * 1.1,
  ]);

  // Add the X Axis
  Line_Chart.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  // Add the Y Axis
  Line_Chart.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

  // Add the valueline path.
  path = Line_Chart.append("path")
    .data([Confirmed_data])
    .attr("class", "line")
    .attr("id", "line 0")
    .attr("d", valueline)
    .attr("fill", "none")
    .attr("stroke-width", 4)
    .attr("stroke", "#491EC4");

  // Add the valueline2 path.
  path2 = Line_Chart.append("path")
    .data([Recovered_data])
    .attr("class", "line")
    .attr("id", "line 1")
    .attr("d", valueline2)
    .attr("fill", "none")
    .attr("stroke-width", 4)
    .attr("stroke", "green");

  // Animation
  // Reference link: https://observablehq.com/@onoratod/animate-a-path-in-d3
  const length = path.node().getTotalLength();
  path
    .attr("stroke-dasharray", length + " " + length)
    .attr("stroke-dashoffset", length)
    .transition()
    .ease(d3.easeExp)
    .attr("stroke-dashoffset", 0)
    .duration(6000);
};;

const Active_Case_Line = (data) => {
  var x = d3.scaleTime().range([margin.left, width - margin.right]);
  var y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

  var Confirmed_data = data.filter(function (d) {
    return d.Status === "Confirmed" /* && d.TT < 5000 */;
  });
  var Recovered_data = data.filter(function (d) {
    return d.Status === "Recovered" /* && d.TT < 5000 */;
  });

  // define animation line at 0
  var starting_valueline = d3
    .line()
    .x(function (d) {
      return x(d.Date_YMD);
    })
    .y(function (d) {
      return height - margin.bottom;
    })
    .curve(d3.curveNatural); //curves the line

  // define the 1st line
  var valueline = d3
    .line()
    .x(function (d) {
      return x(d.Date_YMD);
    })
    .y(function (d) {
      return y(d.Active);
    })
    .curve(d3.curveNatural); //curves the line

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var Line_Chart = d3
    .select("#activeCases")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", [0, 0, width, height])
    .classed("svg-container", true);

  // Scale the range of the data
  x.domain(
    d3.extent(data, function (d) {
      return d.Date_YMD;
    })
  );
  y.domain([0, d3.max(data, (d) => d.Active) * 1.1]);

  // Add the X Axis
  Line_Chart.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  // Add the Y Axis
  Line_Chart.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

  // Add the valueline path.
  path = Line_Chart.append("path")
    .data([Confirmed_data])
    .attr("class", "line")
    .attr("id", "line 0")
    .attr("d", starting_valueline)
    .attr("fill", "none")
    .attr("stroke-width", 4)
    .attr("stroke", "#491EC4");

  // Animation
  // Reference link: https://observablehq.com/@onoratod/animate-a-path-in-d3
  path.transition().ease(d3.easeBackOut).duration(2000).attr("d", valueline);
};

d3.csv("./Resources/state_wise_daily.csv").then(function (All_data) {
  All_data.forEach(function (d) {
    d.Date_YMD = parseDate(d.Date_YMD);
    d.TT = +d.TT;
  });
  var Confirmed_data = All_data.filter(function (d) {
    return d.Status === "Confirmed" /* && d.TT < 5000 */;
  });
  var Recovered_data = All_data.filter(function (d) {
    return d.Status === "Recovered" /* && d.TT < 5000 */;
  });
  // console.log(data[0].Date_YMD + " is of type " + typeof(data[0].Date_YMD));
  console.log(Confirmed_data[0]);

  Daily_Cases_Bar(Confirmed_data);
  Active_Case_Line(Confirmed_data);
  Daily_Case_Line(All_data);
});

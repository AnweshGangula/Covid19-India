// Parse the date / time
var parseDate = d3.timeParse("%Y-%m-%d");

// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 1600,
    height = 300;

// Adds the svg canvas
var svg = d3.select("#d3line")
.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", [0, 0, width, height]);

const render = data => {
    // Set the ranges
var minDate = d3.min(data.map(function(d) { return d.Date_YMD; }));
var maxDate = d3.max(data.map(function(d) { return d.Date_YMD; }));

var x = d3.scaleBand()
            .domain(d3.range(data.length))
            .range([margin.left, width - margin.right])
            .padding(0.1)

var y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.TT)*1.1])
            .range([height - margin.bottom, margin.top])

svg
    .append("g")
    .attr("fill", 'royalblue')
    .selectAll("rect")
    .data(data)
    .join("rect")
        .attr("x", (d, i) => x(i))
        .attr('title', (d) => d.TT)
        .attr("class", "rect")
        .attr("width", x.bandwidth())

        .attr("height", 0) // always equal to 0
        .attr("y", function(d) { return y(0); })

        // .attr("y", d => y(d.TT))
        // .attr("height", d => y(0) - y(d.TT))
        

function yAxis(g) {
    g.attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(null, data.format))
        // .attr("font-size", '20px')
}

function xAxis(g) {
    g.attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
        .ticks(d3.timeMonth.every(4))
        .tickFormat(i => data[i].Date_YMD))
        // .attr("font-size", '20px')
}

// Animation
svg.selectAll("rect")
  .transition()
  .duration(800)
  .attr("y", function(d) { return y(d.TT); })
  .attr("height", d => y(0) - y(d.TT))
  .delay(function(d,i){return(i*(data.length/60))})

svg.append("g").call(xAxis);
svg.append("g").call(yAxis);
svg.node();
    
}

d3.csv("./Resources/state_wise_daily.csv").then(function(All_data){
    All_data.forEach(function(d) {
        d.Date_YMD = parseDate(d.Date_YMD);
        d.TT = +d.TT;
    });
    var data = All_data.filter(function(d) { return d.Status === "Confirmed" ; });
    // console.log(data[0].Date_YMD + " is of type " + typeof(data[0].Date_YMD));
    console.log(data.length);

    render(data);
});
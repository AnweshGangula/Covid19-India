import gVar from "../global var.js";

class Daily_Case_Line {
  constructor(element, data) {
    this.element = element;
    this.data = data;
  }

  draw() {
    // this.element.innerHTML = "";
    // Adds the svg canvas
    const chart = d3.select(this.element).append("svg");

    chart
      .attr("width", gVar.width + gVar.margin.left + gVar.margin.right)
      .attr("height", gVar.height + gVar.margin.top + gVar.margin.bottom)
      .attr("viewBox", [0, 0, gVar.width, gVar.height])
      .classed("svg-container", true);

    this.plot = chart.append("g").attr("fill", "royalblue");

    this.createScales();
    this.drawAxis();
    this.drawLines();
  }
  createScales() {
    this.xScale = d3
      .scaleTime()
      .range([gVar.margin.left, gVar.width - gVar.margin.right])
      .domain(
        d3.extent(this.data, function (d) {
          return d.Date_YMD;
        })
      );

    this.yScale = d3
      .scaleLinear()
      .range([gVar.height - gVar.margin.bottom, gVar.margin.top])
      .domain([
        0,
        d3.max(this.data, function (d) {
          return Math.max(d.Confirmed, d.Recovered);
        }) * 1.1,
      ]);
  }

  drawAxis() {
    // Add the X Axis
    this.plot
      .append("g")
      .attr("transform", `translate(0,${gVar.height - gVar.margin.bottom})`)
      .call(d3.axisBottom(this.xScale))
      .attr("class", "x-axis");

    // Add the Y Axis
    this.plot
      .append("g")
      .attr("transform", `translate(${gVar.margin.left}, 0)`)
      .call(d3.axisLeft(this.yScale))
      .attr("class", "y-axis");
  }

  drawLines() {
    const visual = this.plot.append("g").attr("class", "chart");

    // define the 1st line
    const valueline = d3
      .line()
      .x((d) => this.xScale(d.Date_YMD))
      .y((d) => this.yScale(d.Confirmed))
      .curve(d3.curveNatural); //curves the line

    // define the 2nd line
    const valueline2 = d3
      .line()
      .x((d) => this.xScale(d.Date_YMD))
      // .y(function(d) { return y(d['DL - Delhi']); });
      .y((d) => this.yScale(d.Recovered))
      .curve(d3.curveNatural); //curves the line

    // Add the valueline path.
    const path = visual
      .append("path")
      .data([this.data])
      .attr("class", "line")
      .attr("id", "Confirmed Line")
      .attr("d", valueline)
      .attr("fill", "none")
      .attr("stroke-width", 4)
      .attr("stroke", "#491EC4");

    // Add the valueline2 path.
    const path2 = visual
      .append("path")
      .data([this.data])
      .attr("class", "line")
      .attr("id", "Recovered Line")
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
      .ease(d3.easeQuad)
      .attr("stroke-dashoffset", 0)
      .duration(4000);
  }
}

export default Daily_Case_Line;

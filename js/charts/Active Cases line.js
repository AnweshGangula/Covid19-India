import gVar from "../global var.js";

class Active_Case_Line {
  constructor(element, data) {
    this.element = element;
    this.data = data;

    this.draw();
  }

  draw() {
    // this.element.innerHTML = "";
    // Adds the svg canvas
    const chart = d3
      .select(this.element)
      .append("svg")
      .attr("width", gVar.width + gVar.margin.left + gVar.margin.right)
      .attr("height", gVar.height + gVar.margin.top + gVar.margin.bottom)
      .attr("viewBox", [0, 0, gVar.width, gVar.height])
      .classed("svg-container", true);

    this.plot = chart.append("g").attr("fill", "royalblue");

    this.createScales();
    this.drawAxis();
    this.drawLine();
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
      .domain([0, d3.max(this.data, (d) => d.Active) * 1.1]);
  }

  drawAxis() {
    // Add the X Axis
    this.plot
      .append("g")
      .attr("transform", `translate(0,${gVar.height - gVar.margin.bottom})`)
      .call(d3.axisBottom(this.xScale));

    // Add the Y Axis
    this.plot
      .append("g")
      .attr("transform", `translate(${gVar.margin.left}, 0)`)
      .call(d3.axisLeft(this.yScale));
  }

  drawLine() {
    const visual = this.plot.append("g");
    // define animation line at 0
    const valueline_start = d3
      .line()
      .x((d) => this.xScale(d.Date_YMD))
      .y((d) => gVar.height - gVar.margin.bottom)
      .curve(d3.curveNatural);
    //curves the line

    // define the 1st line
    const valueline_animate = d3
      .line()
      .x((d) => this.xScale(d.Date_YMD))
      .y((d) => this.yScale(d.Active))
      .curve(d3.curveNatural); //curves the line

    const area_path_start = d3
      .area()
      .x((d) => this.xScale(d.Date_YMD))
      .y0(this.yScale(0))
      .y1(this.yScale(0));

    const area_path_animate = d3
      .area()
      .x((d) => this.xScale(d.Date_YMD))
      .y0(this.yScale(0))
      .y1((d) => this.yScale(d.Active));

    const path = visual
      .append("path")
      .data([this.data])
      .attr("class", "line")
      .attr("id", "Active Line")
      .attr("d", valueline_start)
      .attr("fill", "none")
      .attr("stroke-width", 4)
      .attr("stroke", "#491EC4");
    //   .attr("fill", "#cce5df")
    //   .attr("d", area);

    const area = visual
      .append("path")
      .data([this.data])
      .attr("fill", "#cce5df")
      .attr("d", area_path_start);

    // Animation
    // Reference link: https://observablehq.com/@onoratod/animate-a-path-in-d3
    path
      .transition()
      .ease(d3.easeBackOut)
      .duration(2000)
      .attr("d", valueline_animate);

    area
      .transition()
      .ease(d3.easeBackOut)
      .duration(2000)
      .attr("d", area_path_animate);
  }
}

export default Active_Case_Line;

import gVar from "../global var.js";

// Reference: http://bl.ocks.org/asielen/44ffca2877d0132572cb
class Line_Chart {
  constructor(element, data, xName, yObjs) {
    this.element = element;
    this.data = data;
    this.yObjs = yObjs;
    this.xFunct = (d) => d[xName];

    /*
    yObjs format:
    {y1:{column:'',name:'name',color:'color'},y2}
    */

    // For each yObjs argument, create a yFunction
    // Object instead of array
    this.yFuncts = [];
    for (var y in yObjs) {
      yObjs[y].name = y;
      yObjs[y].yFunct = getYFn(yObjs[y].column); //Need this  list for the ymax function
      this.yFuncts.push(yObjs[y].yFunct);
    }

    function getYFn(column) {
      return function (d) {
        return d[column];
      };
    }
  }

  draw() {
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
      .domain(d3.extent(this.data, (d) => this.xFunct(d)));

    // Get the max of every yFunct
    this.max = (d) => d3.max(this.data, d);

    this.yScale = d3
      .scaleLinear()
      .range([gVar.height - gVar.margin.bottom, gVar.margin.top])
      .domain([0, d3.max(this.yFuncts.map(this.max))]);
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
    const color = d3.scaleOrdinal(d3.schemeSet1);

    // Build line building functions
    const yS = this.yScale;
    const yObs = this.yObjs;
    function getYScaleFn(yObj) {
      return (d) => yS(yObs[yObj].yFunct(d));
    }
    for (var yObj in this.yObjs) {
      const index = Object.keys(this.yObjs).indexOf(yObj);
      this.yObjs[yObj].line = d3
        .line()
        .x((d) => this.xScale(this.xFunct(d)))
        .y(getYScaleFn(yObj))
        .curve(index % 2 == 0 ? d3.curveNatural : d3.curveCatmullRom); // alternatively switch between d3.curveNatural & d3.curveCatmullRom
    }

    // Draw Lines
    for (var y in this.yObjs) {
      this.yObjs[y].path = visual
        .append("path")
        .datum(this.data)
        .attr("class", "line")
        .attr("d", this.yObjs[y].line)
        .style("stroke", color(y))
        .attr("data-series", y)
        .attr("fill", "none")
        .attr("stroke-width", 4)
        .attr("stroke", "#491EC4");
    }

    for (var y in this.yObjs) {
      this.yObjs[y].path.attr("d", this.yObjs[y].line);
    }
  }
}

export default Line_Chart;

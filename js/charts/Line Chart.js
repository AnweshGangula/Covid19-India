import gVar from "../global var.js";

class Line_Chart {
  constructor(element, data, xName, yObjs) {
    this.element = element;
    this.data = data;
    this.yObjs = yObjs;
    this.xFunct = (d) => d[xName];

    // For each yObjs argument, create a yFunction
    function getYFn(column) {
      return function (d) {
        return d[column];
      };
    }
    /*
     yObjs format:
     {y1:{column:'',name:'name',color:'color'},y2}
     */

    // Object instead of array
    this.yFuncts = [];
    for (var y in yObjs) {
      yObjs[y].name = y;
      yObjs[y].yFunct = getYFn(yObjs[y].column); //Need this  list for the ymax function
      this.yFuncts.push(yObjs[y].yFunct);
    }
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
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // console.log(this.yObjs["yName1"]);
    // Build line building functions
    const yS = this.yScale;
    const yObs = this.yObjs;
    function getYScaleFn(yObj) {
      return (d) => yS(yObs[yObj].yFunct(d));
    }
    // console.log(test("yName1"));
    for (var yObj in this.yObjs) {
      //   console.log((d) => this.yScale(this.yObjs[yObj].yFunct(d)));
      console.log(getYScaleFn(yObj));
      this.yObjs[yObj].line = d3
        .line()
        .x((d) => this.xScale(this.xFunct(d)))
        .y(getYScaleFn(yObj))
        .curve(d3.curveNatural);
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
      // .on("mouseover", function () {
      //   focus.style("display", null);
      // })
      // .on("mouseout", function () {
      //   focus.transition().delay(700).style("display", "none");
      // })
      // .on("mousemove", mousemove);
    }

    for (var y in this.yObjs) {
      this.yObjs[y].path.attr("d", this.yObjs[y].line);
    }
    // console.log(this.yObjs);

    // // define the 1st line
    // const valueline = d3
    //   .line()
    //   .x((d) => this.xScale(this.xFunct(d)))
    //   .y((d) => this.yScale(d.Confirmed))
    //   .curve(d3.curveNatural); //curves the line

    // // define the 2nd line
    // const valueline2 = d3
    //   .line()
    //   .x((d) => this.xScale(this.xFunct(d)))
    //   // .y(function(d) { return y(d['DL - Delhi']); });
    //   .y((d) => this.yScale(d.Recovered))
    //   .curve(d3.curveNatural); //curves the line

    // // Add the valueline path.
    // const path = visual
    //   .append("path")
    //   .data([this.data])
    //   .attr("class", "line")
    //   .attr("id", "Confirmed Line")
    //   .attr("d", valueline)
    //   .attr("fill", "none")
    //   .attr("stroke-width", 4)
    //   .attr("stroke", "#491EC4");

    // // Add the valueline2 path.
    // const path2 = visual
    //   .append("path")
    //   .data([this.data])
    //   .attr("class", "line")
    //   .attr("id", "Recovered Line")
    //   .attr("d", valueline2)
    //   .attr("fill", "none")
    //   .attr("stroke-width", 4)
    //   .attr("stroke", "green");

    // // Animation
    // // Reference link: https://observablehq.com/@onoratod/animate-a-path-in-d3
    // const length = path.node().getTotalLength();
    // path
    //   .attr("stroke-dasharray", length + " " + length)
    //   .attr("stroke-dashoffset", length)
    //   .transition()
    //   .ease(d3.easeQuad)
    //   .attr("stroke-dashoffset", 0)
    //   .duration(4000);
  }
}

export default Line_Chart;

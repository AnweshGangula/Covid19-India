import gVar, {
  formatDate,
  formatValue,
  duration,
  color,
} from "../global var.js";

// Reference: http://bl.ocks.org/asielen/44ffca2877d0132572cb
class Line_Chart {
  constructor(element, data, xName, yObjs, area = true) {
    this.element = element;
    this.data = data;
    this.yObjs = yObjs;
    this.xFunct = (d) => d[xName];
    this.area = area

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
      return (d) => d[column];
    }
  }

  draw() {
    this.legend();
    // Adds the svg canvas
    this.chart = d3.select(this.element).append("svg");

    this.chart
      .attr("width", gVar.width + gVar.margin.left + gVar.margin.right)
      .attr("height", gVar.height + gVar.margin.top + gVar.margin.bottom)
      .attr("viewBox", [0, 0, gVar.width, gVar.height])
      .classed("svg-container", true);

    this.plot = this.chart.append("g").attr("fill", "royalblue");

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
      .domain([0, d3.max(this.yFuncts.map(this.max)) * 1.05]);
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
    this.visual = this.plot.append("g").attr("class", "chart");

    // Build line start functions
    for (var yObj in this.yObjs) {
      const index = Object.keys(this.yObjs).indexOf(yObj);
      this.yObjs[yObj].line_start = d3
        .line()
        .x((d) => this.xScale(this.xFunct(d)))
        .y(this.yScale(0))
        .curve(index % 2 == 0 ? d3.curveNatural : d3.curveCatmullRom); // alternatively switch between d3.curveNatural & d3.curveCatmullRom
    }

    // Draw Lines
    for (var y in this.yObjs) {
      this.yObjs[y].path = this.visual
        .append("path")
        .datum(this.data)
        .attr("class", "line")
        .attr("d", this.yObjs[y].line_start)
        .style("stroke", color(y))
        .attr("data-series", y)
        .attr("fill", "none")
        .attr("stroke-width", 2)
        .attr("stroke", "#491EC4");
    }

    //Build area start functions
    for (var yObj in this.yObjs) {
      const index = Object.keys(this.yObjs).indexOf(yObj);
      this.yObjs[yObj].area_start = d3
        .area()
        .x((d) => this.xScale(this.xFunct(d)))
        .y0(this.yScale(0))
        .y1(this.yScale(0))
        .curve(index % 2 == 0 ? d3.curveNatural : d3.curveCatmullRom); // alternatively switch between d3.curveNatural & d3.curveCatmullRom
    }

    //Draw Areas
    if (this.area == true) {
      for (var y in this.yObjs) {
        this.yObjs[y].area = this.visual
          .append("path")
          .datum(this.data)
          .attr("class", "area")
          .attr("fill", color(y))
          .attr("d", this.yObjs[y].line_start)
        // .style("stroke", color(y))
        // .attr("data-series", y)
        // .attr("fill", "none")
        // .attr("stroke-width", 3)
        // .attr("stroke", "#491EC4");
      }
    }

    this.animate();
    this.tooltip();
  }

  animate() {
    // Build line end functions
    const yS = this.yScale;
    const yObs = this.yObjs;
    function getYScaleFn(yObj) {
      return (d) => yS(yObs[yObj].yFunct(d));
    }
    for (var yObj in this.yObjs) {
      const index = Object.keys(this.yObjs).indexOf(yObj);
      this.yObjs[yObj].line_end = d3
        .line()
        .x((d) => this.xScale(this.xFunct(d)))
        .y(getYScaleFn(yObj))
        .curve(index % 2 == 0 ? d3.curveNatural : d3.curveCatmullRom); // alternatively switch between d3.curveNatural & d3.curveCatmullRom
    }

    // Animate Lines
    for (var y in this.yObjs) {
      this.yObjs[y].path
        .transition()
        .ease(d3.easeBackOut)
        .duration(duration)
        .attr("d", this.yObjs[y].line_end);

      if (this.area == true) {
        for (var yObj in this.yObjs) {
          const index = Object.keys(this.yObjs).indexOf(yObj);
          this.yObjs[yObj].area_end = d3
            .area()
            .x((d) => this.xScale(this.xFunct(d)))
            .y0(this.yScale(0))
            .y1(getYScaleFn(yObj))
            .curve(index % 2 == 0 ? d3.curveNatural : d3.curveCatmullRom); // alternatively switch between d3.curveNatural & d3.curveCatmullRom
        }
        this.yObjs[y].area
          .transition()
          .ease(d3.easeBackOut)
          .duration(duration)
          .attr("d", this.yObjs[y].area_end);
      }
    }
  }

  tooltip() {
    // Tooltip Source: http://bl.ocks.org/asielen/44ffca2877d0132572cb
    const tooltips = this.plot
      .append("g")
      .attr("class", "tooltips")
      .style("opacity", 0)
      .style("transition", "200ms ease-out");

    // Tooltip line
    tooltips
      .append("line")
      .attr("class", "tooltips line")
      .attr("y1", 0)
      .attr("y2", gVar.height - gVar.margin.bottom);

    // Year label
    tooltips.append("text").attr("class", "tooltips year").attr("y", 7);
    // .attr("x", 20)
    // .attr("y", 0);

    for (var y in this.yObjs) {
      this.yObjs[y].tooltip = tooltips.append("g").attr("class", this.yObjs[y].column);
      this.yObjs[y].tooltip
        .append("circle")
        .attr("r", 5)
        .style("fill", "white")
        .style("stroke", color(y))
        .style("stroke-width", 2);

      this.yObjs[y].tooltip
        .append("rect")
        // .attr("x", 8)
        // .attr("y", -8)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("height", "1.2em")
        .style("fill", color(y));

      this.yObjs[y].tooltip
        .append("text")
        .attr("x", 10)
        .attr("dy", ".35em")
        .style("fill", "white");
    }

    const sleep = (milliseconds) => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };

    //wait till line Animation is completed - source: https://stackoverflow.com/a/56974706/6908282
    sleep(duration).then(() => {
      const xSc = this.xScale;
      const data = this.data;
      this.chart.on("touchstart touchmove mousemove", function (event) {
        tooltips.style("opacity", 0.9);
        mousemove(xSc, data, this.yObjs);
      });

      this.chart.on("touchend mouseleave", () => tooltips.style("opacity", 0));
    });

    const xSc = this.xScale;
    const xFun = this.xFunct;
    const ySc = this.yScale;
    const yFun = this.yFunct;
    const yData = this.yObjs;

    function mousemove(xScale, data) {
      const bisect = d3.bisector(xFun).left;
      let [mx, my] = d3.pointer(event, this)
      var x0 = xScale.invert(mx),
        i = bisect(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i];
      // error at this line
      var d = x0 - xFun(d0) > xFun(d1) - x0 ? d1 : d0;
      let anchor = mx > gVar.width - 100 && mx > 150 ? 'end' : 'start'
      let anchorX = mx > gVar.width - 100 && mx > 150 ? -15 : 10

      var minY = gVar.height - gVar.margin.top - gVar.margin.bottom;
      for (var y in yData) {
        yData[y].tooltip.attr(
          "transform",
          `translate(${xSc(xFun(d))},${ySc(yData[y].yFunct(d))})`
        );
        yData[y].tooltip
          .select("text")
          .text(formatValue(parseInt(yData[y].yFunct(d))))
          .attr("x", anchorX)
          .attr('text-anchor', anchor);
        minY = Math.min(minY, ySc(yData[y].yFunct(d)));

        // Update the text background rectangle size
        const text = yData[y].tooltip.select("text")
        const { x: xpos, y: ypos, width: w, height: h } = text.node().getBBox();
        yData[y].tooltip
          .selectAll("rect")
          .attr("x", xpos)
          .attr("y", ypos)
          .data([null]).join("text")
          .attr("width", parseInt(w) + 5)
      }

      tooltips
        .select(".tooltips .line")
        .attr("transform", `translate(${xSc(xFun(d))})`)
        .attr("y1", "1em");
      tooltips
        .select(".tooltips .year")
        .text(formatDate(xFun(d)))
        .attr("transform", `translate(${xSc(xFun(d)) - 5})`)
        .attr("text-anchor", "middle");
    }
  }

  legend() {
    //Draw legend
    var legend = d3.select(this.element).append("div").attr("class", "line-legend").style("margin-left", `${gVar.margin.left + 10}px`);
    for (var y in this.yObjs) {
      let series = legend.append('div').style("display", "flex").style("align-items", "baseline");
      series.append('div').attr("class", "series-marker").style("background-color", color(y));
      series.append('p').text(this.yObjs[y].column);
      this.yObjs[y].legend = series;
    }
  }
}

export default Line_Chart;

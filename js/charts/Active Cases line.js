import gVar, { formatDate, formatValue } from "../global var.js";

const duration = 2000;
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
    this.chart = chart;

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
      .call(d3.axisBottom(this.xScale))
      .attr("class", "x-axis");

    // Add the Y Axis
    this.plot
      .append("g")
      .attr("transform", `translate(${gVar.margin.left}, 0)`)
      .call(d3.axisLeft(this.yScale))
      .attr("class", "y-axis");
  }

  drawLine() {
    const visual = this.plot.append("g").attr("class", "chart");
    // define animation line at 0
    const valueline_start = d3
      .line()
      .x((d) => this.xScale(d.Date_YMD))
      .y((d) => this.yScale(0))
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
      .duration(duration)
      .attr("d", valueline_animate);

    area
      .transition()
      .ease(d3.easeBackOut)
      .duration(duration)
      .attr("d", area_path_animate);

    // Tooltip Source: https://observablehq.com/@d3/line-chart-with-tooltip
    const tooltip = this.plot.append("g").style("display", "none");

    const sleep = (milliseconds) => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };

    //wait till line Animation is completed - source: https://stackoverflow.com/a/56974706/6908282
    sleep(duration).then(() => {
      tooltip
        .append("circle")
        .attr("r", 4)
        .attr("fill", "white")
        .attr("stroke", "royalblue")
        .attr("stroke-width", 2);

      const Xscale = this.xScale;
      const x_val = (x) => this.xScale(x);
      const y_val = (y) => this.yScale(y);
      const all_data = this.data;;
      this.chart.on("touchmove mousemove", function (event) {
        const { date, value } = bisectFun(d3.pointer(event, this)[0], Xscale, all_data);
        // console.log({date, value})
        // console.log(this.yScale(500))
        tooltip
          .attr("transform", `translate(${x_val(date)},${y_val(value)})`)
          // .attr("transform", 'translate(50,0)')
          .call(callout, `${formatDate(date)}~${formatValue(parseInt(value))}`);
      });

      this.chart.on("touchend mouseleave", () => tooltip.call(callout, null));

      // Below functions ( bisectFun, callout) can be moved to separate module(js file) if necessary

      const bisectFun = (mx, XScale, data) => {
        const bisect = d3.bisector((d) => d.Date_YMD).left;
        const date = XScale.invert(mx);
        const index = bisect(data, date, 1);
        const a = data[index - 1];
        const b = data[index];
        return b && date - a.Date_YMD > b.Date_YMD - date
          ? { date: b.Date_YMD, value: b.Active }
          : { date: a.Date_YMD, value: a.Active };
      };

      const callout = (g, value) => {
        if (!value) return g.style("display", "none");

        g.style("display", null)
          .style("pointer-events", "none")
          .style("font", "10px sans-serif");

        const path = g
          .selectAll("path")
          .data([null])
          .join("path")
          .attr("fill", "white")
          .attr("stroke", "black");

        const text = g.selectAll("text").data([null]).join("text");

        const { x, y, width: w, height: h } = text.node().getBBox();

        text.call((text) =>
          text
            .selectAll("tspan")
            .data((value + "").split(/~/))
            .join("tspan")
            .attr("x", w / 2)
            .attr("y", (d, i) => `${i * 1.1}em`)
            .attr("width", w)
            .attr("height", h)
            .attr("text-anchor", "middle")
            .style("font-weight", (_, i) => (i ? null : "bold"))
            .text((d) => d.trim())
        );

        text.attr("transform", `translate(${-w / 2},${13 - y})`);
        path.attr(
            "d",
            `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 10}h-${w + 20}z`
          )
          .attr("transform", `translate(0,3)`);
      };
    });;
  }
  
}

export default Active_Case_Line;

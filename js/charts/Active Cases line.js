class Active_Case_Line {
  constructor(element, data, height, width, margin) {
    this.element = element;
    this.data = data;
    this.height = height;
    this.width = width;
    this.margin = margin;

    this.draw();
  }

  draw() {
    // this.element.innerHTML = "";
    // Adds the svg canvas
    const chart = d3
      .select(this.element)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .attr("viewBox", [0, 0, this.width, this.height])
      .classed("svg-container", true);

    this.plot = chart.append("g").attr("fill", "royalblue");

    this.createScales();
    this.drawAxis();
    this.drawLine();
  }

  createScales() {
    this.xScale = d3
      .scaleTime()
      .range([this.margin.left, this.width - this.margin.right])
      .domain(
        d3.extent(this.data, function (d) {
          return d.Date_YMD;
        })
      );

    this.yScale = d3
      .scaleLinear()
      .range([this.height - this.margin.bottom, this.margin.top])
      .domain([0, d3.max(this.data, (d) => d.Active) * 1.1]);
  }

  drawAxis() {
    // Add the X Axis
    this.plot
      .append("g")
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(this.xScale));

    // Add the Y Axis
    this.plot
      .append("g")
      .attr("transform", `translate(${this.margin.left}, 0)`)
      .call(d3.axisLeft(this.yScale));
  }

  drawLine() {
    const visual = this.plot.append("g");
    // define animation line at 0
    const starting_valueline = d3
      .line()
      .x((d) => this.xScale(d.Date_YMD))
      .y((d) => this.height - this.margin.bottom)
      .curve(d3.curveNatural);
    //curves the line

    // define the 1st line
    const valueline = d3
      .line()
      .x((d) => this.xScale(d.Date_YMD))
      .y((d) => this.yScale(d.Active))
      .curve(d3.curveNatural); //curves the line

    const area = d3
      .area()
      .x((d) => this.xScale(d.Date_YMD))
      .y0(this.yScale(0))
      .y1((d) => this.yScale(d.Active));

    // Add the valueline path.
    const path = visual
      .append("path")
      .data([this.data])
      .attr("class", "line")
      .attr("id", "line 0")
      .attr("d", starting_valueline)
      .attr("fill", "none")
      .attr("stroke-width", 4)
      .attr("stroke", "#491EC4");
    //   .attr("fill", "#cce5df")
    //   .attr("d", area);

    // Animation
    // Reference link: https://observablehq.com/@onoratod/animate-a-path-in-d3
    path.transition().ease(d3.easeBackOut).duration(1000).attr("d", valueline);
  }
}

export default Active_Case_Line;

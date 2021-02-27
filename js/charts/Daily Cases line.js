class Daily_Case_Line {
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
    const chart = d3.select(this.element).append("svg");

    chart
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .attr("viewBox", [0, 0, this.width, this.height])
      .classed("svg-container", true);

    this.plot = chart.append("g").attr("fill", "royalblue");

    this.createScales();
    this.drawAxis();
    this.drawLines();
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
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .call(d3.axisBottom(this.xScale));

    // Add the Y Axis
    this.plot
      .append("g")
      .attr("transform", `translate(${this.margin.left}, 0)`)
      .call(d3.axisLeft(this.yScale));
  }

  drawLines() {
    const visual = this.plot.append("g");

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
      .attr("id", "line 0")
      .attr("d", valueline)
      .attr("fill", "none")
      .attr("stroke-width", 4)
      .attr("stroke", "#491EC4");

    // Add the valueline2 path.
    const path2 = visual
      .append("path")
      .data([this.data])
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
      .ease(d3.easeQuad)
      .attr("stroke-dashoffset", 0)
      .duration(4000);
  }
}

export default Daily_Case_Line;

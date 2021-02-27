var formatTime = d3.timeFormat("%e %B");
class Daily_Cases_Bar {
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
    this.drawBars();
  }

  createScales() {
    this.xScale = d3
      .scaleBand()
      .domain(
        this.data.map(function (d) {
          return d.Date_YMD;
        })
      )
      .range([this.margin.left, this.width - this.margin.right])
      .padding(0.1);

    this.x2Scale = d3
      .scaleTime()
      .range([this.margin.left, this.width - this.margin.right])
      .domain(
        d3.extent(this.data, function (d) {
          return d.Date_YMD;
        })
      );

    this.yScale = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.Confirmed) * 1.1])
      .range([this.height - this.margin.bottom, this.margin.top]);
  }

  drawBars() {
    const visual = this.plot.append("g");

    const tooltip_div = d3
      .select(this.element)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
  
    visual
      .selectAll("rect")
      .data(this.data)
      .join("rect")
      .attr("x", (d) => this.xScale(d.Date_YMD))
      .attr("title", (d) => d.Confirmed)
      .attr("class", "rect")
      .attr("width", this.xScale.bandwidth())
      .attr("height", 0) // always equal to 0
      .attr("y", (d) => this.yScale(0))
      // .attr("y", d => y(d.TT))
      // .attr("height", d => y(0) - y(d.TT))
      .on("mouseover", function (event, d) {
        const no_cases = d.Confirmed.toLocaleString();
        tooltip_div.transition().duration(200).style("opacity", 0.9);
        tooltip_div
          .html("<b>" + formatTime(d.Date_YMD) + "</b>" + "<br/>" + no_cases)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 38 + "px");
      })
      .on("mouseout", function (d) {
        tooltip_div.transition().duration(500).style("opacity", 0);
      });

    // Animation
    const dataLength = d3.selectAll(this.data).size();
    this.plot
      .selectAll("rect")
      .transition()
      .duration(1000)
      .ease(d3.easeBackOut)
      .attr("y", (d) => this.yScale(d.Confirmed))
      .attr("height", (d) => this.yScale(0) - this.yScale(d.Confirmed))
      .delay(function (d, i) {
        return i * (dataLength / 60);
      });
  }

  drawAxis() {
    const m = this.margin;
    const yAxis = d3.axisLeft(this.yScale).ticks(null, this.data.format);
    // .attr("font-size", '20px')

    const xAxis = d3.axisBottom(this.x2Scale);
    // .attr("font-size", '20px')

    this.plot
      .append("g")
      .attr("transform", `translate(${this.margin.left}, 0)`)
      .call(yAxis);
    this.plot
      .append("g")
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .call(xAxis);
  }
}

export default Daily_Cases_Bar;

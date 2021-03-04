import gVar from "../global var.js";

var formatTime = d3.timeFormat("%d %B");
class Daily_Cases_Bar {
  constructor(element, data, { xName, yName }) {
    this.element = element;
    this.data = data;
    this.xFunct = (d) => d[xName];
    this.yFunct = (d) => d[yName];
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
    this.drawBars();
  }

  createScales() {
    this.xScale = d3
      .scaleBand()
      .domain(this.data.map((d) => this.xFunct(d)))
      .range([gVar.margin.left, gVar.width - gVar.margin.right])
      .padding(0.1);

    this.x2Scale = d3
      .scaleTime()
      .range([gVar.margin.left, gVar.width - gVar.margin.right])
      .domain(d3.extent(this.data, (d) => this.xFunct(d)));

    this.yScale = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.Confirmed) * 1.1])
      .range([gVar.height - gVar.margin.bottom, gVar.margin.top]);
  }

  drawAxis() {
    const yAxis = d3.axisLeft(this.yScale).ticks(null, this.data.format);
    // .attr("font-size", '20px')

    const xAxis = d3.axisBottom(this.x2Scale);
    // .attr("font-size", '20px')

    this.plot
      .append("g")
      .attr("transform", `translate(${gVar.margin.left}, 0)`)
      .attr("class", "x-axis")
      .call(yAxis);

    this.plot
      .append("g")
      .attr("transform", `translate(0,${gVar.height - gVar.margin.bottom})`)
      .attr("class", "y-axis")
      .call(xAxis);
  }

  drawBars() {
    const visual = this.plot.append("g").attr("class", "chart");

    visual
      .selectAll("rect")
      .data(this.data)
      .join("rect")
      .attr("x", (d) => this.xScale(this.xFunct(d)))
      .attr("title", (d) => d.Confirmed)
      .attr("class", "rect")
      .attr("width", this.xScale.bandwidth())
      .attr("height", 0) // always equal to 0
      .attr("y", (d) => this.yScale(0));

    // Tooltip
    const tooltip_div = d3
      .select(this.element)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("transition", "200ms ease-out");

    const yF = (d) => this.yFunct(d);
    const xF = (d) => this.xFunct(d);
    visual
      .selectAll("rect")
      .on("touchmove mousemove", function (event, d) {
        const no_cases = yF(d).toLocaleString();
        tooltip_div.transition().style("opacity", 0.9);
        tooltip_div
          .html("<b>" + formatTime(xF(d)) + "</b>" + "<br/>" + no_cases)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 38 + "px");
      })
      .on("touchend mouseleave", function (d) {
        tooltip_div.transition().style("opacity", 0);
      });

    // Animation
    const dataLength = d3.selectAll(this.data).size();
    this.plot
      .selectAll("rect")
      .transition()
      .duration(1000)
      .ease(d3.easeBackOut)
      .attr("y", (d) => this.yScale(this.yFunct(d)))
      .attr("height", (d) => this.yScale(0) - this.yScale(this.yFunct(d)))
      .delay(function (d, i) {
        return i * (dataLength / 60);
      });
  }
}

export default Daily_Cases_Bar;

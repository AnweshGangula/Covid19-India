import gVar, { formatDate, formatValue, duration } from "../global var.js";

class Active_Case_Line {
  constructor(element, data) {
    this.element = element;
    this.data = data;
  }

  draw() {
    // this.element.innerHTML = "";
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
      .curve(d3.curveNatural); //curves the line

    const area_path_start = d3
      .area()
      .x((d) => this.xScale(d.Date_YMD))
      .y0(this.yScale(0))
      .y1(this.yScale(0));

    this.path = visual
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

    this.area = visual
      .append("path")
      .data([this.data])
      .attr("fill", "#cce5df")
      .attr("d", area_path_start);

    this.animate();
    this.tooltip();
  }

  animate() {
    // Reference link: https://observablehq.com/@onoratod/animate-a-path-in-d3

    const valueline_animate = d3
      .line()
      .x((d) => this.xScale(d.Date_YMD))
      .y((d) => this.yScale(d.Active))
      .curve(d3.curveNatural); //curves the line

    const area_path_animate = d3
      .area()
      .x((d) => this.xScale(d.Date_YMD))
      .y0(this.yScale(0))
      .y1((d) => this.yScale(d.Active));

    this.path
      .transition()
      .ease(d3.easeBackOut)
      .duration(duration)
      .attr("d", valueline_animate);

    this.area
      .transition()
      .ease(d3.easeBackOut)
      .duration(duration)
      .attr("d", area_path_animate);
  }

  tooltip() {
    // Tooltip Source: https://observablehq.com/@d3/line-chart-with-tooltip
    const tooltip = this.plot.append("g").style("transition", "200ms ease-out");

    const sleep = (milliseconds) => {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    };

    //wait till line Animation is completed - source: https://stackoverflow.com/a/56974706/6908282
    sleep(duration).then(() => {
      const Xscale = this.xScale;
      const x_val = (x) => this.xScale(x);
      const y_val = (y) => this.yScale(y);
      const data = this.data;
      this.chart.on("touchstart touchmove mousemove", function (event) {
        const bData = bisectFun(Xscale, data);
        tooltip
          .style("opacity", 0.9)
          .attr(
            "transform",
            `translate(${x_val(bData.Date_YMD)},${y_val(bData.Active)})`
          )
          .call(
            callout,
            `${formatDate(bData.Date_YMD)}~${formatValue(
              parseInt(bData.Active)
            )}`
          );
      });

      this.chart.on("touchend mouseleave", () =>
        tooltip.style("opacity", 0).call(callout, null)
      );
    });
  }
}

// Below functions ( bisectFun, callout) can be moved to separate module(js file) if necessary
function bisectFun(xScale, data) {
  const bisect = d3.bisector((d) => d.Date_YMD).left;
  const date = xScale.invert(d3.pointer(event, this)[0]);
  const i = bisect(data, date, 1);
  // console.log(i);
  const d0 = data[i - 1];
  const d1 = data[i];
  return date - d0.Date_YMD > d1.Date_YMD - date ? d1 : d0;
}

function callout(g, value) {
  if (!value) return g;

  g.style("pointer-events", "none").style("font", "10px sans-serif");

  g.selectAll("circle")
    .data([null])
    .enter()
    .append("circle")
    .attr("r", 4)
    .attr("fill", "white")
    .attr("stroke", "royalblue")
    .attr("stroke-width", 2);

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
      .attr("y", (d, i) => `${i * 1.3}em`)
      .attr("width", w)
      .attr("height", h)
      .attr("text-anchor", "middle")
      .style("font-weight", (_, i) => (i ? null : "bold"))
      .text((d) => d.trim())
  );

  text.attr("transform", `translate(${-w / 2},${13 - y})`);
  const Props = { pad: 10, bzr: 3 };
  const length = w + Props.pad * 2;
  const height = h + Props.pad * 1.5;

  const tooltipPath_old = `M${-length / 2}, 5H-5l5,-5l5, 5H${length / 2
    }v${height}h-${length}z`;

  const tooltipPath = `M -${length / 2} ${5 + Props.bzr} Q -${length / 2} 5 -${length / 2 - Props.bzr
    } 5 H -5 l 5 -5 l 5 5 H ${length / 2 - Props.bzr} Q ${length / 2} 5 ${length / 2
    } ${5 + Props.bzr} v ${height - 5 - Props.bzr - 1} Q ${length / 2
    } ${height} ${length / 2 - 1} ${height} h -${length - 3} Q -${length / 2
    } ${height} -${length / 2} ${height - 1} z`;

  const tooltipPath_small = `M -${length / 2} ${5 + Props.bzr} Q -${length / 2
    } 5 -${length / 2 - Props.bzr} 5 H -5 l 5 -5 l 5 5 H ${length / 2 - Props.bzr
    } Q ${length / 2} 5 ${length / 2} ${5 + Props.bzr} v${height - 5
    }h-${length}z`;

  path.attr("d", tooltipPath).attr("transform", `translate(0,3)`);
}

export default Active_Case_Line;

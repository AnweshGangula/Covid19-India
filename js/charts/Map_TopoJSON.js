import { formatDate } from "../global var.js";

//Reference: https://stackoverflow.com/a/66622694/6908282
class Map {
    constructor(element, mapJson, CurrentData) {
        this.element = element;
        this.mapJson = mapJson;
        this.CurrentData = CurrentData
    }

    draw() {
        let width = 700,
            height = 750;

        let path = d3.geoPath()
        // .projection(null);

        let latestDate = this.CurrentData[0].Date_YMD
        let Cases_Range = d3.extent(this.CurrentData, (d) => +d.Active)
        let Avg_Cases = parseInt(d3.mean(this.CurrentData, (d) => +d.Active))
        // let color = d3.scaleLinear().range(["#D4EEFF", "#0099FF"]).domain(Cases_Range);
        let color = d3.scaleSequential(d3.interpolateYlOrRd).domain(Cases_Range);

        // console.log({ Cases_Range, Avg_Cases })

        d3.select(this.element)
            .append("p")
            // .style("text-align", "center")
            .html(`Active Cases by State as on <b>${formatDate(latestDate)}<b>`)

        this.chart = d3.select(this.element).append("svg")
            .attr("width", width)
            .attr("height", height);

        this.plot = this.chart.append("g")

        this.plot.attr("id", "Map").attr("transform", "scale(1.3)");

        // reference for "new Map" - https://observablehq.com/@gangula/covid-19-india-map
        let new_data = new Map(this.CurrentData.map(function (d) { return [d.State, +d.Active]; }))
        // console.log(new_data)

        // Primise.all reference: https://stackoverflow.com/a/51113326/6908282
        Promise.all([
            d3.json(this.mapJson)
        ])
            .then((files) => ready(this.plot, files, this.CurrentData))

        function ready(svg, files, cases) {
            // CasesById is used instead of new_data since "new Map" is not working - reference: http://bl.ocks.org/denisemauldin/cb870e6f439864a5ae74d4fc561ac46f
            const CasesById = {};
            const mapData = topojson.feature(files[0], files[0].objects.states);

            cases.forEach(d => { CasesById[d.State] = +d.Active; });
            mapData.features.forEach(d => { d.Active = CasesById[d.id] });

            svg.selectAll("path")
                .data(mapData.features)
                .join("path")
                .attr("d", path)
                .attr("fill", d => color(d.Active))
                .attr("stroke", color(Cases_Range[1]))
                .attr("class", "state")
                .attr("Title", d => `${d.id}: ${d.Active}`);
        };

        this.tooltip();
    }

    tooltip() {
        let tooltip_div = d3.select(this.element).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)

        let svg = this.chart

        this.plot
            .on("touchmove mousemove mouseover", function (event, d) {
                // Using d3.pointer to adjust with transform: scale - Reference: https://stackoverflow.com/q/64189608/6908282
                let [mx, my] = d3.pointer(event, svg.node());
                // console.log(mouse)
                let hover_data = event.path[0].__data__
                tooltip_div.transition().style("opacity", 0.9);
                tooltip_div
                    .html(`<b>${hover_data.id}</b><br>${hover_data.Active.toLocaleString()}`)
                    .style("left", `${mx}px`)
                    .style("top", `${my - 3}px`);
            })
            .on("touchend mouseleave", function (d) {
                tooltip_div.transition().style("opacity", 0);
            });
    }

}

export default Map;
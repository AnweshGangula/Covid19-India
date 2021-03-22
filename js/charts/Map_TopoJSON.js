//Reference: https://stackoverflow.com/a/66622694/6908282
class Map {
    constructor(element, mapJson, CurrentData) {
        this.element = element;
        this.mapJson = mapJson;
        this.CurrentData = CurrentData
    }

    draw() {
        let width = 900,
            height = 600;

        let path = d3.geoPath()
        // .projection(null);

        // let color = d3.scaleLinear().range(["#D4EEFF", "#0099FF"])
        let Cases_Range = d3.extent(this.CurrentData, (d) => +d.Active)
        let Avg_Cases = parseInt(d3.mean(this.CurrentData, (d) => +d.Active))
        let color = d3.scaleOrdinal(d3.schemeBlues[9]).domain(Cases_Range)

        // console.log({ Cases_Range, Avg_Cases })

        let svg = d3.select(this.element).append("svg")
            .attr("width", width)
            .attr("height", height);

        // reference for "new Map" - https://observablehq.com/@gangula/covid-19-india-map
        let new_data = new Map(this.CurrentData.map(function (d) { return [d.State, +d.Active]; }))
        // console.log(new_data)

        // Primise.all reference: https://stackoverflow.com/a/51113326/6908282
        Promise.all([
            d3.json(this.mapJson)
        ])
            .then((files) => ready(files, this.CurrentData))

        function ready(files, cases) {
            // CasesById is used instead of new_data since Map is not working - reference: http://bl.ocks.org/denisemauldin/cb870e6f439864a5ae74d4fc561ac46f
            const CasesById = {};
            const mapData = topojson.feature(files[0], files[0].objects.states);

            cases.forEach(d => { CasesById[d.State] = +d.Active; });
            mapData.features.forEach(d => { d.Active = CasesById[d.State] });

            svg.append("g")
                .selectAll("path")
                .data(mapData.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("fill", d => color(CasesById[d.id]))
                .attr("stroke", color(Cases_Range[1]))
                .attr("class", "state")
                .attr("Title", d => d.id + ": " + CasesById[d.id]);
        };
    }

}

export default Map;
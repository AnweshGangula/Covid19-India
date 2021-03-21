//Reference: https://stackoverflow.com/a/66622694/6908282
class Map {
    constructor(element, data) {
        this.element = element;
        this.data = data;
    }

    draw() {
        let width = 900,
            height = 600;

        let path = d3.geoPath()
        // .projection(null);

        let svg = d3.select(this.element).append("svg")
            .attr("width", width)
            .attr("height", height);

        // You can replace fetch with Async/Await with Node.js : https://stackoverflow.com/a/48475017/6908282
        d3.json(this.data)
            .then(ready)

        function ready(json) {
            svg.append("g")
                .selectAll("path")
                .data(topojson.feature(json, json.objects.states).features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "state");
        };
    }

}

export default Map;
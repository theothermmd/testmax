import LineManager from "./LineManager.js";
import DataManager from "./DataManager.js";
import WordUtils from "./WordUtils.js";


class Routing {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.stations = this.dataManager.stations;
        this.graphs = {
            lines: {},
            graph_all: {},
            linetoline: {},
        };

        for (let i = 1; i < 8; i++) {
            this.graphs.lines[`line_${i}`] = this.create_graph({
                stations: { [`line_${i}`]: this.stations["stations"][`line_${i}`] },
            });
        }

        for (let i = 1; i < 8; i++) {
            for (let j = 1; j < 8; j++) {
                if (i !== j) {
                    const key = `line_${i}toline_${j}`;
                    const stations = {
                        [`line_${i}`]: this.stations["stations"][`line_${i}`],
                        [`line_${j}`]: this.stations["stations"][`line_${j}`],
                    };
                    this.graphs.linetoline[key] = this.create_graph({ stations });
                }
            }
        }

        let key = "line_parandtoline_1";
        let stations = {
            "line_parand": this.stations["stations"]["line_parand"],
            "line_1": this.stations["stations"]["line_1"],
        };
        this.graphs["linetoline"][key] = this.create_graph({ stations });

        key = "line_1toline_parand";
        stations = {
            "line_1": this.stations["stations"]["line_1"],
            "line_parand": this.stations["stations"]["line_parand"],
        };
        this.graphs["linetoline"][key] = this.create_graph({ stations });

        this.graphs.graph_all = this.create_graph(this.stations);
    }

    create_graph(data) {
        const graph = {};

        for (let line in data.stations) {
            let stations = data.stations[line];
            if (!stations) continue;

            try {
                for (let i = 0; i < stations.length; i++) {
                    if (!stations[i]) continue;

                    if (!(stations[i] in graph)) {
                        graph[stations[i]] = [];
                    }
                    if (i > 0) {
                        graph[stations[i]].push(stations[i - 1]);
                    }
                    if (i < stations.length - 1) {
                        graph[stations[i]].push(stations[i + 1]);
                    }
                }
            } catch (error) {
                console.log("Error in create_graph:", error);
                console.log(data);
            }
        }
        return graph;
    }

    shortestPath(source, destination) {
        let lineManager = new LineManager(this.dataManager.line_lookup, this.dataManager.stations);
        let wordUtils = new WordUtils(this.dataManager.stations_names);

        source = wordUtils.findClosestWord(source);
        destination = wordUtils.findClosestWord(destination);

        if (!source || !destination) {
            throw new Error("ایستگاه مورد نظر یافت نشد");
        }

        let lineSource = lineManager.get_line_for_station(source);
        let lineDest = lineManager.get_line_for_station(destination);

        if (lineSource === lineDest) {
            this.graphRouting = this.graphs.lines[lineSource];
            console.log("all1");

            
        } else if ( new Set( this.stations[ lineManager.get_line_for_station(source) ] ).has( this.stations[ lineManager.get_line_for_station(destination) ] ) ) {
            this.graphRouting = this.graphs.linetoline[`${lineSource}to${lineDest}`];
            console.log("all2");
        } else {
            this.graphRouting = this.graphs.graph_all;
            console.log("all3");
        }

        let queue = [[source, [source]]];
        let visited = new Set();

        while (queue.length) {
            let [currentStation, path] = queue.shift();
            if (currentStation === destination) return path;
            visited.add(currentStation);

            if (!this.graphRouting[currentStation]) continue;

            for (let neighbor of this.graphRouting[currentStation]) {
                if (!visited.has(neighbor)) {
                    queue.push([neighbor, [...path, neighbor]]);
                }
            }
        }
        return null;
    }
}

async function main() {
    const datamanager = new DataManager();
    await datamanager.init();
    let routing = new Routing(datamanager);
    console.log(routing.shortestPath("زمزم", "ورزشگاه آزادی"));
}

main();
export default Routing;

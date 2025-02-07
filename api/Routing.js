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
        let x = []
        for (let i = 1; i < 8; i++) {
            for (let j = 1; j < 8; j++) {
                x = this.stations["stations"][`line_${i}`].filter(n => this.stations["stations"][`line_${j}`].includes(n))
                if (i !== j && x.length > 0) {
                    
                    const key = `line_${i}toline_${j}`;

                    const stations = {
                        [`line_${i}`]: this.stations["stations"][`line_${i}`],
                        [`line_${j}`]: this.stations["stations"][`line_${j}`],
                    };
                    if (!( `line_${i}` in this.graphs.linetoline)) {
                        this.graphs.linetoline[`line_${i}`] = {}
                    }
                    this.graphs.linetoline[`line_${i}`][`line_${j}`] = this.create_graph({ stations });
                    
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
            }
        }
        return graph;
    }
    find_intersection(arr1 , arr2) {
        let x = arr1.filter(n => arr2.includes(n))
        return x
    }

    shortestPath(source, destination) {
        let wordUtils = new WordUtils(this.dataManager.stations_names);

        source = wordUtils.findClosestWord(source);
        destination = wordUtils.findClosestWord(destination);

        if (!source || !destination) {
            throw new Error("ایستگاه مورد نظر یافت نشد");
        }
        let source_line = this.dataManager.stations_line[source];
        let destination_line = this.dataManager.stations_line[destination];
        let y = this.find_intersection(source_line , destination_line)

        if (y == 1) {
            this.graphRouting = this.graphs.lines[source_line[0]];
            console.log("all1");

        } else {
            let flg = true;
            for (let source_line_one of source_line) {
    
                if (flg) {
    
                    for (let destination_line_one of destination_line) {
    
                        if (source_line_one in this.graphs.linetoline) {
    
                            if (destination_line_one in this.graphs.linetoline[source_line_one]) {
    
                                this.graphRouting = this.graphs.linetoline[source_line_one][destination_line_one];
                                flg = false;
    
                            }
                        }
                    }
                }
    
            }
         
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
    let routing = new Routing(datamanager);
    // console.log(datamanager.stations_line);
    console.log(routing.shortestPath("نبرد", "قلهک"));
}
main()
export default Routing;

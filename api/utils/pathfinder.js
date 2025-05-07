

import WordUtils from './WordUtils.js'
class pathfinder {
    constructor(db) {
        this.lines = db.lines
        this.wordUtils = new WordUtils();
        this.stations_line = db.stations_line
        this.stations_names = db.stations_names
        this.graphs = {
            lines: {},
            graph_all: {},
            linetoline: {},
        };

        // one line
        let lines_names = ['1' ,'2' ,'3' ,'4' ,'5' ,'6' ,'7', 'parand' , 'hashtgerd' , 'mehrabad']
        for (let line_name of lines_names) {
            this.graphs.lines[line_name] = this.create_graph({ [line_name]: this.lines[line_name].get_stations_list() });
        }
        let all = {}
        for (let line_name of lines_names) {
            all[line_name] = this.lines[line_name].get_stations_list() 

        }
        this.graphs.graph_all = this.create_graph(all);

        let x = []
        for (let line_name_1 of lines_names) {
            for (let line_name_2 of lines_names) {
                x = this.lines[line_name_1].get_stations_list().filter(n => this.lines[line_name_2].get_stations_list().includes(n))
                if (line_name_1 !== line_name_2 && x.length > 0) {

                    const stations = {
                        [line_name_1]: this.lines[line_name_1].get_stations_list(),
                        [line_name_2]: this.lines[line_name_2].get_stations_list(),
                    };
                    if (!(line_name_1 in this.graphs.linetoline)) {
                        this.graphs.linetoline[line_name_1] = {}
                    }
                    this.graphs.linetoline[line_name_1][line_name_2] = this.create_graph( stations );
                    
                }
            }
        }



    }
    find_intersection(arr1 , arr2) {
        let x = arr1.filter(n => arr2.includes(n))
        return x
    }

    shortestPath(source, destination) {
        // let wordUtils = new WordUtils(this.stations_names);

        // source = wordUtils.findClosestWord(source);
        // destination = wordUtils.findClosestWord(destination);

        // if (!source || !destination) {
        //     throw new Error("ایستگاه مورد نظر یافت نشد");
        // }
        let source_line = this.stations_line[source];
        let destination_line = this.stations_line[destination];
        let y = this.find_intersection(source_line , destination_line)
        this.graphRouting = {}
        if (y.length === 1) {
            let lines = source_line.filter(n => n in destination_line)
            this.graphRouting = this.graphs.lines[lines];

        } else {
            
            for (let i of source_line) {

                if (i in this.graphs.linetoline) {

                    for (let j of destination_line) {
                        console.log("ji1")
                        if (j in this.graphs.linetoline[i]) {
                            console.log("ji")
                            this.graphRouting = this.graphs.linetoline[i][j];
                            
                        }
                    }
                }
            }
        }
        if (!this.graphRouting || Object.keys(this.graphRouting).length === 0) {
            this.graphRouting =  this.graphs.graph_all
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

        
    create_graph (data) {
            const graph = {};
            for (let line in data) {
                let stations = data[line];
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

} 




// let db = new DataLoader();
// // console.log(db.lines['6'].get_stations_list())
// let rt = new pathfinder(db);
// console.log(rt.shortestPath("زمزم", "آیت الله کاشانی"))

export default pathfinder;
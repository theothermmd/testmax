import { stations , 
    line_1_times , 
    line_2_times , 
    line_3_times , 
    line_4_times , 
    line_5_times , 
    line_6_times , 
    line_7_times , 
    line_parand_times , 

 } from './data.js';
 
class DataManager {
    constructor() {
        this.stations = stations; 
        this.stations_times = {"line_1" : line_1_times, "line_2" : line_2_times, "line_3" : line_3_times, "line_4" : line_4_times, "line_5" : line_5_times, "line_6" : line_6_times, "line_7" : line_7_times, "line_parand" : line_parand_times};
        this.stations_names = [];
        this.terminals = {};
        this.line_lookup = new Map();
        this.stations_line = {}
        for (let line in this.stations['stations']) {
            this.terminals[line] = { [line]: [this.stations['stations'][line][0], this.stations['stations'][line].at(-1)] };
            for (let station of this.stations['stations'][line]) {
                this.stations_names.push(station);
            }
        }
        for (const [line, stations] of Object.entries(this.stations['stations'])) {
            for (let i = 0; i < stations.length - 1; i++) {
                const key1 = JSON.stringify([stations[i], stations[i + 1]]);
                const key2 = JSON.stringify([stations[i + 1], stations[i]]);
                this.line_lookup.set(key1, line);
                this.line_lookup.set(key2, line);
            }
        }
        for (let [line, stations] of Object.entries(this.stations['stations']))  {
            for (let station of stations) {
                if (!(station in this.stations_line)) {
                    this.stations_line[station] = [];
                    this.stations_line[station].push(line);
                    continue
                }
                if (!(line in this.stations_line[station])) {
                    this.stations_line[station].push(line);
                }
                
            }
        }
    }
}

export default DataManager;

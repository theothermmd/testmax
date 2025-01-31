import Datamanager from './Datamanager.js'

class LineManager {

    constructor (line_lookup , stations , terminals) {
        this.line_lookup = line_lookup;
        this.stations = stations;
        this.terminals = terminals;

    }
    find_terminal_direction(line, current_station, next_station) {
        const stations = this.stations["stations"][line];
        return stations.indexOf(current_station) < stations.indexOf(next_station) ? this.terminals[line][line][1] : this.terminals[line][line][0];
    }
    
    get_line_for_station(stations1 , stations2 = false) {

        if (stations2 != false) {

            const key = JSON.stringify([stations1, stations2]);
            
            return this.line_lookup.get(key) || null;

        } 

        else {

            for (const [line , stations] of Object.entries(this.stations['stations'])) {
                for (let i = 0; i < stations.length - 1 ; i++) {
                    if (stations1 == stations[i]) {
                        return line;
                    }
                }
            }

        }
    
    }
    get_line_color(line_name) {
        const line_colors = {
            "line_1": "قرمز",
            "line_2": "آبی",
            "line_3": "آبی آسمانی",
            "line_4": "زرد",
            "line_5": "سبز",
            "line_6": "صورتی",
            "line_7": "بنفش",
        }
        return line_colors[line_name] || "Unknown";
    }


} 
// async function find_best_route () {
//     const datamanager = new Datamanager();
//     await datamanager.init();
//     const lineManager = new LineManager(datamanager.line_lookup , datamanager.stations , datamanager.terminals);
//     console.log(lineManager.find_terminal_direction("line_3" , "زمزم" , "جوادیه"));



// }

// find_best_route();



export default LineManager;



class LineManager {

    constructor (line_lookup , lines , terminals) {
        this.line_lookup = line_lookup;
        this.lines = lines;
        this.terminals = terminals;

    }
    find_terminal_direction(line, current_station, next_station) {
        const stations = this.lines[line].get_stations_list();
        return stations.indexOf(current_station) < stations.indexOf(next_station) ? this.terminals[line][line][1] : this.terminals[line][line][0];
    }
    
    get_line_for_station(stations1 , stations2 = false) {

        if (stations2 !== false) {

            const key = JSON.stringify([stations1, stations2]);
            return this.line_lookup.get(key) || null;

        } 

        else {

            for (const [line , stations] of Object.entries(this.stations['stations'])) {
                for (let i = 0; i < stations.length - 1 ; i++) {
                    if (stations1 === stations[i]) {
                        return line;
                    }
                }
            }

        }
    
    }
    get_line_color(line_name) {
        const line_colors = {
            "line_1": "قرمز",
            "line_parand": "قرمز",
            "line_2": "آبی",
            "line_3": "آبی آسمانی",
            "line_4": "زرد",
            "line_mehrabad": "زرد",
            "line_5": "سبز",
            "line_hashtgerd": "سبز",
            "line_6": "صورتی",
            "line_7": "بنفش",

        }
        return line_colors["line_" + line_name] || "Unknown";
    }


} 
// let db = new DataLoader();
// const lineManager = new LineManager(db.line_lookup , db.lines, db.terminals)
// console.log(lineManager.get_line_for_station("شهید بهشتی" , "مصلی امام خمینی"))


export default LineManager;
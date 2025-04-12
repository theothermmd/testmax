import db from './db.js';
import Station from '../models/station.js';
import Line from '../models/line.js';
import WordUtils from './WordUtils.js'
class DataLoader {
    constructor() {
        this.wordUtils = new WordUtils ();
        this.db = db;
        this.lines = {};
        this.line_lookup = new Map();
        this.terminals = {};
        this.stations_names = [];
        this.stations_line = {};
        this.stations_times = {};
        for ( let [line , stations] of Object.entries(db)) {

            this.stations_list = []

            for (let [station , station_data] of Object.entries(stations)) {
                if (station_data.active) {
                    this.stations_names.push(this.wordUtils.correctPersianText(station))
                    this.stations_list.push( new Station(this.wordUtils.correctPersianText(station), station_data ) )
                }

            }

            this.lines[line] = new Line(line , this.stations_list);


            this.terminals[line] = { [line]: [this.stations_list[0].get_persian_name(), this.stations_list.at(-1).get_persian_name()] };
            
        }
        for (const [line, stations_max] of Object.entries(db)) {
            let stations = []
            for (const [name , data] of Object.entries(stations_max)) {
                if (data.active) {
                    stations.push(this.wordUtils.correctPersianText(name))
                }
                
            }
            for (let i = 0; i < stations.length - 1; i++) {
                const key1 = JSON.stringify([stations[i], stations[i + 1]]);
                const key2 = JSON.stringify([stations[i + 1], stations[i]]);
                this.line_lookup.set(key1, line);
                this.line_lookup.set(key2, line);
            }

        }
        for (let [line, stations] of Object.entries(db))  {
            for (let [station_name , station_data ] of Object.entries(stations)) {
                if (station_data.active) {
                    if (!(this.wordUtils.correctPersianText(station_name) in this.stations_line)) {
                        this.stations_line[this.wordUtils.correctPersianText(station_name)] = [];
                    }
                    if (!(line in this.stations_line[this.wordUtils.correctPersianText(station_name)])) {
                        this.stations_line[station_name].push(line);
                    }
                }

            }
        }
    }
}

// let dataLoader = new DataLoader();
// console.log(dataLoader.lines['1'].get_station_by_name("تجریش").get_time('عادی' , 'تجریش'))
export default DataLoader;
import WordUtils from '../utils/WordUtils.js'

class Line {
    constructor(name , stations) {
        this.wordUtils = new WordUtils ();

        this.name = name;
        this.stations = stations;
        this.stations_names = [];

        for (let item of stations) {
            if (item.active) {
                this.stations.push(i);
            }
            this.stations_names.push(item.get_persian_name())
        }
        this.terminals = [stations[0], stations[stations.length - 1]];


    }
    get_stations () {
        return this.stations;
    }
    get_stations_list () {
        let ls = []
        for (let station of this.stations) {
            ls.push(this.wordUtils.correctPersianText(station.get_persian_name()))
        }
        return ls;
    }

    get_station_by_name (name) {
        for (let i of this.stations) {
            if (i.get_persian_name() == name) {
                return i
            }
        }
    }

}
export default Line;
import LineManager from "./LineManager.js";

class TravelInfo {

    constructor () {
        this.lineManager = new LineManager();
    }

    add_overview_entry(overview, station_name, time, line_name, is_line_change, message = "") {

        overview.push(
            {
                "station_name": station_name,
                "time": time,
                "color": this.lineManager.get_line_color(line_name),
                "is_line_change": is_line_change,
                "message": message,
            }
        )
    }
    add_travel_guide_entry(travel_guide, flag, station_name, line_name, terminal) {

        if (flag.toLocaleLowerCase() == "source") {
            travel_guide.push(`در ایستگاه ${station_name} وارد خط ${line_name} شوید و به سمت ${terminal} سوار مترو شوید.`)
        }

        else if (flag.toLocaleLowerCase() == "change") {
            travel_guide.push(`در ایستگاه ${station_name} از مترو پیاده شوید. سپس وارد خط ${line_name} شده و به سمت ${terminal} سوار مترو شوید.`)
        }

        else if (flag.toLocaleLowerCase() == "destination") {
            travel_guide.push(`در ایستگاه ${station_name} از مترو پیاده شوید و از ایستگاه خارج شوید. `)
        }

    }
    check_cost(distance) {
        const costs_in_city = {
            2: 33.000,
            4: 33.412,
            6: 33.824,
            8: 34.236,
            10: 34.648,
            12: 35.060,
            15: 35.678,
            18: 36.296,
            22: 37.120,
            26: 37.944,
            30: 38.768,
        }
        const obj = Object.keys(costs_in_city)
        if (distance < obj[0]) {
            return costs_in_city[2]
        }
        for (let i = 0; i < obj.length; i++) {
            if (obj[i] <= distance && distance <= obj[i + 1]) {
                return costs_in_city[obj[i + 1]]
            }
        }
    }
} export default TravelInfo;
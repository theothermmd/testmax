import Datamanager from "./DataManager.js";
import WordUtils from './WordUtils.js'
import LineManager from './LineManager.js'
import Routing from './Routing.js'
import ScheduleManager from './ScheduleManager.js'
import TravelInfo from './TravelInfo.js'



export async function find_best_route (sourcex , destinationx , type_day , time) {
    const datamanager = new Datamanager();
    await datamanager.init();
    const travelInfo = new TravelInfo();
    const wordutils = new WordUtils(datamanager.stations_names);
    const lineManager = new LineManager(datamanager.line_lookup , datamanager.stations , datamanager.terminals);
    const routing = new Routing(datamanager); 
    const scheduleManager = new ScheduleManager();

    

    const source = wordutils.findClosestWord(sourcex);
    const destination = wordutils.findClosestWord(destinationx);
    if (source === destination) {
        return {"status": true , 'isrouting' : "yes"}
    }
    if (!['عادی', 'پنجشنبه', 'جمعه'].includes(type_day)) {
        return {"status": true , 'isrouting' : false};
    }
    if (source === null || source === undefined || destination === null || destination === undefined) {
        return {"status": true , 'isrouting' : "no"};
    }
    let now = "";
    let start_time = "";
    if (time == '') {
        now = new Date();
        now = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tehran' }));
        start_time = new Date(now);
        
    } else {

        now = scheduleManager.parseTime(time);
        start_time = scheduleManager.parseTime(time);
    }

    const startTime = scheduleManager.parseTime("5:00");
    const endTime = scheduleManager.parseTime("23:00");
    
    if (now.getTime() < startTime.getTime() || now.getTime() > endTime.getTime()) {
        return {"status": true , 'isrouting' : false , 'message' : "no_service"};
    }
    
    const route = routing.shortestPath(source, destination);
    let corrent_line = lineManager.get_line_for_station(route[0], route[1]);
    let terminal_direction= lineManager.find_terminal_direction(corrent_line, route[0], route[1]);
    let overview = [];
    let travel_guide = [];
    let travel_cost = 0;
    let times = {};
    let next_train = "";
    for (let i = 0; i < route.length; i++ ) {
        if (i + 1 < route.length) {

            if (lineManager.get_line_for_station(route[i], route[i + 1]) != corrent_line) {
                corrent_line = lineManager.get_line_for_station(route[i], route[i - 1]);
                times = datamanager.stations_times[corrent_line][corrent_line][type_day][terminal_direction][route[i]]
                now = scheduleManager.get_next_time(times , now);

                corrent_line = lineManager.get_line_for_station(route[i], route[i + 1]);
                terminal_direction = lineManager.find_terminal_direction(corrent_line, route[i], route[i + 1]);
                travelInfo.add_overview_entry(
                    overview,
                    route[i],
                    now,
                    corrent_line,
                    true,
                    `در ایستگاه ${route[i]} از قطار پیاده شده و با توجه به تابلو های راهنمای به سمت ${terminal_direction} وارد خط ${lineManager.get_line_for_station(route[i], route[i + 1]).replace('line_', '')} شوید.`
                );
                travelInfo.add_travel_guide_entry(
                    travel_guide,
                    "change",
                    route[i],
                    lineManager.get_line_for_station(route[i], route[i + 1]).replace("line_", ""),
                    terminal_direction
                );
                now = scheduleManager.get_next_time(times , now);
                travelInfo.add_overview_entry(
                    overview,
                    route[i],
                    now,
                    corrent_line,
                    false,
                    ""
                );
                travel_cost += 2
            }
            else {
                if (i == 0) {
                    travelInfo.add_travel_guide_entry(
                        travel_guide,
                        "source",
                        route[i],
                        lineManager.get_line_for_station(route[i], route[i + 1]).replace("line_", ""),
                        terminal_direction
                    );

                }
                corrent_line = lineManager.get_line_for_station(route[i], route[i + 1]);

                times = datamanager.stations_times[corrent_line][corrent_line][type_day][terminal_direction][route[i]]

                
                now = scheduleManager.get_next_time(times , now);
                if (i ==0) {
                    const next_temp = scheduleManager.parseTime(now) - start_time;
                    const next_temp_m = Math.floor((next_temp % (1000 * 60 * 60)) / (1000 * 60));
                    next_train = next_temp_m;
                }
                travelInfo.add_overview_entry(
                    overview,
                    route[i],
                    now,
                    corrent_line,
                    false,
                    ""
                );
            }

        }
        else {

            terminal_direction = lineManager.find_terminal_direction(corrent_line, route[i - 1], route[i]);
            let x = lineManager.get_line_for_station(route[i], route[i - 1]);
            times = datamanager.stations_times[x][x][type_day][terminal_direction][route[i]];
            now = scheduleManager.get_next_time(times , now);
            travelInfo.add_overview_entry(
                overview,
                route[i],
                now,
                corrent_line,
                false,
                ""
            );
            travelInfo.add_travel_guide_entry(
                travel_guide,
                "destination",
                route[i],
                lineManager.get_line_for_station(route[i], route[i - 1]).replace("line_", ""),
                terminal_direction
            );
            travel_cost += 2

        }
    }
    const travel_duration_ms = scheduleManager.parseTime(now) - start_time;
    const travel_hours = Math.floor(travel_duration_ms / (1000 * 60 * 60)); 
    const travel_minutes = Math.floor((travel_duration_ms % (1000 * 60 * 60)) / (1000 * 60));


    return {
        "status": true,
        'isrouting' : true,
        "fail" : false,
        "route": overview,
        "travel_duration": `${travel_hours}:${travel_minutes.toString().length == 1 ? "0" + travel_minutes : travel_minutes}`,
        "travel_cost": travelInfo.check_cost(travel_cost),
        "travel_guide": travel_guide,
        "next_train": next_train,
        "arrival_times": now,
    };

}

// find_best_route("ززم" , "تجریش" , "عادی" , "10:00").then(data => console.log(data));

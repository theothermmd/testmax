import DataLoader from "./dataloader.js";
import WordUtils from './WordUtils.js'
import LineManager from './LineManager.js'
import pathfinder from './pathfinder.js'
import ScheduleManager from './ScheduleManager.js'
import TravelInfo from './TravelInfo.js'

export function find_best_route (sourcex , destinationx , type_day , time) {
    const dataLoader = new DataLoader();
    const travelInfo = new TravelInfo();
    const wordutils = new WordUtils(dataLoader.stations_names);
    const lineManager = new LineManager(dataLoader.line_lookup , dataLoader.lines , dataLoader.terminals);
    const routing = new pathfinder(dataLoader); 
    const scheduleManager = new ScheduleManager();

    

    const source = wordutils.findClosestWord(sourcex);
    const destination = wordutils.findClosestWord(destinationx);
    if (source === destination) {
        return {"status": false , 'isrouting' : false , 'code' : 0 , 'message' : "The origin and destination station cannot be one."}
    }
    if (!['عادی', 'پنجشنبه', 'جمعه'].includes(type_day)) {
        return {"status": false , 'isrouting' : false , 'code' : 1 , 'message'  : "The appointed day is invalid. Should be between ordinary and Thursday and Friday"}
    }
    if (source === null || source === undefined || destination === null || destination === undefined) {
        return {"status": false , 'isrouting' : false , 'code' : 2 , 'message' : "The origin or destination station could not be found."}
    }
    let now = "";
    let start_time = "";
    if (time === '' || time === undefined) {
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
        return {"status": true , 'isrouting' : false , 'code' : 3 , 'message' : "no_service"};
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

            if (lineManager.get_line_for_station(route[i], route[i + 1]) !== corrent_line) {
                corrent_line = lineManager.get_line_for_station(route[i], route[i - 1]);
                times = dataLoader.lines[corrent_line].get_station_by_name(route[i]).get_time(type_day , wordutils.correctPersianText(terminal_direction));
                now = scheduleManager.get_next_time(times , now);
                if (now == false) { return {"status": false , 'isrouting' : false , 'code' : 4 ,  'message' : "You don't get to the destination."} }
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
                if (now == false) { return {"status": false , 'isrouting' : false , 'code' : 4 ,  'message' : "You don't get to the destination."} }
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
                if (i === 0) {
                    travelInfo.add_travel_guide_entry(
                        travel_guide,
                        "source",
                        route[i],
                        lineManager.get_line_for_station(route[i], route[i + 1]).replace("line_", ""),
                        terminal_direction
                    );

                }
                corrent_line = lineManager.get_line_for_station(route[i], route[i + 1]);

                

                times = dataLoader.lines[corrent_line].get_station_by_name(route[i]).get_time(type_day , wordutils.correctPersianText(terminal_direction));
                now = scheduleManager.get_next_time(times , now);
                if (now == false) { return {"status": false , 'isrouting' : false , 'code' : 4 ,  'message' : "You don't get to the destination."} }
                    


                if (i === 0) {

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
            times = dataLoader.lines[corrent_line].get_station_by_name(route[i]).get_time(type_day , wordutils.correctPersianText(terminal_direction));
            now = scheduleManager.get_next_time(times , now);
            if (now == false) { return {"status": false , 'isrouting' : false , 'code' : 4 ,  'message' : "You don't get to the destination."} }

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
        "travel_duration": `${travel_hours}:${travel_minutes.toString().length === 1 ? "0" + travel_minutes : travel_minutes}`,
        "travel_cost": travelInfo.check_cost(travel_cost),
        "travel_guide": travel_guide,
        "next_train": next_train,
        "arrival_times": now,
    };

}

console.log(find_best_route("زمزم" , "سلیمانی" , "عادی" , "10:30" ));

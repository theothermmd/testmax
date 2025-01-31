import Datamanager from './libs/Datamanager.js'
import WordUtils from './libs/WordUtils.js'
import LineManager from './libs/LineManager.js'
import Routing from './libs/Routing.js'
import ScheduleManager from './libs/ScheduleManager.js'
import TravelInfo from './libs/TravelInfo.js'



export async function find_best_route (source , destination , type_day , time) {
    const datamanager = new Datamanager();
    await datamanager.init();
    const travelInfo = new TravelInfo();
    const wordutils = new WordUtils(datamanager.stations_names);
    const lineManager = new LineManager(datamanager.line_lookup , datamanager.stations , datamanager.terminals);
    const routing = new Routing(datamanager); 
    const scheduleManager = new ScheduleManager();
    if (source === destination) {
        return {"status": true , 'isrouting' : false}
    }
    if (!['عادی', 'پنجشنبه', 'جمعه'].includes(type_day)) {
        return {"status": true , 'isrouting' : false};
    }
    

    source = wordutils.findClosestWord(source);
    destination = wordutils.findClosestWord(destination);

    if (source === null || source === undefined || destination === null || destination === undefined) {
        return {"status": true , 'isrouting' : false};
    }
    

    let now = new Date();
    const startTime = scheduleManager.parseTime("5:00");
    const endTime = scheduleManager.parseTime("23:00");
    
    if (now.getTime() < startTime.getTime() || now.getTime() > endTime.getTime()) {
        return {"status": true , 'isrouting' : false};
    }
    
    const route = routing.shortestPath(source, destination);
    let corrent_line = lineManager.get_line_for_station(route[0], route[1]);
    let terminal_direction= lineManager.find_terminal_direction(corrent_line, route[0], route[1]);
    let overview = [];
    let travel_guide = [];
    let travel_cost = 0;
    let times = {};
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
                try {
                    times = datamanager.stations_times[corrent_line][corrent_line][type_day][terminal_direction][route[i]]
                } catch {
                    console.log(corrent_line);
                    console.log(type_day);
                    console.log(terminal_direction);
                    console.log(route[i]);
                }
                
                now = scheduleManager.get_next_time(times , now);
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
    return {
        "status": true,
        'isrouting' : true,
        "fail" : false,
        "route": overview,
        "travel_cost": travelInfo.check_cost(travel_cost),
        "travel_guide": travel_guide,
        "arrival times": now,
    };

}


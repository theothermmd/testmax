import DataLoader from "./dataloader.js";
import WordUtils from './WordUtils.js';
import LineManager from './LineManager.js';
import pathfinder from './pathfinder.js';
import ScheduleManager from './ScheduleManager.js';
import TravelInfo from './TravelInfo.js';

const VALID_DAYS = ['عادی', 'پنجشنبه', 'جمعه'];
const TICKET_COST = 2;

export function findBestRoute(sourceInput, destinationInput, dayType, inputTime) {
    const dataLoader = new DataLoader();
    const wordUtils = new WordUtils(dataLoader.stations_names);

    const source = wordUtils.findClosestWord(sourceInput);
    const destination = wordUtils.findClosestWord(destinationInput);

    const validationError = validateInputs(source, destination, dayType);
    if (validationError) return validationError;

    const travelInfo = new TravelInfo();
    const lineManager = new LineManager(dataLoader.line_lookup, dataLoader.lines, dataLoader.terminals);
    const router = new pathfinder(dataLoader);
    const scheduleManager = new ScheduleManager();

    let currentTime = getStartTime(inputTime, scheduleManager);
    const startTime = scheduleManager.parseTime("5:00");
    const endTime = scheduleManager.parseTime("23:00");

    if (currentTime < startTime || currentTime > endTime) {
        return exitWithMessage(true, false, 3, "no_service");
    }

    const route = router.shortestPath(source, destination);
    if (!route || route.length === 0) return exitWithMessage(false, false, 6, "No valid route found.");

    let currentLine = lineManager.get_line_for_station(route[0], route[1]);
    let terminalDirection = lineManager.find_terminal_direction(currentLine, route[0], route[1]);
    let overview = [], travelGuide = [], travelCost = 0, nextTrain = null;

    for (let i = 0; i < route.length; i++) {
        const currentStation = route[i];
        const nextStation = route[i + 1];

        if (nextStation) {
            const newLine = lineManager.get_line_for_station(currentStation, nextStation);

            if (newLine !== currentLine) {
                // Line change
                const exitTime = getNextDeparture(dataLoader, currentLine, currentStation, dayType, terminalDirection, currentTime, wordUtils, scheduleManager);
                if (!exitTime) return exitWithMessage(false, false, 4, "You don't get to the destination.");

                travelInfo.add_overview_entry(overview, currentStation, exitTime, currentLine, true,
                    `در ایستگاه ${currentStation} از قطار پیاده شده و با توجه به تابلوهای راهنما به سمت ${terminalDirection} وارد خط ${newLine.replace('line_', '')} شوید.`);
                travelInfo.add_travel_guide_entry(travelGuide, "change", currentStation, newLine.replace("line_", ""), terminalDirection);

                currentLine = newLine;
                terminalDirection = lineManager.find_terminal_direction(currentLine, currentStation, nextStation);

                const entryTime = getNextDeparture(dataLoader, currentLine, currentStation, dayType, terminalDirection, exitTime, wordUtils, scheduleManager);
                if (!entryTime) return exitWithMessage(false, false, 4, "You don't get to the destination.");

                travelInfo.add_overview_entry(overview, currentStation, entryTime, currentLine, false, "");
                currentTime = entryTime;
                travelCost += TICKET_COST;
            } else {
                // Continue on same line
                if (i === 0) {
                    travelInfo.add_travel_guide_entry(travelGuide, "source", currentStation, currentLine.replace("line_", ""), terminalDirection);
                }

                const timeOnLine = getNextDeparture(dataLoader, currentLine, currentStation, dayType, terminalDirection, currentTime, wordUtils, scheduleManager);
                if (!timeOnLine) return exitWithMessage(false, false, 5, "You don't get to the destination.");

                if (i === 0) {
                    const waitMinutes = Math.floor((timeOnLine - getStartTime(inputTime, scheduleManager)) / (1000 * 60));
                    nextTrain = waitMinutes;
                }

                travelInfo.add_overview_entry(overview, currentStation, timeOnLine, currentLine, false, "");
                currentTime = timeOnLine;
            }
        } else {
            // Final station
            const terminal = lineManager.find_terminal_direction(currentLine, route[i - 1], currentStation);
            const arrivalTime = getNextDeparture(dataLoader, currentLine, currentStation, dayType, terminal, currentTime, wordUtils, scheduleManager);
            if (!arrivalTime) return exitWithMessage(false, false, 5, "You don't get to the destination.");

            travelInfo.add_overview_entry(overview, currentStation, arrivalTime, currentLine, false, "");
            travelInfo.add_travel_guide_entry(travelGuide, "destination", currentStation, currentLine.replace("line_", ""), terminal);
            currentTime = arrivalTime;
            travelCost += TICKET_COST;
        }
    }

    const totalDurationMs = currentTime - getStartTime(inputTime, scheduleManager);
    const durationStr = formatDuration(totalDurationMs);

    return {
        status: true,
        isrouting: true,
        fail: false,
        route: overview,
        travel_duration: durationStr,
        travel_cost: travelInfo.check_cost(travelCost),
        travel_guide: travelGuide,
        next_train: nextTrain,
        arrival_times: currentTime,
    };
}


function validateInputs(source, destination, dayType) {
    if (source === destination) return exitWithMessage(false, false, 0, "The origin and destination station cannot be one.");
    if (!VALID_DAYS.includes(dayType)) return exitWithMessage(false, false, 1, "Invalid day. Should be ordinary, Thursday, or Friday.");
    if (!source || !destination) {
        if (!source && !destination) return exitWithMessage(false, false, 2, "The origin or destination station could not be found.");
        if (!source) return exitWithMessage(false, false, 3, "The origin station could not be found.");
        if (!destination) return exitWithMessage(false, false, 4, "The destination station could not be found.");
    }
    return null;
}

function getStartTime(inputTime, scheduleManager) {
    if (!inputTime) {
        const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tehran' }));
        return now;
    }
    return scheduleManager.parseTime(inputTime);
}

function getNextDeparture(dataLoader, line, station, dayType, direction, currentTime, wordUtils, scheduleManager) {
    const stationObj = dataLoader.lines[line].get_station_by_name(station);
    const directionFixed = wordUtils.correctPersianText(direction);
    const times = stationObj.get_time(dayType, directionFixed);
    return scheduleManager.get_next_time(times, currentTime);
}

function formatDuration(durationMs) {
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

function exitWithMessage(status, isRouting, code, message) {
    return { status, isrouting: isRouting, code, message };
}


// console.log(find_best_route("سرسبز" , "قلک" , "عادی" , "10:30" ));

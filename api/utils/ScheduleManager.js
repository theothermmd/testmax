
class ScheduleManager {

    parseTime(timeStr) {
        if (timeStr instanceof Date) {
            return timeStr;
        }
        let [hours, minutes] = timeStr.split(":").map(Number);
        let date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }
    
    get_next_time (station_times, current_time) {
        if (typeof current_time === Date) {
            current_time = `${current_time.getHours()}:${current_time.getMinutes()}`
        }
        for (let i of station_times) {
            if (i == null) {
                return false;

            }

            let next_time = this.parseTime(i);

            if (next_time > this.parseTime(current_time)) {
                return `${next_time.getHours()}:${next_time.getMinutes().toString().length === 1 ? "0" + next_time.getMinutes() : next_time.getMinutes()}`;
            }

        }
        return false
        
    }
}


export default ScheduleManager;
import fetch from 'node-fetch';  

const BASE_URL = 'https://testmax.vercel.app';  

class DataManager {
    constructor() {
        this.stations = {};
        this.stations_times = {};
        this.line_names = ["line_1", "line_2", "line_3", "line_4", "line_5", "line_6", "line_7", "line_parand"];
        this.stations_names = [];
        this.terminals = {};
        this.line_lookup = new Map();
        this.init();
    }

    async init() {
        this.stations = await this.loadStations('/stations.json');  // بارگذاری ایستگاه‌ها از URL
        for (let i of this.line_names) {
            this.stations_times[i] = await this.loadStations(`/${i}.json`);  // بارگذاری زمان‌های ایستگاه‌ها از URL
        }
        this.loadnames();
        this.loadline_loop();
    }

    async loadnames() {
        for (let line in this.stations['stations']) {
            this.terminals[line] = { [line]: [this.stations['stations'][line][0], this.stations['stations'][line].at(-1)] };
            for (let station of this.stations['stations'][line]) {
                this.stations_names.push(station);
            }
        }
    }

    async loadline_loop() {
        for (const [line, stations] of Object.entries(this.stations['stations'])) {
            for (let i = 0; i < stations.length - 1; i++) {
                const key1 = JSON.stringify([stations[i], stations[i + 1]]);
                const key2 = JSON.stringify([stations[i + 1], stations[i]]);
                this.line_lookup.set(key1, line);
                this.line_lookup.set(key2, line);
            }
        }
    }

    // تابعی برای بارگذاری فایل‌ها از URL
    async loadStations(filePath) {
        try {
            const url = `${BASE_URL}${filePath}`;  // ترکیب URL پایه و مسیر فایل
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch file from URL: ${url}`);
            }

            const data = await response.json();  // تبدیل داده‌ها به JSON
            return data;
        } catch (error) {
            console.error('Error loading file from URL:', filePath, error);
            return null;
        }
    }
}

export default DataManager;

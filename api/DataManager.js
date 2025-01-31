import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { readdirSync, statSync } from 'fs';

function displayTree(dirPath, level = 0) {
    const items = readdirSync(dirPath);

    items.forEach(item => {
        const fullPath = join(dirPath, item);
        const stats = statSync(fullPath);

        // چاپ فاصله‌ها برای نشان دادن سطح درخت
        const indentation = ' '.repeat(level * 2);

        if (stats.isDirectory()) {
            console.log(`${indentation}📁 ${item}`);
            // فراخوانی تابع به صورت بازگشتی برای دایرکتوری‌ها
            displayTree(fullPath, level + 1);
        } else {
            console.log(`${indentation}📄 ${item}`);
        }
    });
}

// برای نمایش ساختار درختی در پوشه پروژه خود، این کد را اجرا کنید
displayTree(process.cwd());

const __dirname = dirname(new URL(import.meta.url).pathname);
class DataManager {
    constructor() {
        console.log("Current directory:", __dirname);
        this.base_path = join(__dirname);
        this.stations = {};
        this.stations_times = {};
        this.line_names = ["line_1", "line_2", "line_3", "line_4", "line_5", "line_6", "line_7", "line_parand"];
        this.stations_names = []
        this.terminals = {}
        this.line_lookup = new Map();
        this.init();

    }

    async init() {

        this.stations = await this.loadStations(join(this.base_path, 'stations.json'));

        for (let i of this.line_names) {
            this.stations_times[i] = await this.loadStations(join(this.base_path, `${i}.json`));
        }

        this.loadnames();
        this.loadline_loop();
        

    }
    async loadnames () {
        for (let line in this.stations['stations']) {
            this.terminals[line] = {[line] : [this.stations['stations'][line][0] , this.stations['stations'][line].at(-1)]}
            for (let station of this.stations['stations'][line]) {
                this.stations_names.push(station)
            }
        }

    }
    async loadline_loop () {

        for (const [line , stations] of Object.entries(this.stations['stations'])) {
            for (let i = 0; i < stations.length - 1 ; i++) {
                const key1 = JSON.stringify([stations[i] , stations[i + 1]])
                const key2 = JSON.stringify([stations[i + 1] , stations[i]])
                this.line_lookup.set(key1 , line);
                this.line_lookup.set(key2 , line);
            }
        }

    }


    async loadStations(filePath) {
        try {
            const data = await readFile(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading file:', filePath, error);
            return null;
        }
    }
} 





export default DataManager;
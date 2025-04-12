class Station {
    constructor (
        name,
        translations,
        address,
        lines,
        location,
        colors,
        active,
        wc,
        coffee_shop,
        grocery_store,
        fastfood,
        perfumeshop,
        atm,
        parking,
        relations,
        Train_arrival_time,
        Time_interval_to_the_previous_station,
        Time_interval_to_the_next_station
    )
    {
        this.name = name;
        this.translations = translations;
        this.address = address;
        this.lines = lines;
        this.location = location;
        this.colors = colors;
        this.active = active;
        this.wc = wc;
        this.coffee_shop = coffee_shop;
        this.grocery_store = grocery_store;
        this.fastfood = fastfood;
        this.perfumeshop = perfumeshop;
        this.atm = atm;
        this.parking = parking;
        this.relations = relations;
        this.Train_arrival_time = Train_arrival_time;
        this.Time_interval_to_the_previous_station = Time_interval_to_the_previous_station;
        this.Time_interval_to_the_next_station = Time_interval_to_the_next_station;
    }
    get_persian_name () {
        return this.translations.translations['fa']
    }

    get_english_name () {
        return this.translations.translations['en']
    }

    get_time(type_day , terminal) {
        
        return this.translations.Train_arrival_time[type_day][terminal]

    }

}
export  default  Station;
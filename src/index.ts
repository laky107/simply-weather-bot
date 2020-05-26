import moment = require("moment");
import OpenWeather from "./WeatherServices/OpenWeather"
import {WeatherService} from "./WeatherServices/WeatherService";
import * as dotenv from "dotenv";
import * as builder from "botbuilder"
import {Moment} from "moment";
import * as _ from "lodash"

dotenv.config();
let weatherService: WeatherService = new OpenWeather();

//create array [1,2,3] map => now() + day(index)
let timeDates: {name: string, date: Moment}[] =  Array.from(Array(3).keys()).map(key=> {
        let date = moment().add(key, "days");
        return {
            date,
            name: (date.calendar().toString().split(" at"))[0]
        }
    }
);


let inMemoryStorage = new builder.MemoryBotStorage();
let connector = new builder.ConsoleConnector().listen();

let bot = new builder.UniversalBot(connector, [
    (session) => {
        builder.Prompts.text(session, "Hello... This is weather bot!\n" +
            "Type city where you want to check weather...")
    },
    (session, results) => {
        session.userData.city = results.response;
        builder.Prompts.choice(session, 'Which day do you want to see?', timeDates.map(one=>one.name))
    },
    (session, results) => {
        let res = results.response.entity;
        let dayIndex = _.findIndex(timeDates,["name",res]);

        session.userData.date = timeDates[dayIndex].date;

        const { date, city } = session.userData;

        let data = weatherService.getWeatherInfo({time: date,city:city});
        data.then(res => {

            session.send(`Weather in city: ${city}.`);
            session.send(`Temperature: ${res.temperature.toFixed(2)} Celsius`);
            session.send(`Info: ${res.weatherDetail.main}\n${res.weatherDetail.description}`)
            session.send("Thank you for using weather bot.")
        }
        ).catch(err =>{
            session.send(`I am sorry. City ${city} not found.`)
        });
    },
]).set('storage', inMemoryStorage);
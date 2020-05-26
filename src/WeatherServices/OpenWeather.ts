import {
    KelvinToCelsius,
    WeatherCallData, WeatherDetailInfo,
    WeatherInfo,
    WeatherService
} from "./WeatherService";
import axios from "axios"
import {URL} from "url";
import moment = require("moment");
import ThenPromise = require("promise");
import * as _ from "lodash"
import {Moment} from "moment";

interface Coordinates {
    lat: number,
    lon: number,
}
interface CityWeather {
    coordinates: Coordinates,
    weather: WeatherInfo
}

interface OpenWeatherOneCallResponseDataDay {
    dt: Date,
    temp: {
        day: number
    },
    weather: WeatherDetailInfo[]
}
interface OpenWeatherOneCallResponseData {
    daily: OpenWeatherOneCallResponseDataDay[]
}

interface OpenWeatherWeatherResponseData{
    coord: Coordinates,
    weather: WeatherDetailInfo[],
    main: {
        temp: number
    }
}

//small feature to casting response form axios
interface ResponseData<T> {
    data: T
}


export default class OpenWeather implements WeatherService
{
    readonly API_URL = "https://api.openweathermap.org/data/2.5/";

    private getApiKey(): string {
        return process.env.OPEN_WEATHER_API_KEY || "";
    }

    async getWeatherInfo(data: WeatherCallData):  Promise<WeatherInfo> {

        let cityData = this.getActualCityWeather(data.city);
        return new Promise<WeatherInfo>((resolve, reject) => {
            cityData.then(city =>{
                if (data.time.diff(moment(),'days') == 0 ){
                    resolve(city.weather)
                }else {
                    resolve(this.loadCityWeatherForDays(city.coordinates,data.time));
                }
            }).catch(err => {
                //console.log(err);
                reject(null)
            });
        })
    }

    private async loadCityWeatherForDays(coordinates: Coordinates,selectedDate: Moment): Promise<WeatherInfo> {
        let url: URL = this.getCallUrl(["onecall"]);
        url.searchParams.append("lat",coordinates.lat.toString());
        url.searchParams.append("lon",coordinates.lon.toString());

        return await axios.get(url.toString())
            .then(response => response as ResponseData<OpenWeatherOneCallResponseData>)
            .then( response => {
                const { data } = response;
                let index: number  = _.findIndex<OpenWeatherOneCallResponseDataDay>(data.daily, value =>{
                        let dayDate = moment(value.dt,'X');
                        return dayDate.diff(selectedDate,"days") == 0;
                });
                let dayData = data.daily[index];
                if (dayData) {
                    return {
                        temperature: KelvinToCelsius(dayData.temp.day),
                        weatherDetail: dayData.weather[0]
                    }
                }
                return null

        }).catch(err => {
                //console.log(err);
                return null
        }
        );
    }

    private async getActualCityWeather(cityName: string): Promise<CityWeather>{
        let url: URL = this.getCallUrl(["weather"]);
        url.searchParams.append("q",cityName);

        return new Promise<CityWeather>((resolve, reject) => {
            axios.request({url: url.toString()})
                .then(response => response as ResponseData<OpenWeatherWeatherResponseData>)
                .then( (response) => {
                    const { data } = response;
                    let cityData: CityWeather = {
                        coordinates : {
                            lon : data.coord.lon,
                            lat: data.coord.lat
                        },
                        weather: {
                            temperature: KelvinToCelsius(data.main.temp),
                            weatherDetail: data.weather[0]
                        }
                    };
                    resolve(cityData);
                }).catch(err => {
                    //console.log(err)
                    reject(null)
                }
            );
        })

    }

    private getCallUrl(paths: string[]): URL{
        let append = _.join(paths,"/");
        let url = new URL(this.API_URL + append);

        url.searchParams.append("appid",this.getApiKey());
        return url;
    }

}
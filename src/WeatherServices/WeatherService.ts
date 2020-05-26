import {Moment} from "moment";

export interface WeatherData{
    temperature: number,
    weatherDetail: WeatherDetailInfo
}

export interface WeatherDetailInfo {
    main: string,
    description: string
}

export type WeatherInfo = WeatherData | null

export interface WeatherCallData {
    time: Moment
    city: string
}

export interface WeatherService {
    getWeatherInfo(data: WeatherCallData):  Promise<WeatherInfo>
}

export function KelvinToCelsius(K:number): number {
    return K - 273.15
}
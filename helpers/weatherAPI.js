const axios = require("axios");

const weatherText = require("./weatherText");
const callDB = require("./dbAPI");

const callWeather = async (chatId, cityName) => {
    const { data } = await callDB("get", {}, chatId);

    const { cities, units, lang } = data;

    const [{ lat, lon }] = cities.map((city) => {
        if (cityName === city.name) return city;
    });

    let resp;

    try {
        resp = await axios({
            method: "get",
            url: `https://api.openweathermap.org/data/2.5/weather?`,
            params: {
                appid: process.env.OPENWEATHER_KEY,
                units,
                lang,
                proximity: "ip",
                lat,
                lon,
            },
        });
    } catch (e) {
        console.log(e);
    }

    if (resp) {
        const text = weatherText(resp);
        return text;
    }

    return "Ciudad no encontrada";
};

module.exports = callWeather;

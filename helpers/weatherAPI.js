const axios = require("axios");

const weatherText = require("./weatherText");
const callDB = require("./dbAPI");

const callWeather = async (chatId, city) => {
    const { data } = await callDB("get", {}, chatId);

    let resp;

    try {
        resp = await axios({
            method: "get",
            url: `https://api.openweathermap.org/data/2.5/weather?`,
            params: {
                q: city,
                appid: process.env.OPENWEATHER_KEY,
                units: data.units,
                lang: data.lang,
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

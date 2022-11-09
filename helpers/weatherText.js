const capitalize = require("capitalize");

const weatherText = ({ data }) => {
    const { weather, main, name, clouds } = data;
    const { description } = weather[0];
    const { temp, feels_like, temp_min, temp_max, humidity } = main;
    const { all } = clouds;

    const text = `${name}  |  ${capitalize.words(description)}
        \n\n🌡️  Temperatura:  ${temp}°C
        \n🌡️  Sensación térmica:  ${feels_like}°C
        \n💧  Humedad:  ${humidity}%
        \n☁️  Nubes:  ${all}%`;

    return text;
};

module.exports = weatherText;

const axios = require("axios");

const callMapBox = async (city, lang) => {
    let resp;

    try {
        resp = await axios({
            method: "get",
            url: `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(city)}.json?`,
            params: {
                types: "place",
                limit: 5,
                language: lang,
                access_token: process.env.MAPBOX_KEY,
            },
        });
    } catch (e) {
        console.log(e);
    }

    return resp.data.features;
};

module.exports = callMapBox;

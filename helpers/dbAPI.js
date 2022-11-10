const axios = require("axios");

const callDB = async (method, data = {}, endpoint = "") => {
    let resp;

    try {
        resp = await axios({
            method,
            url: `http://${(process.env.NODE_ENV = "development" ? "localhost" : "0.0.0.0")}:${process.env.PORT}/api/users/${endpoint}`,
            data,
        });
    } catch (e) {
        console.log(e);
    }

    return resp;
};

module.exports = callDB;

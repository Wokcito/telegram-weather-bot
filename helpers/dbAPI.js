const axios = require("axios");

const callDB = async (method, data = {}, endpoint = "") => {
    let resp;

    try {
        resp = await axios({
            method,
            url: `http://localhost:8080/api/users/${endpoint}`,
            data,
        });
    } catch (e) {
        console.log(e);
    }

    return resp;
};

module.exports = callDB;

const mongoose = require("mongoose");

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB);
        console.log("DB connection success");
    } catch (e) {
        console.log(e);
    }
};

module.exports = dbConnection;

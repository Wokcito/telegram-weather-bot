const express = require("express");
const cors = require("cors");

const dbConnection = require("./db/config");

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8080;

        this.usersPath = "/api/users";

        this.connectDB();

        this.middlewares();

        this.routes();
    }

    async connectDB() {
        await dbConnection();
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    routes() {
        this.app.use(this.usersPath, require("./routes/users.routes"));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log("Servidor corriendo en puerto", this.port);
        });
    }
}

module.exports = Server;

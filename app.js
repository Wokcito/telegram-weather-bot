require("dotenv").config();

const Server = require("./server");
const bot = require("./telegram");

const server = new Server();

server.listen();
bot.launch();

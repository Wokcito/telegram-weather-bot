const User = require("../models/user");

const existChatId = async (chatId = "") => {
    const existChatId = await User.findOne({ chatId });
    if (existChatId) throw new Error(`chatId: ${chatId} is not available`);
};

module.exports = {
    existChatId,
};

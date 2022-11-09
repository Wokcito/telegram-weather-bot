const User = require("../models/user");

const chatIdValidation = async (req, res, next) => {
    const { id } = req.params;
    const existChatId = await User.findOne({ chatId: id });

    if (!existChatId) {
        return res.status(404).json({
            message: `chatId: ${id} doesn't exist`,
        });
    }

    next();
};

module.exports = {
    chatIdValidation,
};

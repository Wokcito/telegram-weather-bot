const { request, response } = require("express");

const User = require("../models/user");

const getUser = async (req = request, res = response) => {
    const { id } = req.params;

    const user = await User.findOne({ chatId: id });

    res.json(user);
};

const getUsers = async (req = request, res = response) => {
    const { limit = 5, start = 0 } = req.query;

    const [totalUsers, users] = await Promise.all([User.countDocuments(), User.find().skip(start).limit(limit)]);

    res.json({
        totalUsers,
        users,
    });
};

const postUser = async (req = request, res = response) => {
    const { chatId, cities, name } = req.body;
    const user = new User({ chatId, cities, name });
    await user.save();

    res.json({
        message: "success",
    });
};

const putUser = async (req = request, res = response) => {
    const { id } = req.params;
    const { chatId, ...rest } = req.body;

    await User.findOneAndUpdate({ chatId: id }, rest);

    res.json({
        message: "success",
    });
};

const deleteUser = async (req = request, res = response) => {
    const { id } = req.params;

    await User.findOneAndDelete({ chatId: id });

    res.json({
        message: "success",
    });
};

module.exports = {
    getUser,
    getUsers,
    postUser,
    putUser,
    deleteUser,
};

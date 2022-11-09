const { Schema, model } = require("mongoose");

const UserSchema = Schema({
    chatId: {
        type: String,
        unique: true,
        required: [true, "chatId required"],
    },
    name: {
        type: String,
        required: [true, "name required"],
    },
    cities: {
        type: Array,
        required: [true, "city required"],
    },
    units: {
        type: String,
        default: "metric",
    },
    lang: {
        type: String,
        default: "es",
    },
});

UserSchema.methods.toJSON = function () {
    const { __v, _id, ...user } = this.toObject();
    user.uid = _id;

    return user;
};

module.exports = model("User", UserSchema);

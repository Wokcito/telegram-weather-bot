const { fieldValidate } = require("../middlewares/fields-validation");
const { chatIdValidation } = require("./chatid-validation");

module.exports = {
    fieldValidate,
    chatIdValidation,
};

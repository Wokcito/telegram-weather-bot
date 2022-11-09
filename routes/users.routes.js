const { Router } = require("express");
const { check } = require("express-validator");

const { fieldValidate, chatIdValidation } = require("../middlewares");
const { existChatId } = require("../helpers/db-validators");
const { getUser, getUsers, postUser, putUser, deleteUser } = require("../controllers/users.controller");

const router = Router();

router.get("/:id", [chatIdValidation, fieldValidate], getUser);

router.get("/", getUsers);

router.post(
    "/",
    [
        check("chatId", "chatId required").not().isEmpty(),
        check("chatId").custom(existChatId),
        check("cities", "city required").isArray(),
        fieldValidate,
    ],
    postUser
);

router.put("/:id", [chatIdValidation, fieldValidate], putUser);

router.delete("/:id", [chatIdValidation, fieldValidate], deleteUser);

module.exports = router;

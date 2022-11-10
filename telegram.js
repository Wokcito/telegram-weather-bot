const { Telegraf } = require("telegraf");

const { callDB, callWeather, callMapBox } = require("./helpers");
const User = require("./models/user");

const bot = new Telegraf(process.env.TELEGRAM_BOTID);

bot.command("start", (ctx) => {
    ctx.reply(`🗺  ¡Con este bot podés saber el clima de tu ciudad!
    \n"/add + tu ciudad" para agregar una ciudad, debe escribir su ciudad lo más detalladamente posible (ciudad, estado o provincia, país).
    \n"/now" para saber el clima (si tenés más de una ciudad especificá cuál es)
    \n"/cities" para ver tu lista de ciudades
    \n"/delete" para eliminar una ciudad de tu lista (si tenés más de una ciudad especificá cuál deseás borrar)`);
});

bot.command("add", async (ctx) => {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ chatId });

    const city = ctx.update.message.text.substring(5, ctx.update.message.text.length);
    const name = ctx.chat.username;
    const lang = ctx.update.message.from.language_code;

    if (city.length <= 0) return ctx.reply("🚫  Debe ingresar una ciudad válida ( '/add + tu ciudad' )");

    if (!user) {
        await callDB("post", {
            chatId,
            name,
            lang,
        });
    }

    const resp = await callMapBox(city, lang);

    const cities = resp.map((city, id) => {
        return [{ text: `${city.place_name}`, callback_data: `add${id}` }];
    });

    bot.telegram.sendMessage(chatId, "🗺  Seleccione su ciudad", {
        reply_markup: {
            inline_keyboard: [...cities],
        },
    });
});

bot.action(["add0", "add1", "add2", "add3", "add4"], async (ctx) => {
    ctx.answerCbQuery();
    ctx.deleteMessage();

    const chatId = ctx.chat.id;
    const user = await User.findOne({ chatId });

    const resp = ctx.match[0].substring(3, ctx.match[0].length);
    const city = ctx.update.callback_query.message.reply_markup.inline_keyboard[resp][0].text;

    if (user.cities.includes(city)) return ctx.reply("🚫  Esa ciudad ya se encuentra en tu lista");

    await callDB("put", { cities: [...user.cities, city] }, chatId);

    ctx.reply("✅  Ciudad añadida correctamente");
});

const citiesMenu = async (ctx) => {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ chatId });

    const cities = user.cities.map((city, id) => {
        return [{ text: `${city}`, callback_data: `sel${id}` }];
    });

    bot.telegram.sendMessage(chatId, `🗺  Ciudades de ${user.name}`, {
        reply_markup: {
            inline_keyboard: [...cities],
        },
    });
};

bot.command("cities", async (ctx) => {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ chatId });

    if (!user || !user.cities[0]) {
        ctx.reply("🚫  Ninguna ciudad encontrada, utilice el comando /add para agregar una");
    } else {
        await citiesMenu(ctx);
    }
});

bot.action(["sel0", "sel1", "sel2", "sel3", "sel4"], (ctx) => {
    ctx.answerCbQuery();
    ctx.deleteMessage();

    const chatId = ctx.chat.id;

    const resp = ctx.match[0].substring(3, ctx.match[0].length);
    const city = ctx.update.callback_query.message.reply_markup.inline_keyboard[resp][0].text;

    ctx.telegram.sendMessage(chatId, `${city}`, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "❌  Borrar ciudad", callback_data: "delete" },
                    { text: "🌡️  Ver clima", callback_data: "weather" },
                ],
                [{ text: "🔙  Volver", callback_data: "back" }],
            ],
        },
    });
});

bot.action(["back", "delete", "weather"], async (ctx) => {
    ctx.answerCbQuery();
    ctx.deleteMessage();

    const chatId = ctx.chat.id;
    const user = await User.findOne({ chatId });
    const city = ctx.update.callback_query.message.text;

    switch (ctx.update.callback_query.data) {
        case "back":
            await citiesMenu(ctx);
            break;
        case "delete":
            const cities = user.cities.filter((userCity) => userCity !== city);
            await callDB("put", { cities }, chatId);

            ctx.reply("✅  Ciudad eliminada correctamente");
            break;
        case "weather":
            const text = await callWeather(chatId, city);

            ctx.telegram.sendMessage(chatId, `🗺  ${text}`, {
                reply_markup: {
                    inline_keyboard: [[{ text: "🔙  Volver", callback_data: "back" }]],
                },
            });
            break;
        default:
            break;
    }
});

module.exports = bot;

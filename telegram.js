const { Telegraf, Markup } = require("telegraf");

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
        return [Markup.button.callback(`${city.place_name}`, `add ${id}`, false)];
    });

    ctx.reply("🗺  Seleccione su ciudad", Markup.inlineKeyboard(cities));
});

const citiesMenu = async (ctx) => {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ chatId });

    const cities = user.cities.map((city, id) => {
        return [Markup.button.callback(`${city.name}`, `sel ${id}`, false)];
    });

    ctx.reply(`🗺  Ciudades de ${user.name}`, Markup.inlineKeyboard(cities));
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

const actions = () => {
    let actions = ["back", "delete", "weather"];

    const numbers = ["0", "1", "2", "3", "4"];

    numbers.forEach((number) => {
        actions.push(`sel ${number}`, `add ${number}`);
    });

    return actions;
};

bot.action(actions(), async (ctx) => {
    ctx.answerCbQuery();
    ctx.deleteMessage();

    const chatId = ctx.chat.id;
    const user = await User.findOne({ chatId });

    let data = ctx.update.callback_query.data;
    let cityId = "";

    const city = ctx.update.callback_query.message.text;

    if (data.includes("sel") || data.includes("add")) {
        let [action, id] = data.split(" ");
        data = action;
        cityId = id;
    }

    switch (data) {
        case "back":
            await citiesMenu(ctx);
            break;
        case "delete":
            const cities = user.cities.filter((userCity) => userCity.name !== city);
            await callDB("put", { cities }, chatId);

            ctx.reply("✅  Ciudad eliminada correctamente");
            break;
        case "weather":
            const text = await callWeather(chatId, city);

            const button = [[Markup.button.callback("🔙  Volver", "back")]];

            ctx.reply(`🗺  ${text}`, Markup.inlineKeyboard(button));
            break;
        case "add":
            const cityAdd = ctx.update.callback_query.message.reply_markup.inline_keyboard[cityId][0].text;

            const resp = await callMapBox(cityAdd, user.lang);
            const [lon, lat] = resp[0].geometry.coordinates;

            let exist;

            user.cities.forEach((userCity) => {
                if (userCity.name === cityAdd) return (exist = true);
            });

            if (exist) return ctx.reply("🚫  Esa ciudad ya se encuentra en tu lista");

            await callDB("put", { cities: [...user.cities, { name: cityAdd, lat, lon }] }, chatId);

            ctx.reply("✅  Ciudad añadida correctamente");
            break;
        case "sel":
            const citySel = ctx.update.callback_query.message.reply_markup.inline_keyboard[cityId][0].text;

            const buttons = [
                [Markup.button.callback("❌  Borrar ciudad", "delete"), Markup.button.callback("🌡️  Ver clima", "weather")],
                [Markup.button.callback("🔙  Volver", "back")],
            ];

            ctx.reply(`${citySel}`, Markup.inlineKeyboard(buttons));
            break;
        default:
            break;
    }
});

module.exports = bot;

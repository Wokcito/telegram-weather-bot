const { Telegraf } = require("telegraf");

const { callDB, callWeather } = require("./helpers");
const User = require("./models/user");

const bot = new Telegraf(process.env.TELEGRAM_BOTID);

bot.command("start", (ctx) => {
    ctx.reply(`🗺  ¡Con este bot podés saber el clima de tu ciudad!
    \n"/add + tu ciudad" para agregar una ciudad, debe escribir su ciudad lo más detalladamente posible (ciudad, estado o provincia, país).
    \n"/now" para saber el clima, `);
});

bot.command("add", async (ctx) => {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ chatId });

    const city = ctx.update.message.text.substring(5, ctx.update.message.text.length);
    if (city.length <= 0) return ctx.reply("🚫  Debe ingresar una ciudad válida ( '/add + tu ciudad' )");

    const name = ctx.chat.username;

    if (!user) {
        await callDB("post", {
            chatId,
            cities: [city.toLowerCase()],
            name,
        });
    } else {
        await callDB(
            "put",
            {
                cities: [...user.cities, city.toLowerCase()],
                name,
            },
            chatId
        );
    }

    ctx.reply("✅  Ciudad añadida correctamente");
});

bot.command("cities", async (ctx) => {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ chatId });

    if (!user || !user.cities[0]) {
        ctx.reply("🚫  Ninguna ciudad encontrada, utilice el comando /add para agregar una");
    } else {
        let cities = "";

        user.cities.forEach((city, i) => {
            cities += `\n${i + 1})  ${city}`;
        });

        ctx.reply(`🗺  Ciudades de ${user.name} \n${cities}`);
    }
});

bot.command("now", async (ctx) => {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ chatId });

    if (!user || !user.cities[0]) {
        return ctx.reply("🚫  Ninguna ciudad encontrada, utilice el comando /add para agregar una");
    } else {
        const city = ctx.update.message.text.substring(5, 6);

        if (!user.cities[1]) {
            const text = await callWeather(chatId, 1);
            ctx.reply(`🗺  ${text}`);
        } else {
            if (city.length <= 0 || !user.cities[city - 1]) {
                if (city.length <= 0 || !user.cities[city - 1]) {
                    let cities = "";

                    user.cities.forEach((city, i) => {
                        cities += `\n${i + 1})  ${city}`;
                    });

                    return ctx.reply(`🚫  Debe especificar una ciudad \n${cities}`);
                }
            }

            const text = await callWeather(chatId, city);
            ctx.reply(`🗺  ${text}`);
        }
    }
});

bot.command("delete", async (ctx) => {
    const chatId = ctx.chat.id;
    const user = await User.findOne({ chatId });

    if (!user || !user.cities[0]) {
        return ctx.reply("🚫  Ninguna ciudad encontrada, utilice el comando /add para agregar una");
    } else {
        const city = ctx.update.message.text.substring(8, ctx.update.message.text.length);

        if (!user.cities[1]) {
            await callDB("put", { cities: [], name: user.name }, chatId);
            ctx.reply("✅  Ciudad eliminada correctamente");
        } else {
            if (city.length <= 0 || !user.cities[city - 1]) {
                let cities = "";

                user.cities.forEach((city, i) => {
                    cities += `\n${i + 1})  ${city}`;
                });

                return ctx.reply(`🚫  Debe especificar una ciudad \n${cities}`);
            }

            const cities = user.cities.filter((cityArray) => cityArray !== user.cities[city - 1]);

            await callDB("put", { cities, name: user.name }, chatId);

            ctx.reply("✅  Ciudad eliminada correctamente");
        }
    }
});

module.exports = bot;

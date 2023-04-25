const { Client, GatewayIntentBits } = require("discord.js");
const observe = require("./dashboard/observe");

require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.on("messageCreate", async (message) => {
    if (message.author.bot === true) {
        return; // 如果是機器人發出的訊息，就不要回覆（避免回覆自己）
    }

    console.log(
        `在 ${message.guild.name} > ${message.channel.name} 收到來自 ${message.member.displayName} 的訊息：${message.content}`,
    );
});

client.once("ready", async (client) => {
    console.log(`${client.user.tag} 已上線！`);
});

client.login(process.env.TOKEN);

observe(client)
    .start()
    .then((url) => console.log(`你可以在 ${url} 觀察 Bot 的狀態`));

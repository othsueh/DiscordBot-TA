const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const dotenv = require('dotenv')
dotenv.config()
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});
client.commands = new Collection()
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command)
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationCommands(process.env.BOTID), { body: commands })
    .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
    .catch(console.error);


client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        command.execute(client, interaction)
    } catch (error) {
        console.error(error);
    }
})

client.once('ready', () => {
    console.log('Ready!');
});
client.login(process.env.TOKEN);
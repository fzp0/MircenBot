const { Client, GatewayIntentBits, Partials, Collection, Options } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const playdl = require('play-dl');

const cookies = fs.readFileSync('./youtube_cookies.txt', 'utf8');

playdl.setToken({
    youtube: {
        cookie: cookies
    }
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Message, Partials.Channel],
   makeCache: Options.cacheWithLimits({
    MessageManager: 1000, // store up to 1000 messages per channel
  })
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});


const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}


client.login(process.env.DISCORD_TOKEN);

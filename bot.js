// bot.js (ESM Version)

import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, Options } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { setupPlayer } from './player.js';
import ffmpeg from 'ffmpeg-static';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Setup __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



// Create the bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Message, Partials.Channel],
  makeCache: Options.cacheWithLimits({
    MessageManager: 1000
  })
});

// On ready
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`Bot ID: ${client.user.id}`);
  console.log(ffmpeg);
});

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const { default: event } = await import(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Setup discord-player
await setupPlayer(client);

// Login
await client.login(process.env.DISCORD_TOKEN);


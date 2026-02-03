require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { initializeDatabase } = require('./database/db');
const DailyQuoteScheduler = require('./myralune/daily-quote-scheduler');

// Initialize the database
initializeDatabase();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers
    ]
});

// Load commands and events
const { loadCommands, loadEvents } = require('./handlers');
loadCommands(client);
loadEvents(client);

// Initialize and start the daily quote scheduler
const dailyQuoteScheduler = new DailyQuoteScheduler(client);
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    dailyQuoteScheduler.start();
});

client.login(process.env.TOKEN);
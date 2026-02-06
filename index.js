require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { initializeDatabase } = require('./database/db');
const GroqDailyQuoteScheduler = require('./myralune/groq-daily-quote-scheduler');
const GroqQuoteScheduler = require('./myralune/groq-quote-scheduler');

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

// Initialize and start the daily quote scheduler using Groq
const groqDailyQuoteScheduler = new GroqDailyQuoteScheduler(client);

// Initialize and start the Groq quote scheduler for testing (every 30 seconds)
const groqQuoteScheduler = new GroqQuoteScheduler(client);

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    groqDailyQuoteScheduler.start();

    // Start the 30-second Groq quote scheduler for testing
    groqQuoteScheduler.start();
});

client.login(process.env.TOKEN);
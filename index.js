require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { initializeDatabase } = require('./database/db');
const GroqDailyQuoteScheduler = require('./myralune/groq-daily-quote-scheduler');
const StartupFunctions = require('./startupFunctions');

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

// Initialize startup functions
const startupFunctions = new StartupFunctions(client);

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    groqDailyQuoteScheduler.start();

    // Send automatic panels
    startupFunctions.sendAutoPanels();

    // Note: Periodic quote scheduler has been removed to prevent duplication
    // Only the daily scheduler runs at 7:00 AM and 7:00 PM WIB
});

client.login(process.env.TOKEN);
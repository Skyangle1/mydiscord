require('dotenv').config();
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Validate environment variables
if (!process.env.TOKEN) {
    console.error('Error: TOKEN is not defined in .env file');
    process.exit(1);
}

if (!process.env.CLIENT_ID) {
    console.error('Error: CLIENT_ID is not defined in .env file');
    process.exit(1);
}

// Create a new REST client
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

async function deployCommands() {
    try {
        console.log('Started refreshing application (/) commands.');

        // Get all command files from the commands directory
        const commands = [];
        const commandFolders = fs.readdirSync('./commands');
        
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const command = require(`./commands/${folder}/${file}`);
                commands.push(command.data.toJSON());
                console.log(`Loaded command: ${command.data.name}`);
            }
        }

        // Register commands globally (use CLIENT_ID from .env)
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${commands.length} application (/) commands.`);
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

// Execute the deployment
deployCommands();
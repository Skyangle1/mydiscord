// handlers/commandHandler.js
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

async function loadCommands(client) {
    client.commands = new Collection();
    const commands = [];
    
    // Read command categories
    const commandFolders = fs.readdirSync('./commands');
    
    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const command = require(`../commands/${folder}/${file}`);
            
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
            
            console.log(`Loaded command: ${command.data.name}`);
        }
    }
    
    // Register slash commands globally (or to a specific guild during development)
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    
    try {
        console.log('Started refreshing application (/) commands.');
        
        // Use guild ID for testing (faster updates), or global for production
        // Uncomment the next line to deploy to a specific guild for testing:
        // await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
        
        // Deploy globally (may take up to 1 hour to propagate)
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

module.exports = { loadCommands };
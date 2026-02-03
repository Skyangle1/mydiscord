// handlers/eventHandler.js
const fs = require('fs');

async function loadEvents(client) {
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const event = require(`../events/${file}`);
        const eventName = file.split('.')[0]; // Get event name from filename

        // Check if the event is an object (new format) or function (old format)
        if (typeof event === 'object' && event.name) {
            // New format: event is an object with name, once, and execute properties
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
            console.log(`Loaded event: ${event.name}`);
        } else {
            // Old format: event is a function
            if (event.once) {
                client.once(eventName, (...args) => event(client, ...args));
            } else {
                client.on(eventName, (...args) => event(client, ...args));
            }
            console.log(`Loaded event: ${eventName}`);
        }
    }
}

module.exports = { loadEvents };
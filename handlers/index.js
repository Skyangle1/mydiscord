// handlers/index.js
const { loadCommands } = require('./commandHandler');
const { loadEvents } = require('./eventHandler');

module.exports = {
    loadCommands,
    loadEvents
};
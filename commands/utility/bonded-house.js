const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bonded-house')
        .setDescription('Setup bonded house dashboard message (Owner & Admin only)'),
    async execute(interaction) {
        // Check if user is developer or owner (using CLIENT_OWNER_ID environment variable)
        const ownerIds = process.env.CLIENT_OWNER_ID ?
            Array.isArray(process.env.CLIENT_OWNER_ID) ?
                process.env.CLIENT_OWNER_ID :
                process.env.CLIENT_OWNER_ID.split(',').map(id => id.trim())
            : [];

        if (!ownerIds.includes(interaction.user.id)) {
            return await interaction.reply({
                content: 'Perintah ini hanya dapat digunakan oleh Developer dan Owner!',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true }); // Defer reply to extend response time

        try {
            // Get the target channel from environment variable
            const targetChannelId = process.env.BONDED_CHANNEL_ID;

            if (!targetChannelId) {
                await interaction.editReply({
                    content: 'Target channel for bonded house panel has not been configured. Please set BONDED_CHANNEL_ID in the .env file.',
                    ephemeral: true
                });
                return;
            }

            const targetChannel = interaction.client.channels.cache.get(targetChannelId);

            if (!targetChannel) {
                await interaction.editReply({
                    content: `Target channel (ID: ${targetChannelId}) could not be found. Please verify the channel ID is correct.`,
                    ephemeral: true
                });
                return;
            }

            // Create the embed with bonded house description
            const embed = new EmbedBuilder()
                .setTitle('<:pinkcrown:1464766248054161621> BONDED HOUSE')
                .setDescription('<:pinkcrown:1464766248054161621> BONDED HOUSE\n\nThis desk is dedicated for Crownfolk who wish to form or join virtual families and or households within the Kingdom.\n\nPlease use this service for the following purposes:\n> a. Establishing a new House\n> b. Requesting to join an existing House\n> c. Exploring registered Houses and Households\nEach House operates under Kingdom regulations and Crown Landlord authority.\nKindly ensure clarity of intent when building or joining a House.\n\n> 🕰️ Operating Hours: Always Available\n> 🚫 Misuse of house and household systems may result in removal.\n> 📜 Managed by the Royal Moderation Council.')
                .setColor('#FF69B4')
                .setFooter({ text: 'Keluarga adalah komunitas kecil dalam komunitas besar Mɣralune' })
                .setTimestamp();

            // Create the buttons
            const buildButton = new ButtonBuilder()
                .setLabel('Bangun Keluarga')
                .setStyle(ButtonStyle.Success)
                .setCustomId('btn_build_family')
                .setEmoji('🏗️');

            const row = new ActionRowBuilder()
                .addComponents(buildButton, listButton);

            // Send the bonded house panel to the target channel
            const newMessage = await targetChannel.send({ embeds: [embed], components: [row] });

            // Save the new message ID to database
            const { db } = require('../../database/db');
            const saveMessageId = () => {
                return new Promise((resolve, reject) => {
                    const query = `
                        INSERT OR REPLACE INTO auto_panels (panel_type, message_id, channel_id)
                        VALUES (?, ?, ?)
                    `;
                    db.run(query, ['bonded_house_panel', newMessage.id, targetChannelId], (err) => {
                        if (err) {
                            if (err.message.includes('no such table')) {
                                console.log('auto_panels table does not exist, message ID not saved');
                            } else {
                                console.error('Error saving message ID to database:', err);
                            }
                            // Resolve anyway to continue execution
                            resolve();
                        } else {
                            resolve();
                        }
                    });
                });
            };

            await saveMessageId();

            await interaction.editReply({
                content: `Bonded house panel has been set up successfully in ${targetChannel.toString()}.`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error in bonded house command:', error);
            await interaction.editReply({ content: 'There was an error setting up the bonded house panel.', ephemeral: true });
        }
    },
};
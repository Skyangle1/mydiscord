const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tarik')
        .setDescription('Menarik pengguna ke voice channel tujuan')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Pengguna yang akan ditarik')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Voice channel tujuan (default: voice channel Anda)')
                .addChannelTypes(ChannelType.GuildVoice)
        ),

    async execute(interaction) {
        // Check if user has the required role from environment variable
        const requiredRoleId = process.env.TARIK_ROLE_ID;
        if (!requiredRoleId) {
            return await interaction.reply({
                content: 'Role untuk menggunakan perintah ini belum disetel!',
                ephemeral: true
            });
        }

        const member = interaction.member;
        const hasRole = member.roles.cache.has(requiredRoleId);

        if (!hasRole) {
            return await interaction.reply({
                content: `Anda tidak memiliki role yang diperlukan untuk menggunakan perintah ini!`,
                ephemeral: true
            });
        }

        // Get the target user
        const targetUser = interaction.options.getUser('user');
        const targetMember = await interaction.guild.members.fetch(targetUser.id);

        // Get the destination channel (either specified or user's current voice channel)
        let destinationChannel = interaction.options.getChannel('channel');

        // If no channel is specified, check if the user is in a voice channel
        if (!destinationChannel) {
            if (!member.voice.channel) {
                return await interaction.reply({
                    content: 'Anda harus berada di voice channel atau tentukan voice channel tujuan!',
                    ephemeral: true
                });
            }
            destinationChannel = member.voice.channel;
        }

        // Check if the target user is in a voice channel
        if (!targetMember.voice.channel) {
            return await interaction.reply({
                content: `Pengguna ${targetUser.username} tidak berada di voice channel manapun!`,
                ephemeral: true
            });
        }

        // Check if bot has permission to move members
        const botMember = interaction.guild.members.me;
        if (!botMember.permissions.has('MoveMembers')) {
            return await interaction.reply({
                content: 'Bot tidak memiliki izin untuk memindahkan anggota!',
                ephemeral: true
            });
        }

        try {
            // Move the target user to the destination voice channel
            await targetMember.voice.setChannel(destinationChannel);

            await interaction.reply({
                content: `✅ Berhasil menarik ${targetUser.username} ke voice channel ${destinationChannel}!`,
                ephemeral: true
            });
        } catch (error) {
            console.error('Error moving member:', error);
            await interaction.reply({
                content: `Gagal menarik pengguna: ${error.message}`,
                ephemeral: true
            });
        }
    },
};
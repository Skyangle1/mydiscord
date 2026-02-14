const { db } = require('../../database/db');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'modal_build_family',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Get values from modal
            const familyName = interaction.fields.getTextInputValue('family_name');
            const familySlogan = interaction.fields.getTextInputValue('family_slogan') || 'Tidak ada slogan';

            // Check if user already has a family as head
            const checkExistingFamily = () => {
                return new Promise((resolve, reject) => {
                    db.get('SELECT * FROM families WHERE owner_id = ?', [interaction.user.id], (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
            };

            const existingFamilyAsHead = await checkExistingFamily();
            if (existingFamilyAsHead) {
                return await interaction.editReply({ content: 'Kamu sudah menjadi kepala keluarga. Satu user satu keluarga.' });
            }

            // 1. Create Discord Roles
            let headRole, memberRole;
            try {
                // Create Head Role
                headRole = await interaction.guild.roles.create({
                    name: `👑 ${familyName}`,
                    reason: `Family Head role for ${familyName}`
                });

                // Create Member Role
                memberRole = await interaction.guild.roles.create({
                    name: `⚜️ ${familyName}`,
                    reason: `Family Member role for ${familyName}`
                });
            } catch (roleError) {
                console.error('Failed to create role:', roleError);
                return await interaction.editReply({ content: 'Gagal membuat Role Keluarga. Pastikan bot memiliki izin "Manage Roles".' });
            }

            // 2. Assign Roles to Creator (Head gets both)
            try {
                const member = await interaction.guild.members.fetch(interaction.user.id);
                // Assign ONLY Head Role to Creator
                await member.roles.add(headRole);
            } catch (assignError) {
                console.error('Failed to assign role:', assignError);
            }

            // 3. Insert into DB
            await new Promise((resolve, reject) => {
                db.run('INSERT INTO families (owner_id, family_name, slogan, role_id, member_role_id) VALUES (?, ?, ?, ?, ?)',
                    [interaction.user.id, familyName, familySlogan, headRole.id, memberRole.id],
                    function (err) {
                        if (err) reject(err);
                        else resolve(this);
                    }
                );
            });

            await new Promise((resolve, reject) => {
                db.run('INSERT INTO family_members (user_id, family_id) VALUES (?, ?)',
                    [interaction.user.id, interaction.user.id],
                    function (err) {
                        if (err) reject(err);
                        else resolve(this);
                    }
                );
            });

            // 4. Send Family Card to Channel
            const embed = new EmbedBuilder()
                .setTitle(`🏰 Keluarga: ${familyName}`)
                .setDescription(`**Slogan:**\n"${familySlogan}"\n\n**Kepala Keluarga:**\n<@${interaction.user.id}>`)
                .setColor('#FFD700') // Gold
                .setFooter({ text: `Family ID: ${familyName}` })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`join_family_request_${interaction.user.id}`) // Custom ID with Owner ID
                    .setLabel('Masuk Keluarga')
                    .setStyle(ButtonStyle.Success) // Green for Join
                    .setEmoji('🚪'),
                new ButtonBuilder()
                    .setCustomId('btn_build_family')
                    .setLabel('Buat Keluarga')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏗️'),
                new ButtonBuilder()
                    .setCustomId('btn_list_families')
                    .setLabel('Daftar Keluarga')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📋')
            );

            await interaction.channel.send({ embeds: [embed], components: [row] });

            // 5. Reply to Interaction
            await interaction.editReply({ content: `✅ Keluarga **${familyName}** berhasil dibuat!\n👑 **Role Kepala:** <@&${headRole.id}>\n⚜️ **Role Anggota:** <@&${memberRole.id}>\n\nℹ️ *Ingin menghapus keluarga? Silakan hubungi Administrator.*` });

            // 6. Update Family Directory
            try {
                const { updateFamilyDirectory } = require('../../handlers/familyDirectoryUtils');
                await updateFamilyDirectory(interaction.client);
            } catch (dirError) {
                console.error('Error updating directory:', dirError);
            }

        } catch (error) {
            console.error('Error handling build family modal:', error);
            await interaction.editReply({ content: 'Terjadi kesalahan internal saat membuat keluarga.' });
        }
    }
};

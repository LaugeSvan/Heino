const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Viser information om en bruger.')
        .addUserOption(option =>
            option.setName('bruger')
                .setDescription('Den bruger, du vil se information om (standard er dig selv).')
                .setRequired(false)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('bruger') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        
        const embed = new EmbedBuilder()
            .setColor(member.displayHexColor)
            .setTitle(`Brugerinformation for ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Brugernavn', value: user.tag, inline: true },
                { name: '🆔 Bruger ID', value: user.id, inline: true },
                { name: '🎂 Konto Oprettet', value: user.createdAt.toDateString(), inline: false },
                { name: '🚀 Blev Medlem', value: member.joinedAt.toDateString(), inline: true },
                { 
                    name: '🛡️ Roller', 
                    value: member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.toString()).join(', ') || 'Ingen ekstra roller', 
                    inline: false 
                },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
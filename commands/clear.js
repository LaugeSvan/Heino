const { SlashCommandBuilder, ChannelType, InteractionResponseFlags } = require('discord.js');

const REQUIRED_ROLE_IDS = [
    '1436397954159083680', 
    '1436397955367178380'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Sletter et antal beskeder i en kanal (Kun for specifikke roller).')
        .setDMPermission(false) 
        
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Kanalen, hvor beskederne skal slettes.')
                .addChannelTypes(ChannelType.GuildText) 
                .setRequired(true))
        
        .addIntegerOption(option =>
            option.setName('antal')
                .setDescription('Antal beskeder der skal slettes (1-100).')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true))
                
        .addUserOption(option =>
            option.setName('bruger')
                .setDescription('Vælg en bruger for kun at slette deres beskeder.')
                .setRequired(false)),
    
    async execute(interaction) {

        const hasRequiredRole = interaction.member.roles.cache.some(role => 
            REQUIRED_ROLE_IDS.includes(role.id)
        );

        if (!hasRequiredRole) {
            return interaction.reply({ 
                content: '🚫 Du har ikke de nødvendige roller for at køre denne kommando.', 
                flags: 64
            });
        }

        const channel = interaction.options.getChannel('kanal');
        const amount = interaction.options.getInteger('antal');
        const user = interaction.options.getUser('bruger');
        
        await interaction.deferReply({ flags: 64 });

        try {
            let messages = await channel.messages.fetch({ limit: amount });
            
            if (user) {
                messages = messages.filter(m => m.author.id === user.id); 
                
                if (messages.size === 0) {
                     return interaction.editReply({ 
                         content: `✅ Fandt ingen beskeder fra ${user.tag} at slette i ${channel.name}.` 
                     });
                }
            }

            const deleted = await channel.bulkDelete(messages, true);
            
            const userFilterText = user ? ` fra **${user.tag}**` : '';

            await interaction.editReply({ 
                content: `✅ Succesfuldt slettet **${deleted.size}** beskeder${userFilterText} i kanalen **#${channel.name}**.`
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: '❌ Der opstod en fejl under sletning af beskeder. Tjek bottens tilladelser (Manage Messages) og om beskederne er ældre end 14 dage.' 
            });
        }
    }
};
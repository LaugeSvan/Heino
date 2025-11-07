const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Måler bottens svartid (latency).'),
    
    async execute(interaction) {
        const apiLatency = Math.round(interaction.client.ws.ping); 

        await interaction.reply({ 
            content: `🏓 **Pong!**
Latency: **${Date.now() - interaction.createdTimestamp}ms**
Discord API: **${apiLatency}ms**`, 
            ephemeral: true
        });
    }
};
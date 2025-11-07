const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Får botten til at sige en besked i den nuværende kanal.')
        .addStringOption(option =>
            option.setName('tekst')
                .setDescription('Den besked, botten skal sende.')
                .setRequired(true)),
    
    async execute(interaction) {
        const messageText = interaction.options.getString('tekst');

        await interaction.reply({ 
            content: `Din besked er sendt.`, 
            ephemeral: true 
        });

        await interaction.channel.send(messageText);
    }
};
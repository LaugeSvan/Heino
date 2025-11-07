const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

require('dotenv').config(); 

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ],

    sweepers: {
        messages: {
            interval: 3600, 
            lifetime: 1800,
        }
    }
});

client.options.disableWarnings = true; 

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`[LOAD] Kommando "${command.data.name}" indlæst.`);
    } else {
        console.log(`[ADVARSEL] Kommandoen ved ${filePath} mangler enten en påkrævet "data" eller "execute" egenskab.`);
    }
}

client.once('clientReady', () => {
    console.log(`✅ Succesfuldt logget ind som ${client.user.tag}!`);
    
    setTimeout(registerCommands, 1000); 
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Ingen kommando matchende ${interaction.commandName} blev fundet.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Fejl ved kørsel af ${interaction.commandName}:`, error);
        
        const ephemeralFlag = 64; 
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Der opstod en fejl under udførelsen af denne kommando!', flags: ephemeralFlag });
        } else {
            await interaction.reply({ content: 'Der opstod en fejl under udførelsen af denne kommando!', flags: ephemeralFlag });
        }
    }
});

// 👥 Håndtering af nye medlemmer, der joiner serveren (GuildMemberAdd)
client.on('guildMemberAdd', async member => {
    // 🏷️ ROLLE-ID'ER
    const HUMAN_ROLE_ID = '1436397957720309891'; // Oprindelig rolle til mennesker
    const BOT_ROLE_IDS = [ 
        '1436393279657738271', // Første Bot Rolle
        '1436397956595978390'  // Anden Bot Rolle
    ];

    try {
        if (member.user.bot) {
            // --- BOT LOGIK ---
            
            console.log(`🤖 Ny Bot fundet: ${member.user.tag}. Tildeler bot-roller...`);
            
            // Saml alle rolleobjekter for bots
            const botRoles = BOT_ROLE_IDS
                .map(id => member.guild.roles.cache.get(id))
                .filter(role => role); // Filtrer ugyldige/ikke-fundne roller

            if (botRoles.length === 0) {
                console.error("ADVARSEL: Ingen af de specificerede bot-roller blev fundet i guilden.");
                return;
            }

            // Tildel alle fundne bot-roller på én gang
            await member.roles.add(botRoles, 'Automatisk tildelt to Bot-roller ved join');
            console.log(`✅ Succesfuldt tildelt ${botRoles.length} bot-roller til ${member.user.tag}.`);
            
        } else {
            // --- MENNESKE LOGIK (Din oprindelige funktionalitet) ---
            
            const humanRole = member.guild.roles.cache.get(HUMAN_ROLE_ID);
            
            if (!humanRole) {
                console.error(`ADVARSEL: Menneske-rollen med ID ${HUMAN_ROLE_ID} blev ikke fundet.`);
                return;
            }

            // Tildeler menneske-rollen
            await member.roles.add(humanRole, 'Automatisk tildelt ved join (Menneske)');
            console.log(`✅ Succesfuldt tildelt rolle ${humanRole.name} til ${member.user.tag}.`);
        }

    } catch (error) {
        console.error(`❌ Fejl ved tildeling af rolle til ${member.user.tag}:`, error);
        console.error("Sørg for, at din bots rolle er højere end de roller, den forsøger at tildele!");
    }
});

async function registerCommands() {
    const { REST, Routes } = require('discord.js');
    
    const commands = [];
    for (const command of client.commands.values()) {
        commands.push(command.data.toJSON());
    }

    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    const clientId = client.user.id; 

    try {
        console.log(`Begynder at opdatere ${commands.length} applikations (/) kommandoer.`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`✅ Succesfuldt genindlæst ${data.length} applikations (/) kommandoer.`);
    } catch (error) {
        console.error("Fejl ved registrering af kommandoer:", error);
    }
}

client.login(process.env.DISCORD_TOKEN);
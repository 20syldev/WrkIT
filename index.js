require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType, Partials } = require('discord.js');
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildPresences], 
    partials: [Partials.Channel] 
});

// Express
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Serveur défini avec le port ${port}`);
});

// https
var https = require('https');
https.createServer(function (req, res) {
    res.write('Bot en ligne');
    res.end();
}).listen(8080);

// Discord
client.on('ready', (x) => {
    console.log(`✅ ${x.user.tag} en ligne !`);
    const serveur = client.guilds.cache.get('1018257684253900842');
    const membres = serveur.memberCount;
    const slam = serveur.members.cache.filter(member => member.roles.cache.has('1285512634442977282')).size;
    const sisr = serveur.members.cache.filter(member => member.roles.cache.has('1285512635109998645')).size;
    
    const activities = [
        {
            name: `${membres} élèves`,
            type: ActivityType.Watching
        },
        { 
            name: 'les suggestions',
            type: ActivityType.Listening
        },
        { 
            name: `${slam} élèves en SLAM`,
            type: ActivityType.Watching
        },
        { 
            name: 'rien, ça travaille.',
            type: ActivityType.Playing
        },
        { 
            name: `${sisr} élèves en SISR`,
            type: ActivityType.Watching
        },
        { 
            name: 'le cours',
            type: ActivityType.Listening
        },
    ];

    let activityIndex = 0;
    setInterval(() => {
        client.user.setActivity(activities[activityIndex]);
        activityIndex = (activityIndex + 1) % activities.length;
    }, 20000);
});

client.login(process.env.TOKEN);

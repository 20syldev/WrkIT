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

// Fonction pour formater la date et l'heure
function formatDateTime() {
    const now = new Date();
    const day = now.toLocaleDateString('fr-FR', { weekday: 'long' });
    const date = now.toLocaleDateString('fr-FR');
    
    return { day, date};
}

// Fonction pour définir le nom du salon pour la date
function setDateChannel() {
    const { date} = formatDateTime();
    return `📅〡${date}`;
}

// Fonction pour définir le nom du salon pour les professeurs
function setProfChannel() {
    pass
    // return `💼〡${profMessage}`;
}

// Fonction pour définir le nom du salon pour les cours en cours
function setCoursChannel() {
    pass
    // return `📚〡${coursMessage}`;
}

// Discord
client.on('ready', (x) => {
    console.log(`✅ ${x.user.tag} en ligne !`);
    const serveur = client.guilds.cache.get('1018257684253900842');
    const membres = serveur.memberCount;
    const slam = serveur.members.cache.filter(member => member.roles.cache.has('1285512634442977282')).size;
    const sisr = serveur.members.cache.filter(member => member.roles.cache.has('1285512635109998645')).size;

    const voiceChannelDate = serveur.channels.cache.get('1290337993835544636');
    // const voiceChannelProf = serveur.channels.cache.get('1290337943658954793');
    // const voiceChannelCours = serveur.channels.cache.get('1290337804580159553');

    const activities = [
        { 
            name: `${membres} membres`, 
            type: ActivityType.Watching 
        },
        { 
            name: 'les suggestions', 
            type: ActivityType.Listening 
        },
        { 
            name: `${slam} membres en SLAM`, 
            type: ActivityType.Watching 
        },
        { 
            name: 'rien, je bosse.', 
            type: ActivityType.Playing 
        },
        { 
            name: `${sisr} membres en SISR`, 
            type: ActivityType.Watching 
        },
    ];

    let activityIndex = 0;
    setInterval(() => {
        if (activityIndex >= activities.length) {
            activityIndex = 0;
        }
        client.user.setActivity(activities[activityIndex]);
        activityIndex++;
    }, 20000);

    // Met à jour les salons toutes les 10 minutes
    setInterval(() => {
        const newDate = setDateChannel();
        // const newProf = setProfChannel();
        // const newCours = setCoursChannel();
        voiceChannelDate.setName(newDate).catch(console.error);
        // voiceChannelProf.setName(newProf).catch(console.error);
        // voiceChannelCours.setName(newCours).catch(console.error);
    }, 600000);
});

client.login(process.env.TOKEN);

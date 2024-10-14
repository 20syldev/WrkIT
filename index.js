require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType, Partials } = require('discord.js');
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildPresences], 
    partials: [Partials.Channel] 
});

// Express
const fs = require('fs');

const express = require('express');

const path = require('path');
const app = express();
const port = process.env.PORT || 4000;
const schedulePath = path.join(__dirname, 'horaires.json');
const schedule = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));

app.listen(port, () => {
    console.log(`Serveur défini avec le port ${port}`);
});

// https
var https = require('https');
https.createServer(function (req, res) {
    res.write('Bot en ligne');
    res.end();
}).listen(8080);

function formatTime(minutes) {
    if (minutes >= 60) {
        const heuresRestantes = Math.floor(minutes / 60);
        const minutesRestantes = minutes % 60;
        return `${heuresRestantes}h ${minutesRestantes}min`;
    }
    return `${minutes}min`;
}

function getWeekType() {
    const now = new Date();
    const weekNumber = Math.ceil(((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + now.getDay() + 1) / 7);
    return (weekNumber % 2 === 0) ? "A" : "B";
}

function getScheduleInfo(schedule) {
    const now = new Date();
    const options = { timeZone: 'Europe/Paris', hour12: false };

    const formattedDate = now.toLocaleDateString('fr-FR', options);
    const formattedTime = now.toLocaleTimeString('fr-FR', options);
    
    const [hours, minutes] = formattedTime.split(':').map(Number);
    const currentHour = `${hours}:${minutes.toString().padStart(2, '0')}`;
    const day = now.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', weekday: 'long' }).toLowerCase();
    
    const weekType = getWeekType();
    const dayCourses = schedule['semaines'][weekType][day]?.cours || [];

    let nextEvent = null;
    let timeUntilNextEvent = null;
    let timeUntilPause = null;

    const endOfDayCourse = dayCourses.find(cours => cours.id === "soir");
    const endOfDayTime = endOfDayCourse ? endOfDayCourse.fin : null;

    for (let i = 0; i < dayCourses.length; i++) {
        const cours = dayCourses[i];

        if (cours.cours.toLowerCase().includes('pause midi')) {
            const [pauseHours, pauseMinutes] = cours.debut.split(':').map(Number);
            const pauseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), pauseHours, pauseMinutes);
            const timeDiffPause = pauseDate - now;
            const minutesUntilPause = Math.floor((timeDiffPause / 1000) / 60);
            
            if (minutesUntilPause > 0) {
                timeUntilPause = formatTime(minutesUntilPause) + ' avant midi';
            } else {
                timeUntilPause = "Pause midi";
            }
        }

        if (currentHour < cours.debut) {
            if (!nextEvent) {
                nextEvent = cours;
                const [eventHours, eventMinutes] = cours.debut.split(':').map(Number);
                const eventDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eventHours, eventMinutes);
                const timeDiffNextEvent = eventDate - now;
                const minutesUntilNextEvent = Math.floor((timeDiffNextEvent / 1000) / 60);

                timeUntilNextEvent = formatTime(minutesUntilNextEvent) + ' avant ' + cours.cours;
            }
        }
    }

    if (timeUntilPause === "Pause midi") {
        const pauseMidiCourse = dayCourses.find(cours => cours.id === "pause_midi");
        if (pauseMidiCourse) {
            const [pauseEndHours, pauseEndMinutes] = pauseMidiCourse.fin.split(':').map(Number);
            const pauseEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), pauseEndHours - 2, pauseEndMinutes);

            if (now > pauseEndDate) {
                if (endOfDayTime) {
                    const [endHours, endMinutes] = endOfDayTime.split(':').map(Number);
                    const endOfDayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHours, endMinutes);
                    
                    if (now < endOfDayDate) {
                        const timeDiffEndOfDay = endOfDayDate - now;
                        const minutesUntilEndOfDay = Math.floor((timeDiffEndOfDay / 1000) / 60);
                        timeUntilPause = formatTime(minutesUntilEndOfDay) + ' avant la fin';
                    } else {
                        timeUntilPause = "Aucune pause pour le moment";
                    }
                }
            }
        }
    }
    
    return {
        date: formattedDate,
        nextEvent: nextEvent ? {
            matiere: nextEvent.cours,
            prof: nextEvent.prof,
            salle: nextEvent.salle,
        } : null,
        timeUntilNextEvent: timeUntilNextEvent || "Aucun événement à venir",
        timeUntilPause: timeUntilPause || "Aucune pause midi aujourd'hui",
    };
}

// Discord
client.on('ready', (x) => {
    console.log(`✅ ${x.user.tag} en ligne !`);
    const serveur = client.guilds.cache.get('1018257684253900842');
    const membres = serveur.memberCount;
    const slam = serveur.members.cache.filter(member => member.roles.cache.has('1285512634442977282')).size;
    const sisr = serveur.members.cache.filter(member => member.roles.cache.has('1285512635109998645')).size;

    const voiceChannelDate = serveur.channels.cache.get('1290337993835544636');
    const voiceChannelProf = serveur.channels.cache.get('1290337943658954793');
    const voiceChannelSalle = serveur.channels.cache.get('1292772339452350528');
    const voiceChannelCours = serveur.channels.cache.get('1290337804580159553');
    const voiceChannelPause = serveur.channels.cache.get('1292766719265476630');
    
    // Met à jour le statut toutes les minutes
    setInterval(() => {
        const scheduleInfo = getScheduleInfo(schedule);

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
                name: `${scheduleInfo.timeUntilNextEvent}`,
                type: ActivityType.Playing
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
            { 
                name: `${scheduleInfo.timeUntilPause}`,
                type: ActivityType.Playing
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
    }, 60000);  

    // Met à jour les salons toutes les 10 minutes
    setInterval(() => {
        const scheduleInfo = getScheduleInfo(schedule);
        const nextEvent = scheduleInfo.nextEvent;
        const newDate = `📅〡${scheduleInfo.date}`;
        const newCours = `📚〡${nextEvent ? nextEvent.matiere : "Aucun cours"}`
        const newProf = `💼〡${nextEvent ? nextEvent.prof : "Aucun prof"}`;
        const newSalle = `🚪〡${nextEvent ? nextEvent.salle : "Aucune salle"}`;
        const newPause = `🍴〡${scheduleInfo.timeUntilPause}`;
        
        voiceChannelDate.setName(newDate).catch(console.error);
        voiceChannelCours.setName(newCours).catch(console.error);
        voiceChannelProf.setName(newProf).catch(console.error);
        voiceChannelSalle.setName(newSalle).catch(console.error);
        voiceChannelPause.setName(newPause).catch(console.error);
    }, 350000);
});

client.login(process.env.TOKEN);

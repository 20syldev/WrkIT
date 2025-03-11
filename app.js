import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import pkg from 'discord.js';

// ----- ----- ----- CONFIGURATION EXPRESS ----- ----- ----- //

// Environnement
dotenv.config();

// Express
const app = express();
const __dirname = path.resolve();
const port = process.env.PORT || 4000;

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Erreur 500
app.use((req, res) => res.status(500).sendFile(path.join(__dirname, 'erreur.html')));

// Page principale
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));    

// ----- ----- ----- CONFIGURATION DISCORD ----- ----- ----- //

// Modules Discord
const {
    ActionRowBuilder,
    ActivityType,
    ButtonBuilder,
    ButtonStyle,
    Client,
    GatewayIntentBits,
    GuildScheduledEventEntityType,
    Partials,
    REST,
    Routes
} = pkg;

// Client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel]
});

// API REST Discord
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Commandes slash Discord
const commands = [
    {
        name: 'embed',
        description: 'Créer un embed personnalisé',
        options: [
            {
                type: 3,
                name: 'titre',
                description: 'Titre de l\'embed',
                required: true
            },
            {
                type: 3,
                name: 'description',
                description: 'Description de l\'embed',
                required: true
            },
            {
                type: 3,
                name: 'couleur',
                description: 'Couleur de l\'embed (hexadécimal)',
                required: false
            }
        ]
    },
    {
        name: 'event-add',
        description: 'Ajouter un événement Discord',
        options: [
            {
                type: 3,
                name: 'nom',
                description: 'Nom de l\'événement',
                required: true
            },
            {
                type: 3,
                name: 'lieu',
                description: 'Lieu de l\'événement',
                required: true
            },
            {
                type: 4,
                name: 'jour',
                description: 'Jour de l\'événement (1-31)',
                required: true
            },
            {
                type: 4,
                name: 'mois',
                description: 'Mois de l\'événement (1-12)',
                required: true
            },
            {
                type: 4,
                name: 'année',
                description: 'Année de l\'événement',
                required: true
            },
            {
                type: 4,
                name: 'heure',
                description: 'Heure de l\'événement (0-23)',
                required: true
            },
            {
                type: 4,
                name: 'minute',
                description: 'Minutes de l\'événement (0-59)',
                required: true
            },
            {
                type: 4,
                name: 'durée',
                description: 'Durée de l\'événement en minutes',
                required: false
            },
            {
                type: 3,
                name: 'description',
                description: 'Description de l\'événement',
                required: false
            }
        ]
    },
    {
        name: 'event-edit',
        description: 'Modifier un événement Discord',
        options: [
            {
                type: 3,
                name: 'id',
                description: 'ID de l\'événement à modifier',
                required: true
            },
            {
                type: 3,
                name: 'nom',
                description: 'Nom de l\'événement',
                required: false
            },
            {
                type: 3,
                name: 'lieu',
                description: 'Lieu de l\'événement',
                required: false
            },
            {
                type: 4,
                name: 'jour',
                description: 'Jour de l\'événement (1-31)',
                required: false
            },
            {
                type: 4,
                name: 'mois',
                description: 'Mois de l\'événement (1-12)',
                required: false
            },
            {
                type: 4,
                name: 'année',
                description: 'Année de l\'événement',
                required: false
            },
            {
                type: 4,
                name: 'heure',
                description: 'Heure de l\'événement (0-23)',
                required: false
            },
            {
                type: 4,
                name: 'minute',
                description: 'Minutes de l\'événement (0-59)',
                required: false
            },
            {
                type: 4,
                name: 'durée',
                description: 'Durée de l\'événement en minutes',
                required: false
            },
            {
                type: 3,
                name: 'description',
                description: 'Description de l\'événement',
                required: false
            }
        ]
    },
    {
        name: 'event-delete',
        description: 'Supprimer un événement Discord',
        options: [
            {
                type: 3,
                name: 'id',
                description: 'ID de l\'événement à supprimer',
                required: true
            }
        ]
    },
    {
        name: 'planning',
        description: 'Afficher le planning de la classe',
        options: [
            {
                type: 3,
                name: 'spécialité',
                description: 'Spécialité de la classe (SLAM ou SISR)',
                required: true,
                choices: [
                    { name: 'SLAM', value: 'SLAM' },
                    { name: 'SISR', value: 'SISR' }
                ]
            },
            {
                type: 3,
                name: 'visualiser',
                description: 'Visualiser différentes informations',
                required: false,
                choices: [
                    { name: 'Cours actuel', value: 'current' },
                    { name: 'Prochain cours', value: 'next' }
                ]
            }
        ],
    }
];

// Enregistrement des commandes slash
(async () => {
    try {
        console.log('Début de la mise à jour des commandes (/) de l\'application.');
        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
        console.log('Les commandes (/) de l\'application ont été mises à jour avec succès.');
    } catch (err) {
        console.error(err);
    }
})();

// ----- ----- ----- APPLICATION ----- ----- ----- //

// Statut du bot & calcul des membres
client.on('ready', (x) => {
    console.log(`✅ ${x.user.username} connecté à Discord !`);
    const server = client.guilds.cache.get(process.env.GUILD_ID);
    const members = server.memberCount;
    const slam = server.members.cache.filter(member => member.roles.cache.has(process.env.ROLE_SLAM)).size;
    const sisr = server.members.cache.filter(member => member.roles.cache.has(process.env.ROLE_SISR)).size;
    
    const activities = [
        {
            name: `${members} élèves`,
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

// ----- ----- ----- COMMANDES UTILITAIRES ----- ----- ----- //

// Créer un embed personnalisé
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'embed') {
        const titre = options.getString('titre');
        const description = options.getString('description');
        const couleur = options.getString('couleur') || '#a674cc';

        const embed = {
            color: parseInt(couleur.replace('#', ''), 16),
            title: titre,
            description: description
        };

        await interaction.reply({ embeds: [embed] });
    }
});

// ----- ----- ----- COMMANDES DE GESTION ----- ----- ----- //

// Ajouter un événement
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'event-add') {
        const nom = options.getString('nom');
        const lieu = options.getString('lieu');
        const jour = options.getInteger('jour');
        const mois = options.getInteger('mois');
        const annee = options.getInteger('année');
        const heure = options.getInteger('heure');
        const minute = options.getInteger('minute');
        const duree = options.getInteger('durée');
        const description = options.getString('description');

        const startDate = new Date(annee, mois - 1, jour, heure, minute);
        const endDate = new Date(startDate.getTime() + (duree || 120) * 60 * 1000);

        if (startDate < new Date()) return await interaction.reply({ content: 'La date de début de l\'événement ne peut pas être dans le passé.', flags: 64 });

        const data = {
            name: nom,
            description,
            scheduledStartTime: startDate.toISOString(),
            scheduledEndTime: endDate.toISOString(),
            entityType: GuildScheduledEventEntityType.External,
            entityMetadata: {
                location: lieu
            },
            privacyLevel: 2
        };

        try {
            await interaction.guild.scheduledEvents.create(data);
            await interaction.reply({ content: `Événement ajouté : **${nom}** à **${lieu}** le **${startDate.toLocaleDateString('fr-FR')}** à **${startDate.toLocaleTimeString('fr-FR')}**.`, flags: 64 });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Une erreur est survenue lors de l\'ajout de l\'événement.', flags: 64 });
        }
    }
});

// Modifier un événement
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'event-edit') {
        const id = options.getString('id');
        const nom = options.getString('nom');
        const lieu = options.getString('lieu');
        const jour = options.getInteger('jour');
        const mois = options.getInteger('mois');
        const annee = options.getInteger('année');
        const heure = options.getInteger('heure');
        const minute = options.getInteger('minute');
        const duree = options.getInteger('durée');
        const description = options.getString('description');

        const event = await interaction.guild.scheduledEvents.fetch(id);
        if (!event) return await interaction.reply({ content: 'Événement non trouvé.', flags: 64 });

        const startDate = new Date(annee, mois - 1, jour, heure, minute);
        const endDate = new Date(startDate.getTime() + (duree || 120) * 60 * 1000);

        const data = {
            name: nom || event.name,
            description: description || event.description,
            scheduledStartTime: startDate.toISOString(),
            scheduledEndTime: endDate.toISOString(),
            entityMetadata: {
                location: lieu || event.entityMetadata.location
            }
        };

        try {
            await event.edit(data);
            await interaction.reply({ content: `Événement **${id}** modifié.`, flags: 64 });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Une erreur est survenue lors de la modification de l\'événement.', flags: 64 });
        }
    }
});

// Supprimer un événement
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'event-delete') {
        const id = options.getString('id');
        const event = await interaction.guild.scheduledEvents.fetch(id);
        if (!event) return await interaction.reply({ content: 'Événement non trouvé.', flags: 64 });

        try {
            await event.delete();
            await interaction.reply({ content: `Événement **${id}** supprimé.`, flags: 64 });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Une erreur est survenue lors de la suppression de l\'événement.', flags: 64 });
        }
    }
});

// ----- ----- ----- COMMANDES D'INFORMATIONS ----- ----- ----- //

// Afficher le planning
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'planning') {
        const speciality = options.getString('spécialité');
        const visualiser = options.getString('visualiser');
        let url;

        if (speciality === 'SLAM') url = encodeURIComponent(process.env.PLANNING_SLAM);
        else if (speciality === 'SISR') url = encodeURIComponent(process.env.PLANNING_SISR);

        try {
            const response = await fetch('https://api.sylvain.pro/v3/hyperplanning', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `url=${url}&detail=full`
            });
            const data = await response.json();

            if (!data?.length) return interaction.reply({ content: 'Aucune données disponibles.', flags: 64 });

            const currentDate = new Date();
            const startDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1)));
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);

            const week = data.filter(event => {
                const date = new Date(event.start);
                return date <= endDate;
            });

            if (visualiser === 'next') {
                const next = week.find(event => new Date(event.start) > currentDate);
                if (!next) return interaction.reply({ content: 'Aucun événement à venir cette semaine.', flags: 64 });

                const start = new Date(next.start);
                const end = new Date(next.end);

                const details = `**${next.subject}**\n` +
                    (next.type ? (next.type === 'Skillogs' ? `Sur : ${next.type}\n` : `Salle : ${next.type}\n`) : '') +
                    (next.teacher ? `Professeur : ${next.teacher}\n` : '') +
                    (next.classes?.filter(c => c.trim()).length ? `Classes : ${next.classes.join(', ')}\n` : '') +
                    `De : <t:${Math.floor(start.getTime() / 1000)}:t> à <t:${Math.floor(end.getTime() / 1000)}:t>\n` +
                    `Commence <t:${Math.floor(start.getTime() / 1000)}:R>`;

                await interaction.reply({
                    embeds: [{
                        color: 0xa674cc,
                        title: `Prochain cours de la spécialité ${speciality}`,
                        description: details
                    }],
                    flags: 64
                });
            } else if (visualiser === 'current') {
                const current = week.find(event => new Date(event.start) <= currentDate && new Date(event.end) >= currentDate);
                if (!current) return interaction.reply({ content: 'Aucun cours actuellement.', flags: 64 });

                const start = new Date(current.start);
                const end = new Date(current.end);

                const details = `**${current.subject}**\n` +
                    (current.type ? (current.type === 'Skillogs' ? `Sur : ${current.type}\n` : `Salle : ${current.type}\n`) : '') +
                    (current.teacher ? `Professeur : ${current.teacher}\n` : '') +
                    (current.classes?.filter(c => c.trim()).length ? `Classes : ${current.classes.join(', ')}\n` : '') +
                    `De : <t:${Math.floor(start.getTime() / 1000)}:t> à <t:${Math.floor(end.getTime() / 1000)}:t>\n` +
                    `Termine <t:${Math.floor(end.getTime() / 1000)}:R>`;

                await interaction.reply({
                    embeds: [{
                        color: 0xa674cc,
                        title: `Cours actuel de la spécialité ${speciality}`,
                        description: details
                    }],
                    flags: 64
                });
            } else {
                const currentDate = new Date();
                const eventsList = week.map(event => {
                    const start = new Date(event.start);
                    const end = new Date(event.end);

                    const isCurrent = start <= currentDate && end >= currentDate;
                    const emoji = isCurrent ? ' 🟢' : '';

                    let details = `**${event.subject}${emoji}**\n`;
                    if (event.type) event.type === 'Skillogs' ? details += `Sur : ${event.type}\n` : details += `Salle : ${event.type}\n`;
                    if (event.teacher) details += `Professeur : ${event.teacher}\n`;
                    if (event.classes?.filter(c => c.trim()).length) details += `Classes : ${event.classes.join(', ')}\n`;

                    return `${details}De : <t:${Math.floor(start.getTime() / 1000)}:t> à <t:${Math.floor(end.getTime() / 1000)}:t>\n`;
                });

                const maxLength = 1024;
                const pages = [];
                let currentPage = '';

                eventsList.forEach(event => {
                    if ((currentPage + event).length > maxLength) {
                        pages.push(currentPage);
                        currentPage = '';
                    }
                    currentPage += event + '\n';
                });
                if (currentPage) pages.push(currentPage);

                let pageIndex = 0;

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel('Précédent')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(pageIndex === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('Suivant')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(pageIndex === pages.length - 1)
                    );

                await interaction.reply({
                    embeds: [{
                        color: 0xa674cc,
                        title: `Planning de la spécialité ${speciality}`,
                        description: 'Voici le planning de cette semaine :',
                        fields: [{ name: 'Événements', value: pages[pageIndex] }]
                    }],
                    components: [row],
                    flags: 64
                });

                const message = await interaction.fetchReply();

                const filter = i => i.customId === 'previous' || i.customId === 'next';
                const collector = message.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async i => {
                    if (i.customId === 'previous') pageIndex--;
                    else if (i.customId === 'next') pageIndex++;

                    const newRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('Précédent')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(pageIndex === 0),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('Suivant')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(pageIndex === pages.length - 1)
                        );

                    await i.update({
                        embeds: [{
                            color: 0xa674cc,
                            title: `Planning de la spécialité ${speciality}`,
                            description: 'Voici le planning de cette semaine :',
                            fields: [{ name: 'Événements', value: pages[pageIndex] }]
                        }],
                        components: [newRow],
                        flags: 64
                    });
                });

                collector.on('end', async () => {
                    const disabledRow = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('Précédent')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('Suivant')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true)
                        );

                    await message.edit({
                        components: [disabledRow]
                    });
                });
            }
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Une erreur est survenue lors de la récupération du planning.', flags: 64 });
        }
    }
});

// ----- ----- ----- CONNEXION ----- ----- ----- //

// Connexion du bot
client.login(process.env.TOKEN);
app.listen(port, () => console.log(`✅ Bot en ligne sur le port ${port}`));
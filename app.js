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
                required: false
            },
            {
                type: 3,
                name: 'description',
                description: 'Description de l\'embed',
                required: false
            },
            {
                type: 3,
                name: 'couleur',
                description: 'Couleur de l\'embed (hexadécimal)',
                required: false
            },
            {
                type: 3,
                name: 'auteur',
                description: 'Auteur de l\'embed',
                required: false
            },
            {
                type: 3,
                name: 'pied',
                description: 'Pied de page de l\'embed',
                required: false
            },
            {
                type: 3,
                name: 'miniature',
                description: 'URL de la miniature de l\'embed',
                required: false
            },
            {
                type: 3,
                name: 'image',
                description: 'URL de l\'image de l\'embed',
                required: false
            },
            {
                type: 5,
                name: 'horodatage',
                description: 'Ajouter un horodatage à l\'embed',
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
                    { name: 'Cours actuel', value: 'actuel' },
                    { name: 'Cours suivant', value: 'suivant' }
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
    } catch (erreur) {
        console.error(erreur);
    }
})();

// ----- ----- ----- APPLICATION ----- ----- ----- //

// Statut du bot & calcul des membres
client.on('ready', (x) => {
    console.log(`✅ ${x.user.username} connecté à Discord !`);
    const serveur = client.guilds.cache.get(process.env.GUILD_ID);
    const membres = serveur.memberCount;
    const slam = serveur.members.cache.filter(member => member.roles.cache.has(process.env.ROLE_SLAM)).size;
    const sisr = serveur.members.cache.filter(member => member.roles.cache.has(process.env.ROLE_SISR)).size;
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

    if (process.env.PRODUCTION === 'true') {
        let i = 0;
        setInterval(() => {
            client.user.setActivity(activities[i]);
            i = (i + 1) % activities.length;
        }, 20000);
    } else {
        client.user.setActivity({
            name: '💻 En mode développement',
            type: ActivityType.Custom
        });
    }
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
        const auteur = options.getString('auteur');
        const pied = options.getString('pied');
        const miniature = options.getString('miniature');
        const image = options.getString('image');
        const horodatage = options.getBoolean('horodatage');

        if (!titre && !description && !auteur && !pied && !miniature && !image) {
            return await interaction.reply({ content: 'Vous devez au moins fournir un titre, une description, un auteur, un pied de page, une miniature ou une image.', flags: 64 });
        }

        const embed = {
            color: parseInt(couleur.replace('#', ''), 16),
            title: titre,
            description: description,
            author: auteur ? { name: auteur } : undefined,
            footer: pied ? { text: pied } : undefined,
            thumbnail: miniature ? { url: miniature } : undefined,
            image: image ? { url: image } : undefined,
            timestamp: horodatage ? new Date() : undefined
        };

        await interaction.channel.send({ embeds: [embed] });
        await interaction.reply({ content: 'Embed envoyé !', flags: 64 });
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

        const debut = new Date(annee, mois - 1, jour, heure, minute);
        const fin = new Date(debut.getTime() + (duree || 120) * 60 * 1000);

        if (debut < new Date()) return await interaction.reply({ content: 'La date de début de l\'événement ne peut pas être dans le passé.', flags: 64 });

        const donnees = {
            name: nom,
            description,
            scheduledStartTime: debut.toISOString(),
            scheduledEndTime: fin.toISOString(),
            entityType: GuildScheduledEventEntityType.External,
            entityMetadata: {
                location: lieu
            },
            privacyLevel: 2
        };

        try {
            await interaction.guild.scheduledEvents.create(donnees);
            await interaction.reply({ content: `Événement ajouté : **${nom}** à **${lieu}** le **${debut.toLocaleDateString('fr-FR')}** à **${debut.toLocaleTimeString('fr-FR')}**.`, flags: 64 });
        } catch (erreur) {
            console.error(erreur);
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

        const e = await interaction.guild.scheduledEvents.fetch(id);
        if (!e) return await interaction.reply({ content: 'Événement non trouvé.', flags: 64 });

        const debut = new Date(annee, mois - 1, jour, heure, minute);
        const fin = new Date(debut.getTime() + (duree || 120) * 60 * 1000);

        const donnees = {
            name: nom || e.name,
            description: description || e.description,
            scheduledStartTime: debut.toISOString(),
            scheduledEndTime: fin.toISOString(),
            entityMetadata: {
                location: lieu || e.entityMetadata.location
            }
        };

        try {
            await e.edit(donnees);
            await interaction.reply({ content: `Événement **${id}** modifié.`, flags: 64 });
        } catch (erreur) {
            console.error(erreur);
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
        const e = await interaction.guild.scheduledEvents.fetch(id);
        if (!e) return await interaction.reply({ content: 'Événement non trouvé.', flags: 64 });

        try {
            await e.delete();
            await interaction.reply({ content: `Événement **${id}** supprimé.`, flags: 64 });
        } catch (erreur) {
            console.error(erreur);
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
            const donnees = await response.json();

            if (!donnees?.length) return interaction.reply({ content: 'Aucune données disponibles.', flags: 64 });

            const date = new Date();
            const debut = new Date(date);
            debut.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));

            const fin = new Date(debut);
            fin.setDate(debut.getDate() + 6);

            const semaine = donnees.filter(e => new Date(e.start) <= fin);

            if (visualiser === 'suivant') {
                const suivant = semaine.find(e => new Date(e.start) > date);
                if (!suivant) return interaction.reply({ content: 'Aucun événement à venir cette semaine.', flags: 64 });

                const start = new Date(suivant.start);
                const end = new Date(suivant.end);

                const details = `**${suivant.subject}**\n` +
                    (suivant.type ? (suivant.type === 'Skillogs' ? `Sur : ${suivant.type}\n` : `Salle : ${suivant.type}\n`) : '') +
                    (suivant.teacher ? `Professeur : ${suivant.teacher}\n` : '') +
                    (suivant.classes?.filter(c => c.trim()).length ? `Classes : ${suivant.classes.join(', ')}\n` : '') +
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
            } else if (visualiser === 'actuel') {
                const actuel = semaine.find(e => new Date(e.start) <= date && new Date(e.end) >= date);
                if (!actuel) return interaction.reply({ content: 'Aucun cours actuellement.', flags: 64 });

                const start = new Date(actuel.start);
                const end = new Date(actuel.end);

                const details = `**${actuel.subject}**\n` +
                    (actuel.type ? (actuel.type === 'Skillogs' ? `Sur : ${actuel.type}\n` : `Salle : ${actuel.type}\n`) : '') +
                    (actuel.teacher ? `Professeur : ${actuel.teacher}\n` : '') +
                    (actuel.classes?.filter(c => c.trim()).length ? `Classes : ${actuel.classes.join(', ')}\n` : '') +
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
                const date = new Date();
                const eListe = semaine.map(e => {
                    const start = new Date(e.start);
                    const end = new Date(e.end);

                    const maintenant = start <= date && end >= date;
                    const emoji = maintenant ? ' 🟢' : '';

                    let details = `**${e.subject}${emoji}**\n`;
                    if (e.type) e.type === 'Skillogs' ? details += `Sur : ${e.type}\n` : details += `Salle : ${e.type}\n`;
                    if (e.teacher) details += `Professeur : ${e.teacher}\n`;
                    if (e.classes?.filter(c => c.trim()).length) details += `Classes : ${e.classes.join(', ')}\n`;

                    return `${details}De : <t:${Math.floor(start.getTime() / 1000)}:t> à <t:${Math.floor(end.getTime() / 1000)}:t>\n`;
                });
                if (!eListe.length) return interaction.reply({ content: 'Aucun événement à venir cette semaine.', flags: 64 });

                const max = 1024;
                const pages = [];
                let i = 0, page = '';

                eListe.forEach(e => {
                    if ((page + e).length > max) {
                        pages.push(page);
                        page = '';
                    }
                    page += e + '\n';
                });
                if (page) pages.push(page);

                const boutons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('precedent')
                            .setLabel('Précédent')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(i === 0),
                        new ButtonBuilder()
                            .setCustomId('suivant')
                            .setLabel('Suivant')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(i === pages.length - 1)
                    );

                await interaction.reply({
                    embeds: [{
                        color: 0xa674cc,
                        title: `Planning de la spécialité ${speciality}`,
                        description: 'Voici le planning de cette semaine :',
                        fields: [{ name: 'Événements', value: pages[i] }]
                    }],
                    components: [boutons],
                    flags: 64
                });

                const message = await interaction.fetchReply();

                const filtre = i => i.customId === 'precedent' || i.customId === 'suivant';
                const action = message.createMessageComponentCollector({ filtre, time: 60000 });

                action.on('collect', async i => {
                    if (i.customId === 'precedent') i--;
                    else if (i.customId === 'suivant') i++;

                    const nBoutons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('precedent')
                                .setLabel('Précédent')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(i === 0),
                            new ButtonBuilder()
                                .setCustomId('suivant')
                                .setLabel('Suivant')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(i === pages.length - 1)
                        );

                    try {
                        await i.update({
                            embeds: [{
                                color: 0xa674cc,
                                title: `Planning de la spécialité ${speciality}`,
                                description: 'Voici le planning de cette semaine :',
                                fields: [{ name: 'Événements', value: pages[i] }]
                            }],
                            components: [nBoutons],
                            flags: 64
                        });
                    } catch (erreur) {
                        console.error(erreur);
                        await i.reply({ content: 'Une erreur est survenue lors de la mise à jour du message.', flags: 64 });
                    }
                });

                action.on('end', async () => {
                    const dBoutons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('precedent')
                                .setLabel('Précédent')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('suivant')
                                .setLabel('Suivant')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true)
                        );

                    try { await message.edit({ components: [dBoutons] }); }
                    catch (erreur) {}
                });
            }
        } catch (erreur) {
            console.error(erreur);
            await interaction.reply({ content: 'Une erreur est survenue lors de la récupération du planning.', flags: 64 });
        }
    }
});

// ----- ----- ----- CONNEXION ----- ----- ----- //

// Connexion du bot
client.login(process.env.TOKEN);
app.listen(port, () => console.log(`✅ Bot en ligne sur le port ${port}`));
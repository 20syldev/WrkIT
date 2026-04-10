import { GuildScheduledEventEntityType, MessageFlags } from "discord.js";
import type { Command } from "../types.js";

export const command: Command = {
    data: {
        name: "event-add",
        description: "Ajouter un événement Discord",
        options: [
            {
                type: 3,
                name: "nom",
                description: "Nom de l'événement",
                required: true,
            },
            {
                type: 3,
                name: "lieu",
                description: "Lieu de l'événement",
                required: true,
            },
            {
                type: 4,
                name: "jour",
                description: "Jour de l'événement (1-31)",
                required: true,
            },
            {
                type: 4,
                name: "mois",
                description: "Mois de l'événement (1-12)",
                required: true,
            },
            {
                type: 4,
                name: "année",
                description: "Année de l'événement",
                required: true,
            },
            {
                type: 4,
                name: "heure",
                description: "Heure de l'événement (0-23)",
                required: true,
            },
            {
                type: 4,
                name: "minute",
                description: "Minutes de l'événement (0-59)",
                required: true,
            },
            {
                type: 4,
                name: "durée",
                description: "Durée de l'événement en minutes",
                required: false,
            },
            {
                type: 3,
                name: "description",
                description: "Description de l'événement",
                required: false,
            },
        ],
    },

    async execute(interaction, logger) {
        const nom = interaction.options.getString("nom", true);
        const lieu = interaction.options.getString("lieu", true);
        const jour = interaction.options.getInteger("jour", true);
        const mois = interaction.options.getInteger("mois", true);
        const annee = interaction.options.getInteger("année", true);
        const heure = interaction.options.getInteger("heure", true);
        const minute = interaction.options.getInteger("minute", true);
        const duree = interaction.options.getInteger("durée");
        const description = interaction.options.getString("description");

        const debut = new Date(annee, mois - 1, jour, heure, minute);
        const fin = new Date(debut.getTime() + (duree || 120) * 60 * 1000);

        if (debut < new Date()) {
            await interaction.reply({
                content: "La date de début de l'événement ne peut pas être dans le passé.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        try {
            await interaction.guild!.scheduledEvents.create({
                name: nom,
                description: description ?? undefined,
                scheduledStartTime: debut.toISOString(),
                scheduledEndTime: fin.toISOString(),
                entityType: GuildScheduledEventEntityType.External,
                entityMetadata: { location: lieu },
                privacyLevel: 2,
            });
            logger.log({ method: "RUN", url: "/event-add", status: 200 });
            await interaction.reply({
                content: `Événement ajouté : **${nom}** à **${lieu}** le **${debut.toLocaleDateString("fr-FR")}** à **${debut.toLocaleTimeString("fr-FR")}**.`,
                flags: MessageFlags.Ephemeral,
            });
        } catch {
            logger.log({ method: "RUN", url: "/event-add", status: 500 });
            await interaction.reply({
                content: "Une erreur est survenue lors de l'ajout de l'événement.",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};

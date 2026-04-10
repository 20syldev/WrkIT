import { MessageFlags } from "discord.js";
import type { Command } from "../types.js";

export const command: Command = {
    data: {
        name: "event-edit",
        description: "Modifier un événement Discord",
        options: [
            {
                type: 3,
                name: "id",
                description: "ID de l'événement à modifier",
                required: true,
            },
            {
                type: 3,
                name: "nom",
                description: "Nom de l'événement",
                required: false,
            },
            {
                type: 3,
                name: "lieu",
                description: "Lieu de l'événement",
                required: false,
            },
            {
                type: 4,
                name: "jour",
                description: "Jour de l'événement (1-31)",
                required: false,
            },
            {
                type: 4,
                name: "mois",
                description: "Mois de l'événement (1-12)",
                required: false,
            },
            {
                type: 4,
                name: "année",
                description: "Année de l'événement",
                required: false,
            },
            {
                type: 4,
                name: "heure",
                description: "Heure de l'événement (0-23)",
                required: false,
            },
            {
                type: 4,
                name: "minute",
                description: "Minutes de l'événement (0-59)",
                required: false,
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
        const id = interaction.options.getString("id", true);
        const nom = interaction.options.getString("nom");
        const lieu = interaction.options.getString("lieu");
        const jour = interaction.options.getInteger("jour");
        const mois = interaction.options.getInteger("mois");
        const annee = interaction.options.getInteger("année");
        const heure = interaction.options.getInteger("heure");
        const minute = interaction.options.getInteger("minute");
        const duree = interaction.options.getInteger("durée");
        const description = interaction.options.getString("description");

        const e = await interaction.guild!.scheduledEvents.fetch(id);
        if (!e) {
            await interaction.reply({
                content: "Événement non trouvé.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const debut = new Date(
            annee ?? e.scheduledStartAt!.getFullYear(),
            (mois ?? e.scheduledStartAt!.getMonth() + 1) - 1,
            jour ?? e.scheduledStartAt!.getDate(),
            heure ?? e.scheduledStartAt!.getHours(),
            minute ?? e.scheduledStartAt!.getMinutes(),
        );
        const fin = new Date(debut.getTime() + (duree || 120) * 60 * 1000);

        try {
            await e.edit({
                name: nom || e.name,
                description: description || e.description || undefined,
                scheduledStartTime: debut.toISOString(),
                scheduledEndTime: fin.toISOString(),
                entityMetadata: {
                    location: lieu || e.entityMetadata?.location || "",
                },
            });
            logger.log({ method: "RUN", url: "/event-edit", status: 200 });
            await interaction.reply({
                content: `Événement **${id}** modifié.`,
                flags: MessageFlags.Ephemeral,
            });
        } catch {
            logger.log({ method: "RUN", url: "/event-edit", status: 500 });
            await interaction.reply({
                content: "Une erreur est survenue lors de la modification de l'événement.",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};

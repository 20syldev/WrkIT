import { MessageFlags } from "discord.js";
import type { Command } from "../types.js";

export const command: Command = {
    data: {
        name: "clear",
        description: "Supprimer des messages dans le salon",
        default_member_permissions: "8192",
        options: [
            {
                type: 4,
                name: "nombre",
                description: "Nombre de messages à supprimer (1-100)",
                required: false,
            },
            {
                type: 3,
                name: "message",
                description: "Supprimer jusqu'à ce message (ID)",
                required: false,
            },
        ],
    },

    async execute(interaction, logger) {
        const nombre = interaction.options.getInteger("nombre");
        const message = interaction.options.getString("message");

        if (!nombre && !message) {
            await interaction.reply({
                content: "Vous devez spécifier un nombre de messages ou un ID de message.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (!interaction.channel || !("bulkDelete" in interaction.channel)) return;

        try {
            if (message) {
                const messages = await interaction.channel.messages.fetch({ after: message, limit: 99 });
                const cible = await interaction.channel.messages.fetch(message).catch(() => null);
                if (cible) messages.set(cible.id, cible);
                if (messages.size === 0) {
                    await interaction.reply({
                        content: "Aucun message trouvé.",
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }
                const supprime = await interaction.channel.bulkDelete(messages, true);
                logger.log({ method: "RUN", url: "/clear", status: 200 });
                await interaction.reply({
                    content: `${supprime.size} message${supprime.size > 1 ? "s" : ""} supprimé${supprime.size > 1 ? "s" : ""}.`,
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                if (nombre! < 1 || nombre! > 100) {
                    await interaction.reply({
                        content: "Le nombre de messages doit être compris entre 1 et 100.",
                        flags: MessageFlags.Ephemeral,
                    });
                    return;
                }
                const supprime = await interaction.channel.bulkDelete(nombre!, true);
                logger.log({ method: "RUN", url: "/clear", status: 200 });
                await interaction.reply({
                    content: `${supprime.size} message${supprime.size > 1 ? "s" : ""} supprimé${supprime.size > 1 ? "s" : ""}.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        } catch {
            logger.log({ method: "RUN", url: "/clear", status: 500 });
            await interaction.reply({
                content: "Une erreur est survenue lors de la suppression des messages.",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};

import { MessageFlags } from "discord.js";
import type { Command } from "../types.js";

export const command: Command = {
    data: {
        name: "event-delete",
        description: "Supprimer un événement Discord",
        options: [
            {
                type: 3,
                name: "id",
                description: "ID de l'événement à supprimer",
                required: true,
            },
        ],
    },

    async execute(interaction, logger) {
        const id = interaction.options.getString("id", true);
        const e = await interaction.guild!.scheduledEvents.fetch(id);
        if (!e) {
            await interaction.reply({
                content: "Événement non trouvé.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        try {
            await e.delete();
            logger.log({ method: "RUN", url: "/event-delete", status: 200 });
            await interaction.reply({
                content: `Événement **${id}** supprimé.`,
                flags: MessageFlags.Ephemeral,
            });
        } catch {
            logger.log({ method: "RUN", url: "/event-delete", status: 500 });
            await interaction.reply({
                content: "Une erreur est survenue lors de la suppression de l'événement.",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
};

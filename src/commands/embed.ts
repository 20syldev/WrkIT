import { MessageFlags } from "discord.js";
import type { Command } from "../types.js";

export const command: Command = {
    data: {
        name: "embed",
        description: "Créer un embed personnalisé",
        options: [
            {
                type: 3,
                name: "titre",
                description: "Titre de l'embed",
                required: false,
            },
            {
                type: 3,
                name: "description",
                description: "Description de l'embed",
                required: false,
            },
            {
                type: 3,
                name: "couleur",
                description: "Couleur de l'embed (hexadécimal)",
                required: false,
            },
            {
                type: 3,
                name: "auteur",
                description: "Auteur de l'embed",
                required: false,
            },
            {
                type: 3,
                name: "pied",
                description: "Pied de page de l'embed",
                required: false,
            },
            {
                type: 3,
                name: "miniature",
                description: "URL de la miniature de l'embed",
                required: false,
            },
            {
                type: 3,
                name: "image",
                description: "URL de l'image de l'embed",
                required: false,
            },
            {
                type: 5,
                name: "horodatage",
                description: "Ajouter un horodatage à l'embed",
                required: false,
            },
        ],
    },

    async execute(interaction, logger) {
        const titre = interaction.options.getString("titre");
        const description = interaction.options.getString("description");
        const couleur = interaction.options.getString("couleur") || "#a674cc";
        const auteur = interaction.options.getString("auteur");
        const pied = interaction.options.getString("pied");
        const miniature = interaction.options.getString("miniature");
        const image = interaction.options.getString("image");
        const horodatage = interaction.options.getBoolean("horodatage");

        if (!titre && !description && !auteur && !pied && !miniature && !image) {
            await interaction.reply({
                content:
                    "Vous devez au moins fournir un titre, une description, un auteur, un pied de page, une miniature ou une image.",
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const embed = {
            color: parseInt(couleur.replace("#", ""), 16),
            title: titre ?? undefined,
            description: description ?? undefined,
            author: auteur ? { name: auteur } : undefined,
            footer: pied ? { text: pied } : undefined,
            thumbnail: miniature ? { url: miniature } : undefined,
            image: image ? { url: image } : undefined,
            timestamp: horodatage ? new Date().toISOString() : undefined,
        };

        if (!interaction.channel || !("send" in interaction.channel)) return;
        await interaction.channel.send({ embeds: [embed] });
        logger.log({ method: "RUN", url: "/embed", status: 200 });
        await interaction.reply({
            content: "Embed envoyé !",
            flags: MessageFlags.Ephemeral,
        });
    },
};

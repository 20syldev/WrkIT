import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import type { SubLogger } from "@20syldev/logger.ts";
import { env } from "../env.js";
import type { Command, PlanningEvent } from "../types.js";

function formatDetails(event: PlanningEvent, start: Date, end: Date): string {
    const startTs = Math.floor(start.getTime() / 1000);
    const endTs = Math.floor(end.getTime() / 1000);

    let details = `**${event.subject}**\n`;
    if (event.type) details += event.type === "Skillogs" ? `Sur : ${event.type}\n` : `Salle : ${event.type}\n`;
    if (event.teacher) details += `Professeur : ${event.teacher}\n`;
    if (event.classes?.filter((c) => c.trim()).length) details += `Classes : ${event.classes.join(", ")}\n`;
    details += `De : <t:${startTs}:t> à <t:${endTs}:t>\n`;

    return details;
}

function createButtons(page: number, total: number): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId("precedent")
            .setLabel("Précédent")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === 0),
        new ButtonBuilder()
            .setCustomId("suivant")
            .setLabel("Suivant")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(page === total - 1),
    );
}

export const command: Command = {
    data: {
        name: "planning",
        description: "Afficher le planning de la classe",
        options: [
            {
                type: 3,
                name: "spécialité",
                description: "Spécialité de la classe (SLAM ou SISR)",
                required: true,
                choices: [
                    { name: "SLAM", value: "SLAM" },
                    { name: "SISR", value: "SISR" },
                ],
            },
            {
                type: 3,
                name: "visualiser",
                description: "Visualiser différentes informations",
                required: false,
                choices: [
                    { name: "Cours actuel", value: "actuel" },
                    { name: "Cours suivant", value: "suivant" },
                ],
            },
        ],
    },

    async execute(interaction, logger) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const speciality = interaction.options.getString("spécialité", true);
        const visualiser = interaction.options.getString("visualiser");

        const planningUrl =
            speciality === "SLAM" ? encodeURIComponent(env.PLANNING_SLAM) : encodeURIComponent(env.PLANNING_SISR);

        try {
            const fetchStart = Date.now();
            const response = await fetch("https://api.sylvain.sh/v3/hyperplanning", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `url=${planningUrl}&detail=full`,
            });
            logger.log({
                method: "POST",
                url: "/v3/hyperplanning",
                status: response.status,
                duration: `${Date.now() - fetchStart}ms`,
            });
            const donnees: PlanningEvent[] = await response.json();

            if (!donnees?.length) {
                await interaction.editReply({ content: "Aucune données disponibles." });
                return;
            }

            const maintenant = new Date();
            const debutSemaine = new Date(maintenant);
            debutSemaine.setDate(maintenant.getDate() - maintenant.getDay() + (maintenant.getDay() === 0 ? -6 : 1));

            const finSemaine = new Date(debutSemaine);
            finSemaine.setDate(debutSemaine.getDate() + 6);

            const semaine = donnees.filter((e) => new Date(e.start) <= finSemaine);

            if (visualiser === "suivant") {
                await handleNext(interaction, semaine, speciality, maintenant, logger);
            } else if (visualiser === "actuel") {
                await handleCurrent(interaction, semaine, speciality, maintenant, logger);
            } else {
                await handleFull(interaction, semaine, speciality, maintenant, logger);
            }
        } catch {
            logger.log({ method: "RUN", url: "/planning", status: 500 });
            await interaction.editReply({ content: "Une erreur est survenue lors de la récupération du planning." });
        }
    },
};

async function handleNext(
    interaction: Parameters<Command["execute"]>[0],
    semaine: PlanningEvent[],
    speciality: string,
    maintenant: Date,
    logger: SubLogger,
) {
    const suivant = semaine.find((e) => new Date(e.start) > maintenant);
    if (!suivant) {
        await interaction.editReply({ content: "Aucun événement à venir cette semaine." });
        return;
    }

    const start = new Date(suivant.start);
    const end = new Date(suivant.end);
    const details = formatDetails(suivant, start, end) + `Commence <t:${Math.floor(start.getTime() / 1000)}:R>`;

    logger.log({ method: "RUN", url: "/planning", status: 200 });
    await interaction.editReply({
        embeds: [
            {
                color: 0xa674cc,
                title: `Prochain cours de la spécialité ${speciality}`,
                description: details,
            },
        ],
    });
}

async function handleCurrent(
    interaction: Parameters<Command["execute"]>[0],
    semaine: PlanningEvent[],
    speciality: string,
    maintenant: Date,
    logger: SubLogger,
) {
    const actuel = semaine.find((e) => new Date(e.start) <= maintenant && new Date(e.end) >= maintenant);
    if (!actuel) {
        await interaction.editReply({ content: "Aucun cours actuellement." });
        return;
    }

    const start = new Date(actuel.start);
    const end = new Date(actuel.end);
    const details = formatDetails(actuel, start, end) + `Termine <t:${Math.floor(end.getTime() / 1000)}:R>`;

    logger.log({ method: "RUN", url: "/planning", status: 200 });
    await interaction.editReply({
        embeds: [
            {
                color: 0xa674cc,
                title: `Cours actuel de la spécialité ${speciality}`,
                description: details,
            },
        ],
    });
}

async function handleFull(
    interaction: Parameters<Command["execute"]>[0],
    semaine: PlanningEvent[],
    speciality: string,
    maintenant: Date,
    logger: SubLogger,
) {
    const eListe = semaine.map((e) => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        const enCours = start <= maintenant && end >= maintenant;
        const emoji = enCours ? " 🟢" : "";

        let details = `**${e.subject}${emoji}**\n`;
        if (e.type) details += e.type === "Skillogs" ? `Sur : ${e.type}\n` : `Salle : ${e.type}\n`;
        if (e.teacher) details += `Professeur : ${e.teacher}\n`;
        if (e.classes?.filter((c) => c.trim()).length) details += `Classes : ${e.classes.join(", ")}\n`;

        return `${details}De : <t:${Math.floor(start.getTime() / 1000)}:t> à <t:${Math.floor(end.getTime() / 1000)}:t>\n`;
    });

    if (!eListe.length) {
        await interaction.editReply({ content: "Aucun événement à venir cette semaine." });
        return;
    }

    const max = 1024;
    const pages: string[] = [];
    let page = "";

    for (const e of eListe) {
        if ((page + e).length > max) {
            pages.push(page);
            page = "";
        }
        page += e + "\n";
    }
    if (page) pages.push(page);

    let currentPage = 0;

    logger.log({ method: "RUN", url: "/planning", status: 200 });
    await interaction.editReply({
        embeds: [
            {
                color: 0xa674cc,
                title: `Planning de la spécialité ${speciality}`,
                description: "Voici le planning de cette semaine :",
                fields: [{ name: "Événements", value: pages[currentPage] }],
            },
        ],
        components: [createButtons(currentPage, pages.length)],
    });

    const message = await interaction.fetchReply();

    const action = message.createMessageComponentCollector({
        filter: (i) => i.customId === "precedent" || i.customId === "suivant",
        time: 60000,
    });

    action.on("collect", async (btnInteraction) => {
        logger.log({ method: "RUN", url: `/planning - ${btnInteraction.customId}`, status: 200 });
        if (btnInteraction.customId === "precedent") currentPage--;
        else if (btnInteraction.customId === "suivant") currentPage++;

        try {
            await btnInteraction.update({
                embeds: [
                    {
                        color: 0xa674cc,
                        title: `Planning de la spécialité ${speciality}`,
                        description: "Voici le planning de cette semaine :",
                        fields: [{ name: "Événements", value: pages[currentPage] }],
                    },
                ],
                components: [createButtons(currentPage, pages.length)],
            });
        } catch {
            logger.log({ method: "RUN", url: "/planning", status: 500 });
            await btnInteraction.editReply({
                content: "Une erreur est survenue lors de la mise à jour du message.",
            });
        }
    });

    action.on("end", async () => {
        const disabledButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId("precedent")
                .setLabel("Précédent")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId("suivant")
                .setLabel("Suivant")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
        );

        try {
            await message.edit({ components: [disabledButtons] });
        } catch {
            /* message peut avoir été supprimé */
        }
    });
}

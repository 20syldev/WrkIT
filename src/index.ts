import { env } from "./env.js";
import { REST, Routes } from "discord.js";
import { createLogger } from "@20syldev/logger.ts";
import { client } from "./client.js";
import { createServer } from "./server.js";
import { commands, commandData } from "./commands/index.js";
import { onReady } from "./events/ready.js";

// Logger
const logger = createLogger({ theme: "colored" });
const discordLog = logger.group("discord");
const expressLog = logger.group("express");
const commandLog = logger.group("commands");

// Enregistrement des commandes slash
const rest = new REST({ version: "10" }).setToken(env.TOKEN);

(async () => {
    try {
        discordLog.log({ method: "PUT", url: "/commands", status: 102 });
        await rest.put(Routes.applicationGuildCommands(env.CLIENT_ID, env.GUILD_ID), { body: commandData });
        discordLog.log({ method: "PUT", url: "/commands", status: 200 });
    } catch {
        discordLog.log({ method: "PUT", url: "/commands", status: 500 });
    }
})();

// Event : bot prêt
client.on("clientReady", (readyClient) => onReady(readyClient, discordLog));

// Event : commandes
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, commandLog);
    } catch {
        commandLog.log({ method: "RUN", url: `/${interaction.commandName}`, status: 500 });
        const content = "Une erreur est survenue.";
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content });
        } else {
            await interaction.reply({ content, flags: 64 });
        }
    }
});

// Connexion
client.login(env.TOKEN);

const app = createServer(expressLog);
const port = Number(env.PORT) || 4000;
app.listen(port, () => expressLog.log({ method: "GET", url: "/", status: 200 }));

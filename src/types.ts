import type { ChatInputCommandInteraction, RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";
import type { SubLogger } from "@20syldev/logger.ts";

export interface Command {
    data: RESTPostAPIChatInputApplicationCommandsJSONBody;
    execute: (interaction: ChatInputCommandInteraction, logger: SubLogger) => Promise<void>;
}

export interface PlanningEvent {
    subject: string;
    type?: string;
    teacher?: string;
    classes?: string[];
    start: string;
    end: string;
}

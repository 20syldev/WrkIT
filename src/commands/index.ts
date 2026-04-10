import type { Command } from "../types.js";
import { command as embed } from "./embed.js";
import { command as eventAdd } from "./event-add.js";
import { command as eventEdit } from "./event-edit.js";
import { command as eventDelete } from "./event-delete.js";
import { command as clear } from "./clear.js";
import { command as planning } from "./planning.js";

const allCommands: Command[] = [embed, eventAdd, eventEdit, eventDelete, clear, planning];

export const commands = new Map<string, Command>(allCommands.map((cmd) => [cmd.data.name, cmd]));

export const commandData = allCommands.map((cmd) => cmd.data);

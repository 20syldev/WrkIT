import dotenv from "dotenv";
dotenv.config();

export interface Env {
    CLIENT_ID: string;
    TOKEN: string;
    GUILD_ID: string;
    ROLE_SLAM: string;
    ROLE_SISR: string;
    PLANNING_SLAM: string;
    PLANNING_SISR: string;
    PORT: string;
    PRODUCTION: string;
}

const required = [
    "CLIENT_ID",
    "TOKEN",
    "GUILD_ID",
    "ROLE_SLAM",
    "ROLE_SISR",
    "PLANNING_SLAM",
    "PLANNING_SISR",
] as const;

for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Variable d'environnement manquante : ${key}`);
    }
}

export const env: Env = {
    CLIENT_ID: process.env.CLIENT_ID!,
    TOKEN: process.env.TOKEN!,
    GUILD_ID: process.env.GUILD_ID!,
    ROLE_SLAM: process.env.ROLE_SLAM!,
    ROLE_SISR: process.env.ROLE_SISR!,
    PLANNING_SLAM: process.env.PLANNING_SLAM!,
    PLANNING_SISR: process.env.PLANNING_SISR!,
    PORT: process.env.PORT || "4000",
    PRODUCTION: process.env.PRODUCTION || "false",
};

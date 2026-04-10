import express from "express";
import path from "path";
import type { Request, Response, NextFunction } from "express";
import type { SubLogger } from "@20syldev/logger.ts";

const publicDir = path.resolve("public");

export function createServer(logger: SubLogger) {
    const app = express();

    app.use((req: Request, res: Response, next: NextFunction) => {
        const start = Date.now();
        res.on("finish", () => {
            logger.log({
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration: `${Date.now() - start}ms`,
            });
        });
        next();
    });

    app.use(express.static(publicDir));

    app.use((req: Request, res: Response) => res.status(500).sendFile(path.join(publicDir, "erreur.html")));

    app.get("/{*path}", (req: Request, res: Response) => res.sendFile(path.join(publicDir, "index.html")));

    return app;
}

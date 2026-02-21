import express from "express";
import cors from "cors";
import helmet from "helmet";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/error-handler.js";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/v1", apiRouter);
app.use(errorHandler);

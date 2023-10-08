import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRouter from "./Routers/authRouters.js";
import cashRouter from "./Routers/cashRouters.js";
import expiredToken from "./Controllers/expiredToken.js";

const app = express();

app.use(json());
app.use(cors());

// routes
app.use(authRouter);
app.use(cashRouter);

// setInterval(async () => {
//   await expiredToken();
// }, 15000);

app.listen(process.env.ACCESS_PORT);

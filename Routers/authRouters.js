import { Router } from "express";
import { signIn, signUp } from "./../Controllers/authControllers.js";
import { signInSchema, singUpSchema } from "../Middlewares/validateSchema.js";

const authRouter = Router();

authRouter.post("/sign-up", singUpSchema, signUp);

authRouter.post("/sign-in", signInSchema, signIn);

export default authRouter;

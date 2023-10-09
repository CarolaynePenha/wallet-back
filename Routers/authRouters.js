import { Router } from "express";
import { signIn, signUp } from "./../Controllers/authControllers.js";
import { signInSchema, singUpSchema } from "../Middlewares/validateSchema.js";
import { useRemain } from "../Controllers/expiredToken.js";

const authRouter = Router();

authRouter.post("/sign-up", singUpSchema, signUp);

authRouter.post("/sign-in", signInSchema, signIn);

authRouter.put("/user-remain", useRemain);

export default authRouter;

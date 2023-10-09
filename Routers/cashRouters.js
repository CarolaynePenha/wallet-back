import { Router } from "express";

import {
  cashIn,
  cashOut,
  deleteInfos,
  getInfos,
  updateInfos,
} from "../Controllers/cashControllers.js";
import {
  cashInOutSchema,
  updateCashSchema,
} from "../Middlewares/validateSchema.js";
import tokenValidation from "../Middlewares/tokenValidation.js";
import { validID } from "../Middlewares/ValidID.js";

const cashRouter = Router();

cashRouter.post("/cash-in", cashInOutSchema, tokenValidation, cashIn);
cashRouter.post("/cash-out", cashInOutSchema, tokenValidation, cashOut);

cashRouter.get("/cash", tokenValidation, getInfos);

cashRouter.delete("/cash/:id", tokenValidation, validID, deleteInfos);

cashRouter.put(
  "/cash/:id",
  updateCashSchema,
  tokenValidation,
  validID,
  updateInfos
);

export default cashRouter;

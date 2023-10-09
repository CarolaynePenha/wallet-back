import db from "../db.js";
import { ObjectId } from "mongodb";

export async function validID(req, res, next) {
  const { id } = req.params;
  const validID = await db
    .collection("cash")
    .findOne({ _id: new ObjectId(id) });
  if (!validID) {
    res.sendStatus(401);
    return;
  }
  res.locals.validID = validID;
  next();
}

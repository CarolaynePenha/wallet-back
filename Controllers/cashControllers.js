import dayjs from "dayjs";
import db from "../db.js";
import { ObjectId } from "mongodb";

export async function cashIn(req, res) {
  const cash = req.body;
  const session = res.locals.session;
  try {
    await db.collection("cash").insertOne({
      ...cash,
      userId: session.userId,
      status: "cash-in",
      date: dayjs().format("DD/MM/YYYY"),
    });
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

export async function cashOut(req, res) {
  const cash = req.body;
  try {
    const session = res.locals.session;
    await db.collection("cash").insertOne({
      ...cash,
      userId: session.userId,
      status: "cash-out",
      date: dayjs().format("DD/MM/YYYY"),
    });
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

export async function getInfos(req, res) {
  try {
    const session = res.locals.session;

    const infos = await db
      .collection("cash")
      .find({ userId: session.userId })
      .toArray();
    const infosUser = await db
      .collection("users")
      .findOne({ _id: session.userId });
    const name = infosUser.name;
    delete infos.userId;

    res.send({ infos, name });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

export async function deleteInfos(req, res) {
  const { id } = req.params;
  try {
    if (res.locals.validID) {
      await db.collection("cash").deleteOne({ _id: new ObjectId(id) });
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

export async function updateInfos(req, res) {
  const { id } = req.params;

  try {
    if (res.locals.validID) {
      await db
        .collection("cash")
        .updateOne({ _id: new ObjectId(id) }, { $set: req.body });
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

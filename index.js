import express, { json } from "express";
import joi from "joi";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import chalk from "chalk";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import dotenv from "dotenv";
dotenv.config();

import db from "./db.js";

const app = express();
app.use(json());
app.use(cors());

app.post("/sign-up", async (req, res) => {
  console.log(req.body);
  //name:, email:, password:, repeat_password:,
  const user = req.body;
  const userSchema = joi.object({
    name: joi.string().min(5).max(40).required(),
    email: joi
      .string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required(),
    password: joi
      .string()
      .pattern(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}/
      )
      .required(),
    repeat_password: joi.ref("password"),
  });

  const validation = userSchema.validate(user, { abortEarly: false });
  if (validation.error) {
    res.status(422).send(validation.error.details);
    return;
  }
  const passwordHash = bcrypt.hashSync(user.password, 10);
  try {
    const invalidEmail = await db
      .collection("users")
      .findOne({ email: user.email });
    if (invalidEmail) {
      res.status(409).send("email already exist");
      return;
    }
    await db.collection("users").insertOne({
      ...user,
      password: passwordHash,
      repeat_password: passwordHash,
    });
    res.status(201).send("user registered ");
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

//To Do: validation whith joi to body
app.post("/sign-in", async (req, res) => {
  //email:,  password:,
  const { password, email } = req.body;
  try {
    const user = await db.collection("users").findOne({ email });
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = uuid();
      const session = await db.collection("session").insertOne({
        userId: user._id,
        token,
      });
      res.send(token);
    } else {
      res.send("user not found").status(404);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
app.post("/cash-in", async (req, res) => {
  const cash = req.body;
  const { authorization } = req.headers;
  const cashSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().max(30).required(),
  });

  const validation = cashSchema.validate(cash, { abortEarly: false });
  if (validation.error) {
    res.status(422).send(validation.error.details);
    return;
  }
  const token = authorization?.replace("Bearer ", "").trim();

  if (!token) return res.sendStatus(401);
  try {
    const session = await db.collection("session").findOne({ token });
    if (!session) {
      res.sendStatus(401);
    }
    await db
      .collection("cash")
      .insertOne({ ...cash, userId: session.userId, status: "cash-in" });
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
app.post("/cash-out", async (req, res) => {
  const cash = req.body;
  const { authorization } = req.headers;
  const cashSchema = joi.object({
    value: joi.number().required(),
    description: joi.string().max(30).required(),
  });

  const validation = cashSchema.validate(cash, { abortEarly: false });
  if (validation.error) {
    res.status(422).send(validation.error.details);
    return;
  }
  const token = authorization?.replace("Bearer ", "").trim();

  if (!token) return res.sendStatus(401);
  try {
    const session = await db.collection("session").findOne({ token });
    if (!session) {
      res.sendStatus(401);
    }
    await db
      .collection("cash")
      .insertOne({ ...cash, userId: session.userId, status: "cash-out" });
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get("/cash", async (req, res) => {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "").trim();

  if (!token) return res.sendStatus(401);
  try {
    const session = await db.collection("session").findOne({ token });
    if (!session) {
      res.sendStatus(401);
    }
    const infos = await db
      .collection("cash")
      .find({ userId: session.userId })
      .toArray();
    console.log("infos: ", infos);
    res.send(infos);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.delete("/cash/:id", async (req, res) => {
  const { id } = req.params;
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "").trim();

  if (!token) return res.sendStatus(401);
  try {
    const session = await db.collection("session").findOne({ token });
    if (!session) {
      res.sendStatus(401);
    }
    const validID = await db
      .collection("cash")
      .findOne({ _id: new ObjectId(id) });
    if (validID) {
      await db.collection("cash").deleteOne({ _id: new ObjectId(id) });
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
//To Do: validation whith joi to body
app.put("/cash/:id", async (req, res) => {
  const { id } = req.params;
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "").trim();

  if (!token) return res.sendStatus(401);
  try {
    const session = await db.collection("session").findOne({ token });
    if (!session) {
      res.sendStatus(401);
    }
    const validID = await db
      .collection("cash")
      .findOne({ _id: new ObjectId(id) });
    if (validID) {
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
});

app.listen(process.env.ACCESS_PORT);

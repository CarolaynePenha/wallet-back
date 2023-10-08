import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import db from "./../db.js";

export async function signUp(req, res) {
  //name:, email:, password:, repeatPassword:,
  const user = req.body;

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
      repeatPassword: passwordHash,
    });
    res.status(201).send("user registered ");
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

export async function signIn(req, res) {
  const { password, email } = req.body;

  try {
    const user = await db.collection("users").findOne({ email });
    if (user && bcrypt.compareSync(password, user.password)) {
      const token = uuid();
      await db.collection("session").insertOne({
        userId: user._id,
        activeUser: Date.now(),
        token,
      });
      res.send({ token: token }).status(200);
    } else {
      res.send("user not found").status(404);
    }
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

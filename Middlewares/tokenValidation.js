import db from "../db.js";
export default async function tokenValidation(req, res, next) {
  const { authorization } = req.headers;
  console.log("authorization: ", authorization);
  const token = authorization?.replace("Bearer ", "").trim();

  if (!token) return res.sendStatus(401);
  try {
    const session = await db.collection("session").findOne({ token });
    res.locals.session = session;
    console.log("session: ", session);
    if (!session) {
      res.sendStatus(401);
    }
  } catch (err) {
    return res.sendStatus(500);
  }
  next();
}

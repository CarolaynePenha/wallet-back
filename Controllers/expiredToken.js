import db from "../db.js";

export default async function expiredToken() {
  try {
    const sessionCollection = db.collection("session");
    const sessions = await sessionCollection.find({}).toArray();

    if (sessions) {
      for (let i = 0; i < sessions.length; i++) {
        if (!sessions[i].invalidToken) {
          let date = Date.now();
          if (date - sessions[i].activeUser > 25000) {
            await sessionCollection.updateOne(
              { _id: sessions[i]._id },
              {
                $set: { invalidToken: sessions[i].token },
                $unset: { token: 1 },
              }
            );
          }
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

export async function useRemain(req, res) {
  const { authorization } = req.headers;
  const token = authorization?.replace("Bearer ", "").trim();
  try {
    await db
      .collection("session")
      .updateOne({ token }, { $set: { activeUser: Date.now() } });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}

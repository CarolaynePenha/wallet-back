import { MongoClient } from "mongodb";
import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();

let db = null;

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
  await mongoClient.connect();
  db = mongoClient.db(process.env.DATABASE);
  console.log(chalk.green.bold("Database is running"));
} catch (err) {
  console.log("Error connecting to database", err);
}

export default db;

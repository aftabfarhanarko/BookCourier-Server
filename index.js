import "dotenv/config"; 
import express from "express";
import cors from "cors";
const app = express();
const port = Number(process.env.START_PORT) || 5000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World start Book Library Server");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

import "dotenv/config";
import express from "express";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
const app = express();
const port = Number(process.env.START_PORT) || 5000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World start Book Library Server");
});

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
     const myDb = client.db("bookCourier");
     const bookCollections = myDb.collection("allBook")

     
     app.post("/book", async (req, res) => {
        const data = req.body;
        const result = await bookCollections.insertOne(data);
        res.status(200).send(result)
     })

     app.get("/allbooks", async (req,res) => {
        const result = await bookCollections.find().toArray();
        res.status(200).send(result)
     })

    // Send a ping to confirm a successful connection
    console.log(
      `Pinged your deployment. You successfully connected to MongoDB! Date ${new Date().toISOString()}`
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

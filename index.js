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
    const bookCollections = myDb.collection("allBook");
    const orderCollections = myDb.collection("customerOrder");

    //  ALl Libery Books Reletaed Rpis
    app.post("/book", async (req, res) => {
      const data = req.body;
      data.creatAt = new Date().toISOString();
      console.log(data);

      const result = await bookCollections.insertOne(data);
      res.status(200).send(result);
    });

    app.get("/allbooks", async (req, res) => {
      const { one, tow, limit, skip, search } = req.query;

      const query = {
        publisher: one,
        availability_status: tow,
      };

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }
      const result = await bookCollections
        .find(query)
        .project({
          image: 1,
          title: 1,
          price_mrp: 1,
          author: 1,
          language: 1,
          category: 1,
          publisher: 1,
          return_policy: 1,
          weight: 1,
          page_count: 1,
          rating_avg: 1,
        })
        .limit(Number(limit))
        .skip(Number(skip))
        .toArray();

      const counts = await bookCollections.countDocuments(query);

      res.status(200).send({ result, counts });
    });

    app.get("/oneBooks/:id", async (req, res) => {
      const { id } = req.params;
      const result = await bookCollections.findOne({ _id: new ObjectId(id) });
      res.send(result);
      console.log(id);
    });

    app.get("/catogryfinde", async (req, res) => {
      const { category } = req.query;
      console.log(category);

      const result = await bookCollections
        .find({ category: category })
        .toArray();
      res.send(result);
    });

    // Customer Order
    app.post("/ordernow", async (req, res) => {
      const data = req.body;
      data.ordered_Status = "pending";
      data.payment_status = "unpaid" 
      data.orderTime = new Date().toISOString();

      const result = await orderCollections.insertOne(data);
      res.send(result)
    });

    app.get("/orderlist", async (req,res) => {
      const {email} = req.query;
      console.log(email);
      
      const result = await orderCollections.find({email:email}).toArray();
      res.send(result)
    })

    app.delete("/deletbook/:id", async (req,res) => {
      const {id} = req.params;
      const result = await orderCollections.deleteOne({_id: new ObjectId(id)});
      res.send(result)
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

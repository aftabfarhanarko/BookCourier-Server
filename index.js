import "dotenv/config";
import express from "express";
import Stripe from "stripe";
import cors from "cors";
import crypto from "crypto";
import bcrypt from "bcrypt";
import admin from "firebase-admin";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
const port = Number(process.env.START_PORT) || 5000;
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, "base64").toString(
  "utf8"
);
const serviceAccount = JSON.parse(decoded);

app.use(express.json());
app.use(cors());

// Firebase Admin

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firebase MidelWear
const verifeyFirebase = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send({
      messsage: "Unauthorized Access",
    });
  }
  try {
    const isTokens = token.split(" ")[1];
    // console.log(isTokens);
    const verifey = await admin.auth().verifyIdToken(isTokens);
    // console.log("Thise ios midelwear",verifey.email);
    req.verifey_email = verifey?.email;
    next();
  } catch (err) {
    return res.status(401).send({
      message: "Unauthorized Access",
      err,
    });
  }
};

function generateTrackingId() {
  const prefix = "PRCL";
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();

  return `${prefix}-${date}-${random}`;
}

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
    const paymentCollections = myDb.collection("allpayment");
    const customerCollections = myDb.collection("customerData");

    // Role Api
    app.get("/role-findnow", async (req, res) => {
      const { email } = req.query;
      const result = await customerCollections.findOne({ email: email });
      // console.log(result.role);

      res.send(result.role);
    });

    // Admin Releted Api
    app.get("/alluser-data", verifeyFirebase, async (req, res) => {
      const { email } = req.query;
      console.log(email, req.verifey_email);

      if (email !== req.verifey_email) {
        return res.status(403).send({
          message: "Forbident Access",
        });
      }
      const result = await customerCollections.find().toArray();
      res.send(result);
    });
    // .(`userDelete/${id}
    app.delete("/userDelete/:id", async (req, res) => {
      const { id } = req.params;
      const result = await customerCollections.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.patch("/ubdetRoles/:id", async (req, res) => {
      const { id } = req.params;
      const { role } = req.body;

      const result = await customerCollections.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: { role },
        }
      );

      res.send(result);
    });

    app.get("/allbooks", async (req, res) => {
      // const { email } = req.query;
      // console.log(email, req.verifey_email);

      // if (email !== req.verifey_email) {
      //   return res.status(403).send({
      //     message: "Forbident Access",
      //   });
      // }
      const result = await bookCollections.find().toArray();
      res.send(result);
    });

    app.delete("/deletLiberyanBooks/:id", async (req, res) => {
      const { id } = req.params;
      const result = await bookCollections.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.get("/loginRealTimerUser", async (req, res) => {
      const { email } = req.query;
      // console.log(email);

      const result = await customerCollections.findOne({ email: email });
      // console.log(result);

      res.send(result);
    });

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

    app.get("/limetCard", async (req, res) => {
      const result = await bookCollections
        .find()
        .sort({ creatAt: 1 })
        .limit(6)
        .toArray();
      res.send(result);
    });

    app.get("/liberin-add-books", verifeyFirebase, async (req, res) => {
      const { email } = req.query;
      // console.log("this is midel Wear EMail", req.verifey_email, email);

      if (email !== req.verifey_email) {
        return res.status(403).send({
          message: "Forbident Access",
        });
      }
      const query = { "sellerInfo.sellerEmail": email };
      const result = await bookCollections.find(query).toArray();
      res.send(result);
    });

    app.get("/allcustomer-order", verifeyFirebase, async (req, res) => {
      const { email } = req.query;
      // console.log(email);
      if (email !== req.verifey_email) {
        return res.status(403).send({
          message: "Forbident Access",
        });
      }
      const result = await orderCollections.find().toArray();
      res.send(result);
    });

    app.patch("/updetOrder/:id", async (req, res) => {
      const { id } = req.params;
      const { status } = req.query;
      if (status === "delivered") {
        const orderDelivery = new Date().toISOString();
        // const resultnew = await
      }
      const seter = {
        $set: {
          ordered_Status: status,
        },
      };
      const result = await orderCollections.updateOne(
        { _id: new ObjectId(id) },
        seter
      );
      console.log(seter, id);
      res.send(result);
    });

    // Customer Order
    app.post("/ordernow", async (req, res) => {
      const trakingId = generateTrackingId();
      const data = req.body;
      data.ordered_Status = "pending";
      data.payment_status = "unpaid";
      data.trakingId = trakingId;
      data.orderTime = new Date().toISOString();

      const result = await orderCollections.insertOne(data);
      res.send(result);
    });

    app.get("/orderlist", verifeyFirebase, async (req, res) => {
      const { email } = req.query;
      // console.log(email, req.verifey_email);
      if (email !== req.verifey_email) {
        return res.status(403).send({
          message: "Forbident Access",
        });
      }

      const result = await orderCollections
        .find({ email: email })
        .sort({ orderTime: 1 })
        .toArray();
      res.send(result);
    });

    app.delete("/deletbook/:id", async (req, res) => {
      const { id } = req.params;
      const result = await orderCollections.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.post("/ucustomer", async (req, res) => {
      const { email, displayName, photoURL, password } = req.body;
      const isExgiesed = await customerCollections.findOne({ email: email });
      if (isExgiesed) {
        return res.send({
          messsage: "All Ready User Data Saved Data Base",
          isExgiesed,
        });
      }
      const hashPassword = await bcrypt.hash(password, 10);
      const result = await customerCollections.insertOne({
        email,
        displayName,
        photoURL,
        hashPassword,
        role: "user",
        crestAt: new Date().toISOString(),
      });
      // console.log(email, password, displayName, photoURL);

      res.send(result);
    });

    // Payment Releted Api Creat
    app.post("/creat-payment-session", async (req, res) => {
      const pymentInfo = req.body;
      console.log(pymentInfo);

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: pymentInfo?.bookTitle,
                images: [pymentInfo?.bookImage],
              },
              unit_amount: Number(pymentInfo?.bookPrice) * 100,
            },
            quantity: 1,
          },
        ],
        customer_email: pymentInfo?.customerEmail,
        mode: "payment",
        metadata: {
          bookName: pymentInfo?.bookTitle,
          bookId: pymentInfo?.bookID,
          email: pymentInfo?.customerEmail,
          trakingId: pymentInfo?.trakingId,
          amount: pymentInfo?.bookPrice,
        },

        success_url: `${process.env.URL}/deshbord/pymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.URL}/deshbord/userorder`,
      });

      res.send({ url: session.url });
    });
    app.patch("/success-payment", async (req, res) => {
      const { sessionID } = req.query;
      console.log(sessionID);
      const seccion = await stripe.checkout.sessions.retrieve(sessionID);
      console.log(seccion);
      if (seccion.payment_status) {
        const trakingId = seccion.metadata.trakingId;

        const transactionId = seccion.payment_intent;
        const query2 = { transactionId: transactionId };

        const isExgisted = await paymentCollections.findOne(query2);
        if (isExgisted) {
          return res.send({
            messsage: "All Ready Payment Successfully",
            trakingId,
            transactionId,
            amount: seccion.amount_total / 100,
            email: seccion.customer_email,
            method: seccion.payment_method_types?.[0] || "card",
          });
        }

        const id = seccion.metadata.bookId;
        const seter = {
          $set: {
            payment_status: "paid",
          },
        };

        const updetOrderCollections = await orderCollections.updateOne(
          { _id: new ObjectId(id) },
          seter
        );

        const paymentSuccessInfo = {
          amount: seccion.amount_total / 100,
          currency: seccion.currency,
          customerEmail: seccion.customer_email,
          bookId: seccion.metadata.bookId,
          bookName: seccion.metadata.bookName,
          transactionId: seccion.payment_intent,
          paymentStatus: seccion.payment_status,
          paidAt: new Date(),
          trakingId: trakingId,
        };

        if (seccion.payment_status === "paid") {
          const result = await paymentCollections.insertOne(paymentSuccessInfo);
          console.log(result);

          res.send({
            modifyBook: result,
            paymentInfo: paymentSuccessInfo,
            trakingId: trakingId,
            transactionId: seccion.payment_intent,
            amount: seccion.amount_total / 100,
            email: seccion.customer_email,
            method: seccion.payment_method_types?.[0] || "card",
            success: true,
          });
        }
      }
    });

    app.get("/paymentChack", verifeyFirebase, async (req, res) => {
      const { email } = req.query;
      // console.log(email);
      if (email !== req.verifey_email) {
        return res.status(403).send({
          message: "Forbident Access",
        });
      }
      const result = await paymentCollections
        .find({ customerEmail: email })
        .toArray();
      res.send(result);
    });

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

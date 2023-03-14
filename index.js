const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());

//mongodb connection code
// DB_USER="tweetingSystemApp"
// DB_PASSWORD="UT6iPiS6WgI3xn7V"

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jz1qjld.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function run() {
  try {
    const usersCollection = client
      .db("tweetingSystemApp")
      .collection("allUsers");

    const tweetsCollection = client
      .db("tweetingSystemApp")
      .collection(allTweets);

    //midleware for verify admin to avoiding code repet

    // Note: make sure that you will run verifyAdmin function after verify JWT Function

    // const verifyAdmin = async (req, res, next) => {
    //   const decodedEmail = req.decoded.email;
    //   const query = { email: decodedEmail };
    //   const user = await usersCollection.findOne(query);
    //   if (user?.role !== "admin") {
    //     return res.status(403).send("forbidden Access");
    //   }
    //   next();
    // };

    //post api for collecting user email with info

    app.post("/tweet", (req, res) => {
      const user = req.body;
      const result = tweetsCollection.insertOne(user);
      res.send(result);
    });

    //get api for getting products collection

    app.get("/all-tweets", async (req, res) => {
      const query = {};
      const result = await tweetsCollection.find(query).toArray();
      res.send(result);
    });

    //post api for all products db
    app.post("/tweets-collection", async (req, res) => {
      const product = req.body;
      const result = await tweetsCollection.insertOne(product);
      res.send(result);
    });
    //post api for user collection
    app.post("/users-collection", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    // <==============all api for dashboard===========>

    //get api for all sellers

    // app.get("/user", verifyJWT, verifyAdmin, async (req, res) => {
    //   const query = { type: "user" };
    //   const sellers = await usersCollection.find(query).toArray();
    //   res.send(sellers);
    //   // console.log(sellers);
    // });

    //get api for picking admin user
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });
    //get api for getting user info
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    //get api for buyers products
    app.get("/users-tweet", async (req, res) => {
      const email = req.query.email;
      const query = {
        email: email,
      };
      const mytweets = await tweetsCollection.find(query).toArray();
      res.send(mytweets);
    });

    //get  booking info by id
    app.get("/tweet/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await tweetsCollection.findOne(query);
      res.send(result);
    }),
      //delete products from booking
      app.delete("/tweet/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const result = await tweetsCollection.deleteOne(filter);

        res.send(result);
      }),
      //user reaction api for tweet
      app.put("/all-tweets/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            react: "love",
          },
        };
        const result = await tweetsCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send(result);
      });
  } catch {
    (err) => console.log(err);
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("tweeting system app is running");
});

app.listen(port, () => {
  console.log(`tweeting system app is running on port ${port}`);
});

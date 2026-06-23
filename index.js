const express = require("express");
require('dotenv').config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())




const uri = `mongodb://${process.env.studyNookUser}:${process.env.studyNookPas}@ac-tpozc4y-shard-00-00.1iw4tru.mongodb.net:27017,ac-tpozc4y-shard-00-01.1iw4tru.mongodb.net:27017,ac-tpozc4y-shard-00-02.1iw4tru.mongodb.net:27017/?replicaSet=atlas-a678oh-shard-0&ssl=true&authSource=admin`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("studynookDb");
    const roomsCollection = database.collection("rooms");
    const bookingCollection = database.collection("bookings");

    //add room related api
    app.get("/rooms", async (req, res) => {
      const {
        search = "",
        minPrice,
        maxPrice,
        amenities,
      } = req.query;
      let query = {};

      if (search) {
        query.roomName = {
          $regex: search,
          $options: "i",
        };
      }

      if (minPrice || maxPrice) {
        query.hourlyRate = {};

        if (minPrice) {
          query.hourlyRate.$gte = Number(minPrice);
        }

        if (maxPrice) {
          query.hourlyRate.$lte = Number(maxPrice);
        }
      }
      if (amenities) {
        query.amenities = {
          $all: amenities.split(","),
        };
      }

      const result = await roomsCollection
        .find(query)
        .limit(12)
        .toArray();
      res.send(result);
    });

    app.get("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const room = await roomsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(room);
    });

    app.delete("/rooms/:id", async (req, res) => {
      const id = req.params.id;
      const result = await roomsCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });


    app.post("/rooms", async (req, res) => {
      try {
        const roomData = req.body;
        roomData.createdAt = new Date();
        const result = await roomsCollection.insertOne(roomData);
        res.status(201).send({
          success: true,
          message: "Room Added Successfully",
          insertedId: result.insertedId,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    });

    //booking related api 

    app.get("/booking/:userId", async (req, res) => {
      try {
        const userId = req.params.userId;
        const result = await bookingCollection
          .find({ userId }).sort({ createdAt: -1 }).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    });
    app.post("/booking", async (req, res) => {
      try {
        const bookingInfo = req.body;
        bookingInfo.createdAt =
          new Date();
        const result = await bookingCollection.insertOne(bookingInfo);
        res.send({
          success: true,
          insertedId:
            result.insertedId,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    });

    // featured related api 
    app.get("/features", async (req, res) => {
      const result = await roomsCollection
        .find()
        .sort({ _id: -1 })
        .limit(6)
        .toArray();

      res.send(result);
    });







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Hello Studynook server!');
});

app.listen(PORT, () => {
  console.log(`Studynook server running on port ${PORT}`);
});
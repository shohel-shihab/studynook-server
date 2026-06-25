const express = require("express");
require('dotenv').config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
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

const JWKS = createRemoteJWKSet(
  new URL("http://localhost:3000/api/auth/jwks")
)

const verifyToken = async(req, res, next) => {
  const authHeader = req?.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  const token = authHeader.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }
  try {
    const { payload } = await jwtVerify(token, JWKS)
    console.log(payload)
     next()
  }
  catch (error) {
    return res.status(403).json({ message: "Forbidden" })

  }


 

}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("studynookDb");
    const roomsCollection = database.collection("rooms");
    const bookingCollection = database.collection("bookings");

    //add room related api
    app.get("/rooms", async (req, res) => {
      try {
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

          if (minPrice)
            query.hourlyRate.$gte = Number(minPrice);

          if (maxPrice)
            query.hourlyRate.$lte = Number(maxPrice);
        }

        if (amenities) {
          query.amenities = {
            $all: amenities.split(","),
          };
        }

        const rooms = await roomsCollection
          .find(query)
          .sort({ _id: -1 })
          .toArray();

        res.send(rooms);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    });
    app.get("/rooms/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const room = await roomsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(room);
    });


    app.put("/rooms/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const updatedData = req.body;

        const room = await roomsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!room) {
          return res.status(404).send({
            success: false,
            message: "Room not found",
          });
        }

        // Verify owner
        if (room.ownerId !== updatedData.userId) {
          return res.status(403).send({
            success: false,
            message: "Unauthorized",
          });
        }

        delete updatedData.userId;

        const result = await roomsCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: updatedData,
          }
        );

        res.send({
          success: true,
          modifiedCount: result.modifiedCount,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    });


    app.delete("/rooms/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { userId } = req.body;

        const room = await roomsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!room) {
          return res.status(404).send({
            success: false,
            message: "Room not found",
          });
        }

        if (room.ownerId !== userId) {
          return res.status(403).send({
            success: false,
            message: "Unauthorized access",
          });
        }

        const result = await roomsCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.send({
          success: true,
          deletedCount: result.deletedCount,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    });




    app.get("/my-bookings/:userId", async (req, res) => {
      try {
        const { userId } = req.params;

        const bookings =
          await bookingCollection
            .find({ userId })
            .sort({ createdAt: -1 })
            .toArray();

        const bookingsWithRooms =
          await Promise.all(
            bookings.map(async (booking) => {
              const room =
                await roomsCollection.findOne({
                  _id: new ObjectId(
                    booking.roomId
                  ),
                });

              return {
                ...booking,
                roomImage:
                  room?.image || "",
                roomName:
                  room?.roomName ||
                  booking.roomName,
              };
            })
          );

        res.send(bookingsWithRooms);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    });

    app.patch(
      "/bookings/:id/cancel",
      async (req, res) => {
        try {
          const { id } = req.params;

          const booking =
            await bookingCollection.findOne({
              _id: new ObjectId(id),
            });

          if (!booking) {
            return res.status(404).send({
              success: false,
              message: "Booking not found",
            });
          }

          const result =
            await bookingCollection.updateOne(
              {
                _id: new ObjectId(id),
              },
              {
                $set: {
                  status: "cancelled",
                },
              }
            );

          // decrease booking count
          await roomsCollection.updateOne(
            {
              _id: new ObjectId(
                booking.roomId
              ),
            },
            {
              $inc: {
                bookingCount: -1,
              },
            }
          );

          res.send({
            success: true,
            modifiedCount:
              result.modifiedCount,
          });
        } catch (error) {
          res.status(500).send({
            success: false,
            message: error.message,
          });
        }
      }
    );


    app.post("/bookings", async (req, res) => {
      try {
        const bookingInfo = req.body;

        const {
          roomId,
          date,
          startTime,
          endTime,
        } = bookingInfo;

        // Check conflict
        const conflict =
          await bookingCollection.findOne({
            roomId,
            date,
            status: "confirmed",

            startTime: {
              $lt: endTime,
            },

            endTime: {
              $gt: startTime,
            },
          });

        if (conflict) {
          return res.status(400).send({
            success: false,
            message:
              "This time slot is already booked",
          });
        }

        bookingInfo.status =
          "confirmed";

        bookingInfo.createdAt =
          new Date();

        const result =
          await bookingCollection.insertOne(
            bookingInfo
          );

        // Increment booking count
        await roomsCollection.updateOne(
          {
            _id: new ObjectId(roomId),
          },
          {
            $inc: {
              bookingCount: 1,
            },
          }
        );

        res.send({
          success: true,
          insertedId:
            result.insertedId,
          message:
            "Room booked successfully",
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
    });

    // featured related api 
    app.get("/featured-rooms", async (req, res) => {
      try {
        const rooms =
          await roomsCollection
            .find()
            .sort({ createdAt: -1 })
            .limit(6)
            .toArray();

        res.send(rooms);
      } catch (error) {
        res.status(500).send({
          success: false,
          message: error.message,
        });
      }
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
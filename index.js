const express = require("express");
const app = express();
const port = process.env.PORT || 5001;
const cors = require("cors");
const bodyParser = require("body-parser");
const { ServerApiVersion, ObjectId } = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ozftyhw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    client.connect().then((err) => {
      console.log("hi");
      const productCollections = client
        .db(`${process.env.DB_NAME}`)
        .collection(`${process.env.DB_COLLECTION}`);
      const orderCollections = client
        .db(`${process.env.DB_NAME}`)
        .collection(`${process.env.BUYER_COLLECTION}`);

      app.post("/addProductInDatabase", async (req, res) => {
        try {
          const result = await productCollections.insertOne(req.body);
          res.status(200).send(result.acknowledged);
        } catch (error) {
          res.status(500).send("Internal Server Error");
        }
      });

      app.post("/orderItem", (req, res) => {
        orderCollections.insertOne(req.body).then((result) => {
          res.send(result.insertedCount > 0);
        });
      });

      app.get("/allProduct", async (req, res) => {
        try {
          const result = await productCollections.find({}).toArray();
          res.status(200).send(result);
        } catch (error) {
          res.status(500).send("Internal Server Error");
        }
      });
      app.get("/userOrder", async (req, res) => {
        try {
          const result = await orderCollections
            .find({ email: req.query.email })
            .toArray();
          res.status(200).send(result);
        } catch (error) {
          res.status(500).send("Internal Server Error");
        }
      });

      app.get("/checkoutProduct/:id", async (req, res) => {
        try {
          const result = await productCollections
            .find({ _id: new ObjectId(req.params.id) })
            .toArray();
          res.status(200).send(result[0]);
        } catch (error) {
          res.status(500).send("Internal Server Error");
        }
      });

      app.delete("/deleteProduct/:id", async (req, res) => {
        try {
          const result = await productCollections.deleteOne({
            _id: new ObjectId(req.params.id),
          });
          res.status(200).send(result.acknowledged);
        } catch (error) {
          res.status(500).send("Internal Server Error");
        }
      });

      app.delete("/deleteOrder/:id", async (req, res) => {
        try {
          const result = await orderCollections.deleteOne({
            _id: new ObjectId(req.params.id),
          });
          res.status(200).send(result.acknowledged);
        } catch (error) {
          res.status(500).send("Internal Server Error");
        }
      });
      //   client.close();
    });
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
app.get("/", (req, res) => {
  res.send("Hello World!");
});
run().catch(console.dir);
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

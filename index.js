const express = require("express");
const app = express();
const port = process.env.PORT || 5001;
const cors = require("cors");
const bodyParser = require("body-parser");
const { ServerApiVersion } = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
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

      app.get("/allProduct", (req, res) => {
        productCollections.find({}).toArray((err, document) => {
          res.send(document);
        });
      });
      app.get("/userOrder", (req, res) => {
        orderCollections
          .find({ email: req.query.email })
          .toArray((err, document) => {
            res.send(document);
          });
      });

      app.get("/checkoutProduct/:id", (req, res) => {
        productCollections
          .find({ _id: ObjectId(req.params.id) })
          .toArray((err, document) => {
            res.send(document[0]);
          });
      });

      app.delete("/deleteProduct/:id", (req, res) => {
        productCollections
          .deleteOne({
            _id: ObjectId(req.params.id),
          })
          .then((result) => {
            res.send(result.deletedCount > 0);
          });
      });

      app.delete("/deleteOrder/:id", (req, res) => {
        orderCollections
          .deleteOne({
            _id: ObjectId(req.params.id),
          })
          .then((result) => {
            res.send(result.deletedCount > 0);
          });
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

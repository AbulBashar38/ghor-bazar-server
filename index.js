const express = require('express')
const app = express()
const port = process.env.PORT||5000
const cors = require('cors')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rdsgc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productCollections = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION}`);
  app.post('/addProductInDatabase',(req,res)=>{
    productCollections.insertOne(req.body)
    .then(result=>{
      res.send(result.insertedCount>0)
    })
  })
//   client.close();
});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

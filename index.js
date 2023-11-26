const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174",],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}));
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4hda1bm.mongodb.net/?retryWrites=true&w=majority`;
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

    const BannerCollection = client.db("DiagnosticDB").collection("Banner");
    const TestCollection = client.db("DiagnosticDB").collection("Test");


    app.get('/banner', async (req, res) => {
      const result = await BannerCollection.find().toArray();
      res.send(result);
    })

    // test 
    app.get('/test', async (req, res) => {
      const result = await TestCollection.find().toArray();
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.get('/health', (req, res) => {
  res.send('Diagnostic Server is Running')
})

app.listen(port, () => {
  console.log(`Diagnostic Server is Running on port ${port}`);
})
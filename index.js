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


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const UsersCollection = client.db("DiagnosticDB").collection("Users");
    const PersonalizedCollection = client.db("DiagnosticDB").collection("Recommendations");

    // user related
    app.get("/users", async (req, res) => {
      const result = await UsersCollection.find().toArray();
      res.send(result);
    })
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await UsersCollection.find(query).toArray();
      res.send(result);
    })


    app.post("/users", async (req, res) => {
      const user = req.body;
      // for checking if the user is new or not
      const query = { email: user.email };
      const existingUser = await UsersCollection.find(query).toArray();

      // console.log(existingUser);
      if (existingUser.length > 0) {
        return res.send({ message: "user ALready Exist ", insertedId: null })
      }
      const result = await UsersCollection.insertOne(user)
      res.send(result);
    })
    // delete user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await UsersCollection.deleteOne(query);
      res.send(result);
    })



    // test 
    app.get('/test', async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      console.log(page, size)
      const result = await TestCollection.find()
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    })
    // testCOunt for pagination
    app.get("/testCount", async (req, res) => {

      const count = await TestCollection.estimatedDocumentCount();
      res.send({ count });

    })

    // Recommendation
    app.get('/recommendations', async (req, res) => {
      const result = await PersonalizedCollection.find().toArray();
      res.send(result);
    })
    // banner
    app.get('/banner', async (req, res) => {
      const result = await BannerCollection.find().toArray();
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
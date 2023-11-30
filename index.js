const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174",],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
}));
app.use(express.json());






// jwt related 

app.post("/jwt", async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
  res.send({ token });
})











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
    const PaymentCollection = client.db("DiagnosticDB").collection("Payments");

    // verify

    const verifyToken = (req, res, next) => {
      // console.log("checking inside the verify token", req.headers.authorization);

      if (!req.headers.authorization) {
        return res.status(401).send({ message: "Unauthorized Access" })
      }
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
        if (err) {
          0
          return res.status(401).send({ message: " Unauthorized Access" })
        }
        req.decode = decode;
        next();
      })
    }


    // verify admin

    const verifyAdmin = async (req, res, next) => {
      const email = req.decode.email;
      console.log("check admin verify", email)
      const query = { email: email };
      const user = await UsersCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      next();
    }


    // user related
    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      const result = await UsersCollection.find().toArray();
      res.send(result);
    })
    app.get("/users/:email", async (req, res) => {
      const email = { email: req.params.email }
      console.log("Alada email er data", email)
      const result = await UsersCollection.find(email).toArray();
      res.send(result);
    })

    app.get("/users/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await UsersCollection.find(query).toArray();
      res.send(result);
    })

    // user admin

    app.get("/users/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      console.log("admin check", email)
      if (email !== req.decode.email) {
        return res.status(403).send({ message: "Forbidden Access" })
      }

      const query = { email: email };
      const user = await UsersCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin"
      }
      res.send({ admin });
    })


    app.post("/users", async (req, res) => {
      const user = req.body;
      // for checking if the user is new or not
      const query = { email: user.email };
      const existingUser = await UsersCollection.find(query).toArray();
      if (existingUser.length > 0) {
        return res.send({ message: "user ALready Exist ", insertedId: null })
      }
      const result = await UsersCollection.insertOne(user)
      res.send(result);
    })
    // make admin
    app.patch("/users/admin/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin"
        }
      }
      const result = await UsersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })
    // // user status
    app.patch("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
      const userStatus = req.body.block;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          Status: userStatus
        }
      }
      console.log("found from in the admin patch 167 ", userStatus, updateDoc, filter);
      const result = await UsersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })
    // edit user
    app.patch("/users/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const UpdateUser = req.body;
      const updateDoc = {
        $set: {
          Name: UpdateUser.Name,
          District: UpdateUser.District,
          Upazila: UpdateUser.Upazila,
          bloodGroup: UpdateUser.bloodGroup,
          photo: UpdateUser.photo,
          phone: UpdateUser.phone,
        }
      }
      console.log(updateDoc);
      const result = await UsersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })



    // delete user
    app.delete("/users/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await UsersCollection.deleteOne(query);
      res.send(result);
    })



    // test 




    app.get('/test', async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const result = await TestCollection.find()
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    })
    app.get("/test/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await TestCollection.find(query).toArray();
      res.send(result);
    })
    app.post("/test", async (req, res) => {
      const NewTest = req.body;
      console.log(NewTest)
      const result = await TestCollection.insertOne(NewTest);
      res.send(result);
    })

    app.patch("/test/:id", verifyToken, verifyAdmin, async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          title: item.title,
          shortDescription: item.shortDescription,
          description: item.description,
          image: item.image,
          availableDates: item.availableDates,
          time: item.time,
          price: item.price,
          availableSlot: item.availableSlot,
          featured: item.featured,
        }
      }
      console.log(filter, updatedDoc)
      const result = await TestCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })

    app.delete("/test/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await TestCollection.deleteOne(query);
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
    app.post("/banner", async (req, res) => {
      const NewBanner = req.body;
      console.log(NewBanner)
      const result = await BannerCollection.insertOne(NewBanner);
      res.send(result);
    })
    app.get('/banner', async (req, res) => {
      const result = await BannerCollection.find().toArray();
      res.send(result);
    })
    app.get("/banner/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await BannerCollection.find(query).toArray();
      res.send(result);
    })
    app.patch("/banner/:id", async (req, res) => {
      const isActive = req.body.isActive;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          isActive: isActive,
        }
      }
      // console.log(isActive, filter, updatedDoc)
      const result = await BannerCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })
    app.delete("/banner/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await BannerCollection.deleteOne(query);
      res.send(result);
    })



    // payment intent
    app.post(`/create-payment-intent`, async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);

      console.log("Checking", amount)

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"]

      });
      res.send({
        clientSecret: paymentIntent.client_secret
      })

    })


    // payment post

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const result = await PaymentCollection.insertOne(payment);
      // carefully delete each item form the cart
      console.log("payments info", payment);
      res.send(result);
    })


    app.get('/payments/:email', verifyToken, async (req, res) => {

      const paymentEmail = req.params.email;

      // Ensure the Payment collection includes the user's email
      const query = { email: paymentEmail };

      // Find payments in the Payment collection for the specified user
      const payments = await PaymentCollection.find(query).toArray();
      console.log(payments)
      res.send(payments)
    });

    app.get('/payments', verifyToken, verifyAdmin, async (req, res) => {
      const payments = await PaymentCollection.find().toArray();
      // console.log(payments)
      res.send(payments)
    });

    // Submit Test
    app.patch("/payments/:id", verifyToken, verifyAdmin, async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          submitDate: item.submitDate,
          condition: item.condition,
          links: item.links,
          status: item.status,
        }
      }
      console.log("Found for admin submit", item, filter, updatedDoc)
      const result = await PaymentCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })
    // Cancel Booking

    app.patch("/payments/:id", verifyToken, async (req, res) => {
      const Status = req.body.cancelBooking;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: Status,
        }
      }
      console.log(Status, filter, updatedDoc)
      const result = await PaymentCollection.updateOne(filter, updatedDoc)
      res.send(result);
    })
    // payments delete

    app.delete("/payments/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await PaymentCollection.deleteOne(query);
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
const express = require("express");
const applyMiddleWare = require("./middleware/ApplyMiddleWare");
const connectDb = require("./DataBase/ConnectDB");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;



const authnticationRoutes = require("./routes/Authentecation");

applyMiddleWare(app);
app.use(authnticationRoutes)




app.get("/health", (req, res) => {
    res.send("Diagnostic Server is Running");
});

app.all("*", (req, res, next) => {
    const error = new Error(`Can't find ${req.originalUrl} on the server`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        message: err.message,
    });
});


const main = async () => {
    await connectDb()
    app.listen(port, () => {
        console.log(`Diagnostic Server is Running on port ${port}`);
    })
}

main();
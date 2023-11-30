const { default: mongoose } = require("mongoose");

const getConnectionString = () => {
    let connectionURI;
    if (process.env.NODE_ENV = "development") {
        connectionURI = process.env.DB_LOCAL;
        connectionURI = connectionURI.replace("<username>", process.env.DB_USER);
        connectionURI = connectionURI.replace("<password>", process.env.DB_PASS);
    }
    else {
        connectionURI = process.env.DB_PRODUCTION;
    }
    return connectionURI;
}

const ConnectDB = async () => {
    console.log("connecting to DB")
    const uri = getConnectionString();
    await mongoose.connect(uri, { dbName: process.env.DB_NAME })
    console.log("Connected To MongoDb")
}
module.exports = ConnectDB;
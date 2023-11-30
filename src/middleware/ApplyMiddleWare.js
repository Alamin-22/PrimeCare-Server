const cors = require("cors");
const express = require("express");


const applyMiddleware = (app) => {

    app.use(cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174",
            "https://assignment12-bd75a.web.app",
            "https://assignment12-bd75a.firebaseapp.com",
        ],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        credentials: true,
    }));
    app.use(express.json());

}

module.exports = applyMiddleware;


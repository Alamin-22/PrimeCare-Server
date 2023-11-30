const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
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

module.exports = verifyToken;
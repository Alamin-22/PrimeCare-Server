const express = require('express');
const createToken = require("../Authentication/createToken");
const router = require("express").Router();





router.post("/jwt", createToken)

module.exports = router;



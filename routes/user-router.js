const express = require('express');
const router = new express.Router();
const User = require('../models/users-model');
const jwt = require("jsonwebtoken");
const moment = require("moment");
const HttpStatus = require('http-status-codes');

const authenticate = require('../middleware/auth')

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.newAuthToken()
    res.status(201).send()
  } catch (e) {
    //console.log('error: ', e);
    let details = [];
    for (const key in e.errors) {
      details.push(
        {
          "message": `'${key}' field is required`,
          "path": [`${key}`],
          "value": null
        }
      )
    }

    let error = {
      code: "ERR_VALIDATION",
      message: "Validation failed",
      details: details
    };

    res.status(400).send(error)
  }
})

router.get('/users', authenticate, async (req, res) => {
  const users = await User.find();
  res.send(users);
})

router.post('/authenticate', async (req, res) => {
  try {
    const user = await User.checkValidCredentials(req.body.username, req.body.password)
    const token = await user.newAuthToken()
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    res.send({ "authToken": token, "expiresIn": moment.unix(decoded.exp) })
  } catch (error) {
    //console.log(error);
    res.status(HttpStatus.UNAUTHORIZED).send({ code: "ERR_UNATHORIZED", message: "No auth token provided" })
  }
})

router.post('/users/logout', authenticate, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
    res.send()
  } catch (error) {
    res.status(500).send()
  }
})

module.exports = router
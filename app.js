require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
require('./db/mongoose');

const userRoutes = require('./routes/user-router');
const paymentRoutes = require('./routes/payment-router');

const app = express();
const port = process.env.PORT || 3000

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const apiVersion = "/v1";
app.use(apiVersion, userRoutes);
app.use(apiVersion, paymentRoutes);

app.get('/', (req, res) => {
  res.json({ "tutorial": "Build REST API with node.js" });
});

app.listen(port,() =>{
  console.log('Server is running on port: ', port);
})
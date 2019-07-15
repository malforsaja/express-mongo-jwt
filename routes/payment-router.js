const express = require('express');
const router = new express.Router();
const Payment = require('../models/payments-model');
const HttpStatus = require('http-status-codes');
const authenticate = require('../middleware/auth');
const User = require('../models/users-model');

router.post('/payments', authenticate, async (req, res) => {
  const payment = new Payment(req.body)
  try {
    await payment.save()

    res.status(HttpStatus.CREATED).send(payment.transform())
  } catch (e) {
    //console.log(error);
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

router.get('/payments', async (req, res) => {
  try {
    let payments = await Payment.find({})
    let allpayments = payments.map(payment => payment.transform())
    res.send(allpayments)
  } catch (error) {
    //console.log(error);
    res.status(500).send()
  }
})

router.get('/payment/:id', authenticate, async (req, res) => {
  let _id = req.params.id

  try {
    const payment = await Payment.findOne({ _id })
    if (!payment) {
      return res.status(404).send()
    }
    res.send(payment.transform());
  } catch (error) {
    //console.log(error);
    res.status(500).send()
  }
})

// Approve payment
router.put('/payments/:id/approve', authenticate, async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
    const checkPayment = await Payment.findOne({ _id: req.params.id, status: { $ne: "approved" } })
    if (!checkPayment) {
      return res.status(HttpStatus.NOT_FOUND).send({
        code: "ERR_FINDING",
        message: "Cannot find the payment that you have specified!"
      });
    }

    if (checkPayment.status === "canceled") {
      return res.status(400).send({
        code: "ERR_CANNOT_APPROVE",
        message: "Cannot approve a payment that has already been cancelled"
      })
    }

    await Payment.updateOne({ _id: req.params.id }, { $set: { status: "approved" } })
    await User.updateOne({ _id: checkPayment.payeeId }, { $inc: { account: checkPayment.amount } });
    await User.updateOne({ _id: checkPayment.payerId }, { $inc: { account: -checkPayment.amount } });
    res.status(HttpStatus.OK).send();
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
  }
})

// Cancel payment
router.put('/payments/:id/cancel', async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(HttpStatus.BAD_REQUEST).send();
    }
    const checkPayment = await Payment.findOne({ _id: req.params.id, status: { $ne: "canceled" } })
    if (!checkPayment) {
      return res.status(HttpStatus.NOT_FOUND).send({
        code: "ERR_FINDING",
        message: "Cannot find the payment that you have specified!"
      });
    }

    if (checkPayment.status === "approved") {
      return res.status(400).send({
        code: "ERR_CANNOT_CANCEL",
        message: "Cannot cancel a payment that has already been approved"
      })
    }

    await Payment.updateOne({ _id: req.params.id }, { $set: { status: "canceled" } })
    res.status(HttpStatus.OK).send();
  } catch (error) {
    //console.log(error);
    res.status(500).send()
  }
})

module.exports = router
const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const PaymentSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  payeeId: {
    type: String,
    required: true,
  },
  payerId: {
    type: String,
    required: true,
  },
  paymentSystem: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "created"
  },
  comment: {
    type: String,
    required: true,
  }
},
  {
    timestamps: true,
    versionKey: false
  }
);

// transform the payment response
PaymentSchema.method('transform', function() {
  let payment = this.toObject();

  //Rename fields
  payment.id = payment._id;
  delete payment._id;

  return payment;
});

const Payment = mongoose.model('Payment', PaymentSchema);

module.exports = Payment
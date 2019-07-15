const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const uuidv4 = require('uuid/v4');

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: uuidv4
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid!')
      }
    }

  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
    validate(value) {
      if (validator.isEmpty(value)) {
        throw new Error('Please enter your password!')
      }
    }
  },
  account: {
    type: Number,
    required: true,
    default: 10000
  },
  tokens: [{
    token: {
      type: String
    }
  }]
},
  {
    timestamps: true,
    versionKey: false
  }
);

UserSchema.statics.checkValidCredentials = async (username, password) => {
  if (!username || !password) {
    throw new Error('Please provide username and password!')
  }
  const user = await User.findOne({ username })

  if (!user) {
    throw new Error('User not found')
  }
  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error('Password does not match')
  }

  return user
}

UserSchema.methods.newAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET, { expiresIn: "2 days" });
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
}

UserSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

const User = mongoose.model('User', UserSchema);

module.exports = User;
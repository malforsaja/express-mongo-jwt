const mongoose = require('mongoose');

/* mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useCreateIndex: true
}).then(() => {
  console.log('Connected to database');
}).catch(() => {
  console.log('Failed to connect with database');
}); */

const connectDb = () => {
  mongoose.set('useCreateIndex', true);
  return mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
};

module.exports = connectDb;
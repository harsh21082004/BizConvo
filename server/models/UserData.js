const mongoose = require('mongoose');

const UserDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  picture: {
    type: String,
    default: 'https://img.freepik.com/premium-photo/avatar-resourcing-company_1254967-6653.jpg?w=740'
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  gender: {
    type: String,
    default: 'Not Specified',
  }
},
  {
    timestamps: true,
  });

module.exports = mongoose.model('UserData', UserDataSchema);

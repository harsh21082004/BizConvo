const AuthUser = require('../models/AuthUser');
const UserData = require('../models/UserData');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const email1 = process.env.EMAIL
const pass = process.env.EMAIL_PASS;


exports.register = async (req, res) => {

  const { mobileNumber, name, email, picture } = req.body;
  try {
    // Check if user exists in UserData
    const User = await UserData.findOne({ mobileNumber: mobileNumber, email: email });

    // Check if user exists in AuthUser
    const User1 = await AuthUser.findOne({ email: email });

    if (User) {
      return res.status(400).json({ message: 'User already exists, please login' });
    }

    if (User1 && User1.isVerified === false) {
      return res.status(200).json({ message: 'User not verified, please verify' });
    }

    // Update AuthUser fields if not verified
    const authUser = await AuthUser.findByIdAndUpdate(
      User1._id, // Find by User1's _id
      { 
        isVerified: false, // Set isVerified to false
        otp: 0 // Reset OTP
      },
      { new: true } // Return the updated document
    );

    // Sign JWT for isVerified and email
    const user = jwt.sign(
      { isVerified: authUser.isVerified, email: authUser.email },
      'secret123',
      { expiresIn: '10m' }
    );

    // Create new UserData entry
    const userData = new UserData({ name, email, picture, mobileNumber });
    await userData.save();

    // Sign JWT for userData details
    const token = jwt.sign(
      { _id: userData._id, name: userData.name, email: userData.email, picture: userData.picture, mobileNumber: userData.mobileNumber },
      'secret123',
      { expiresIn: '30m' }
    );

    return res.status(200).json({ message: 'User registered', token, user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.login = async (req, res) => {

  const { email, otp } = req.body;

  try {

    const authUser = await AuthUser.findOne({ email: email });

    const userData = await UserData.findOne({ email: email });

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!authUser) {
      return res.status(404).json({ message: 'OTP expired' });
    }

    if (authUser.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const User = await AuthUser.findByIdAndUpdate(
      authUser._id, // Find by User1's _id
      { 
        isVerified: true, // Set isVerified to false
        otp: 0 // Reset OTP
      },
      { new: true } // Return the updated document
    );

    const user = jwt.sign(
      { isVerified: User.isVerified, email: User.email },
      'secret123',
      { expiresIn: '10m' }
    );

    const token = jwt.sign({ _id: userData._id, name: userData.name, email: userData.email, picture: userData.picture, mobileNumber: userData.mobileNumber }, 'secret123', { expiresIn: '300m' });


    return res.status(200).json({ message: 'User logged in', token: token, user: user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


exports.sendOTP = async (req, res) => {

  try {

    const { email } = req.body;

    const verifyOTP = Math.floor(100000 + Math.random() * 900000);

    const authUser = await AuthUser.findOne({ email });

    if (authUser) {
      await AuthUser.findByIdAndUpdate(authUser._id, { otp: verifyOTP }, { email: email }, { new: true }, { isVerified: false });
    }

    if (!authUser) {
      const authUser = new AuthUser({ email, otp: verifyOTP });
      await authUser.save();
    }

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email1,
        pass,
      },
    });

    const mailOptions = {
      from: "harshtiwari.up2004@gmail.com",
      to: email,
      subject: "Verify your email",
      html: `<p>Here is your one time password to login to authentication app : ${verifyOTP} Use this OTP to Verify your email</p>`
    }

    const mailresponse = await transport.sendMail(mailOptions);

    return res.status(200).json({ success: "OTP sent successfully. Check your email for verification instructions.", mailresponse });

  } catch (error) {
    throw new Error(error.message);
  }
}

// Verify OTP
exports.verifyOTP = async (req, res) => {


  const { email, otp } = req.body;

  try {
    const authUser = await AuthUser.findOne({ email });

    if (!authUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (authUser.otp === otp) {
      authUser.isVerified = true;
      await authUser.save();

      // Create a corresponding UserData model if verified
      // const userData = new UserData({ authUser: authUser._id, name: mobileNumber });
      // await userData.save();

      const user = jwt.sign({ isVerified :authUser.isVerified, email: authUser.email}, 'secret123', { expiresIn: '10m' });

      return res.status(200).json({ message: 'OTP verified', user:user  });
    } else {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getAuthUser = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await UserData.find();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.getUserDetails = async (req, res) => {

  const { userId } = req.params;

  // Ensure receiverId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json('Invalid ObjectId format');
  }

  try {
      // Fetch user details by receiverId
      const user = await UserData.findById( userId );

      if (!user) {
          return res.status(404).json('User not found');
      }

      res.status(200).json(user);
  } catch (error) {
      console.error('Error:', error);
  }
};
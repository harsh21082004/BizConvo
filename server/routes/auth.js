const express = require('express');
const { sendOTP, verifyOTP, register, login, getAuthUser, getUsers, getUserDetails } = require('../controllers/authController');

const router = express.Router();

router.post('/register-email', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register', register);
router.post('/login', login);
router.post('/login-email', sendOTP);
router.post('/authUser', getAuthUser)
router.get('/users', getUsers)
router.get('/usersDetails/:userId', getUserDetails)
router.get('/',(req,res)=>{
  res.json("hello");
});

module.exports = router;

const express = require("express");
const { updateProfile, getProfile, changePassword } = require("../controllers/userController");
const auth = require("../middleware/authentication");


const router = express.Router();

router.post("/update-profile" ,updateProfile);

router.get('/getUser',getProfile);

router.post('/change-password',changePassword);

module.exports =  router;

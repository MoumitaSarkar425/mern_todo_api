const express = require("express");
const { signup, login, forgotPassword, resetPassword } = require("../controllers/authController");
const router = express.Router();

router.get("/",  (req, res) => {
    // send back a response to the client
    res.send({ message: "Welcome to our API" });
})
router.post("/signup",signup);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token",resetPassword)

module.exports =  router;

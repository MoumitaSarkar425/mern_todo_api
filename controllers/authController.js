const { StatusCodes } = require("http-status-codes");
const User = require("../Models/userModel");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const path = require("path");
const { error } = require("console");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");


const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port:2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const signup = async (req, res) => {
  try {
    const { firstname, username, password, email } = req.body;
    const userData = { firstname, username, password, email };
    const user = await User.create({ ...userData });

    const token = user.createJWT();

    res.status(StatusCodes.CREATED).json({
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        username: user.username,
        role: user.role,
        profileImage: user.profile_picture,
        token,
      },
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", alert: false, data: error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  // compare password
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({
    user: {
      id: user._id,
      username: user.username,
      firstname: user.firstname,
      lastName: user.lastName,
      email: user.email,
      address: user.address,
      role: user.role,
      profileImage: user.profile_picture,
      token,
    },
    msg: "Logged In Successfully!",
    alert: true,
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res
        .status(404)
        .send({ message: "User with this email does not exist", alert: false });
    }
    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    // console.log('Token For Reset need to send in email:'+ resetToken);
    // Set reset token and expiry on the user document
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.reresetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    // Email content
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;
    console.log(resetUrl);

    const mailOptions = { 
      to: user.email,
      from: process.env.SENDER_EMAIL,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset</p>
             <p>Click this <a href=${resetUrl}>Link</a> to reset your password</p>
             <p>This link will expire in one hour.</p>`,
    };

    // send email
    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .send({ message: "Pssword reset link sent to your email", alert: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  console.log(token);
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      reresetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(404).send({
        message: "Invalid Token! Please try with a valid token.",
        alert: false,
      });
    }

    // Update the password and save the user
    user.password = password;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = "";
    await user.save();

    res
      .status(200)
      .send({ message: "Password successfully reset", alert: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};


const testFunc = async (req,res) =>{
  const connectionState = mongoose.connection.readyState;
  res
  .status(200)
  .send({ message: "Test Function successfully run", alert: true, connectionState: connectionState });
}
module.exports = { login, signup, forgotPassword, resetPassword , testFunc };

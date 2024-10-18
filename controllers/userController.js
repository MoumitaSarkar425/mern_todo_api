const { StatusCodes } = require("http-status-codes");
const User = require("../models/userModel");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const path = require("path");
const { error } = require("console");
const jwt = require("jsonwebtoken");


const updateProfile = async (req, res) => {
  try {
    console.log(req.body);
    const userId =  req.user.userId;
    const newName = req.body.firstname;
    let profileImage = null;

    if (!userId || !newName) {
      throw new UnauthenticatedError("Please provide userId and newName");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthenticatedError("User not found.");
    }

    // Handle file upload if a file is included

    if (req.files && req.files.profileImage) {
      const image = req.files.profileImage;
      const uploadPath =
        "public/uploads/" + new Date().getTime() + "_" + image.name;

      // Move the file to the uploads directory
      image.mv(uploadPath, (err) => {
        if (err) {
          console.log(err);
          // throw new UnauthenticatedError("File upload failed.");
        }
      });

      // Update profileImage with the new file path
      profileImage = `uploads/${path.basename(uploadPath)}`;
    }
    // Update user information in the database
    user.firstname = newName || user.firstname;
    if (profileImage) {
      user.profile_picture = profileImage;
    }
    await user.save();
    res.send({
      user: {
        id: user._id,
        username: user.username,
        firstname: user.firstname,
        lastName: user.lastName,
        email: user.email,
        address: user.address,
        role: user.role,
        profileImage: user.profile_picture,
      },
      message: "Upload successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error", alert: false }); 
  }
};

const getProfile = async (req, res) => {
  try {
   
    const userId =  req.user.userId

    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthenticatedError("User not found.");
    }

    res.send({
      user: {
        id: user._id,
        username: user.username,
        firstname: user.firstname,
        lastName: user.lastName,
        email: user.email,
        address: user.address,
        role: user.role,
        profileImage: user.profile_picture,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, password } = req.body;
   
    const userId =  req.user.userId;
    
    const user = await User.findById(userId);
    if (!user) {
      throw new UnauthenticatedError("User not found.");
    }

    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
      throw new UnauthenticatedError("Incorrect old password");
    }

    // Update the password and save the user
    user.password = password;
    await user.save();

    const newToken = user.createJWT();

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
        newToken,
      },
      msg: "Password updated successfully!.", 
      alert: true,
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

module.exports = { updateProfile, getProfile, changePassword };

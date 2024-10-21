const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URL;
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,

      // server:{auto_reconnect:true}
    });
    console.log("Connection to Databse is successfull");
  } catch (error) {
    console.log("Connection to Database is unsuccessfull");
    console.log(error);
  }
};

module.exports = connectDB;

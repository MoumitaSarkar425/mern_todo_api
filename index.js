const express = require("express");
require("express-async-errors");
const fileUpload = require("express-fileupload");
const bodyParser = require('body-parser');
const path = require("path");

const connectDB = require("./utils/db");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT;

require("dotenv").config();

//Enable Files Upload
app.use(fileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());

// Static folder to serve uploaded files
// app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use('/uploads', express.static('public/uploads'))

// Create 'uploads' folder if it doesn't exist
const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Routes
const authRoutes = require("./Routes/authRoute");
const userRoutes = require("./Routes/userRoutes");
const taskRoutes = require("./Routes/taskRoutes");

//Middlewares
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const auth = require("./middleware/authentication");

app.use(cors({ credentials: true, origin: "*" }));

app.use(express.json({ limit: "10mb" }));
app.get("/", (req, res) => {
  res.send("Server is running");
});

// // Auth Routes
app.use("/api/auth",authRoutes);
// // User Routes
app.use("/api/user", auth, userRoutes);

// // Task Routes
app.use("/api/task",auth, taskRoutes);

// Middleware for Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
//Middleware Error handling Functions
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);



// Server and connect to MongoDB functionn
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () =>
      console.log(`Server is listening on port ${PORT}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();

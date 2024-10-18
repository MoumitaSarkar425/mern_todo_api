const { StatusCodes } = require("http-status-codes");
const { UnauthenticatedError } = require("../errors");
const Task = require("../Models/taskModel");

// Function to create new task
const createTask = async (req, res) => {
  try {
    // Check if required fields are present in the request body
    const { title, date } = req.body;
    if (!title || !date) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: "Title and Date are required fields",
        alert: false,
      });
    }

    const data = await Task.create({ ...req.body, userId: req.user.userId });
    return res
      .status(StatusCodes.OK)
      .send({ message: "Task created successfully", alert: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .send({ message: "Internal Server Error", alert: false });
  }
};

const markImportant = async (req, res) => {
  try {
    const { taskId, status } = req.body;
    const task = await Task.findById(taskId);
    if (!task) {
      throw new UnauthenticatedError("Task not found.");
    }

    //Update task as important
    task.isImportant = status;
    await task.save();

    res
      .status(StatusCodes.OK)
      .send({ message: "Task status changed", alert: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

const chnageStatus = async (req, res) => {
  try {
    const { taskId, status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      throw new UnauthenticatedError("Task not found.");
    }

    //Update task as important
    task.isCompleted = status;
    await task.save();

    res
      .status(StatusCodes.OK)
      .send({ message: "Task status changed", alert: true });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

const getAllTask = async (req, res) => {
  try {
    const task = await Task.find({
      userId: req.user.userId,
      isDeleted: false,
    }).sort({ date: -1 });
    if (!task) {
      // Send an empty array if no tasks are found
      return res.send({
        status: true,
        data: [],
      });
    } else {
      return res.send({
        status: true,
        data: task,
      });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

const getTodaysTask = async (req, res) => {
  try {
    // Get the start and end of today's date
    const startOfTheDay = new Date();
    startOfTheDay.setHours(0, 0, 0, 0); // Start of the day: 12:00:00 AM

    const EndOfTheDay = new Date();
    EndOfTheDay.setHours(23, 59, 59, 999);

    const task = await Task.find({
      userId: req.user.userId,
      isDeleted: false,
      date: {
        $gte: startOfTheDay,
        $lte: EndOfTheDay,
      },
    });
    if (!task) {
      // Send an empty array if no tasks are found
      return res.send({
        status: true,
        data: [],
      });
    } else {
      return res.send({
        status: true,
        data: task,
      });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

const getImportantTask = async (req, res) => {
  try {
    const task = await Task.find({
      userId: req.user.userId,
      isImportant: true,
      isDeleted: false,
    }).sort({ date: -1 });
    if (!task) {
      // Send an empty array if no tasks are found
      return res.send({
        status: true,
        data: [],
      });
    } else {
      return res.send({
        status: true,
        data: task,
      });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

const getCompletedTask = async (req, res) => {
  try {
    const task = await Task.find({
      userId: req.user.userId,
      isCompleted: true,
      isDeleted: false,
    }).sort({ date: -1 });
    if (!task) {
      // Send an empty array if no tasks are found
      return res.send({
        status: true,
        data: [],
      });
    } else {
      return res.send({
        status: true,
        data: task,
      });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

const getUnCompletedTask = async (req, res) => {
  try {
    const task = await Task.find({
      userId: req.user.userId,
      isCompleted: false,
      isDeleted: false,
    }).sort({ date: -1 });
    if (!task) {
      // Send an empty array if no tasks are found
      return res.send({
        status: true,
        data: [],
      });
    } else {
      return res.send({
        status: true,
        data: task,
      });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    const task = await Task.findById(taskId);
    if (!task) {
      throw new UnauthenticatedError("Task not found.");
    }

    //Update task as important
    task.isDeleted = true;
    await task.save();

    return res
      .status(StatusCodes.OK)
      .send({ message: "Task deleted successfully!", alert: true });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

const taskSearch = async (req, res) => {
  try {
    const { title } = req.query;

    const task = await Task.find({
      userId: req.user.userId,
      isDeleted: false,
      title: new RegExp(title, "i"),
    });
    if (!task) {
      throw new UnauthenticatedError("Task not found.");
    }

    return res.send({
      status: true,
      data: task,
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

const taskDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      // Send an empty array if no tasks are found
      return res.send({
        status: true,
        data: [],
      });
    } else {
      return res.send({
        status: true,
        data: [task],
      });
    }

    return res.send({
      status: true,
      data: task,
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

const editTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!task) {
      throw new UnauthenticatedError("Task not found.");
    }

    return res
      .status(StatusCodes.OK)
      .send({ message: "Task edited successfully", alert: true });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", alert: false });
  }
};

module.exports = {
  createTask,
  markImportant,
  chnageStatus,
  getAllTask,
  deleteTask,
  getTodaysTask,
  getImportantTask,
  getCompletedTask,
  getUnCompletedTask,
  taskSearch,
  taskDetails,
  editTask,
};

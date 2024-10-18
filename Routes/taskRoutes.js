const express = require("express");
const {
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
} = require("../controllers/taskController");
const router = express.Router();

router.post("/create-task", createTask);
router.post("/mark-important", markImportant);
router.post("/change-status", chnageStatus);
router.get("/all", getAllTask);
router.post("/delete", deleteTask);
router.get("/todays-task", getTodaysTask);
router.get("/important-task", getImportantTask);
router.get("/complete-task", getCompletedTask);
router.get("/uncomplete-task", getUnCompletedTask);
router.get('/search',taskSearch);
router.get('/task-details/:id',taskDetails);
router.put('/edit-task/:id',editTask);

module.exports = router;

const express = require("express");
const {
  createTodo,
  getTodos,
  toggleTodo,
  deleteTodo,
} = require("../controllers/todoController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect); // 🔒 protect all routes

router.post("/", createTodo);
router.get("/", getTodos);
router.put("/:id", toggleTodo);
router.delete("/:id", deleteTodo);

module.exports = router;

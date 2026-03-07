const Todo = require("../models/Todo");
const { redisClient } = require("../config/redis");

// Create Todo
exports.createTodo = async (req, res) => {
  try {
    const todo = await Todo.create({
      title: req.body.title,
      user: req.user.id,
    });

    // clear cache
    await redisClient.del(`todos:${req.user.id}`);

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Logged-in User Todos (WITH REDIS CACHE)
exports.getTodos = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Check Redis cache first
    const cachedTodos = await redisClient.get(`todos:${userId}`);

    if (cachedTodos) {
      console.log("⚡ Todos from Redis Cache");
      return res.json(JSON.parse(cachedTodos));
    }

    // 2️⃣ If not in cache → fetch from MongoDB
    const todos = await Todo.find({ user: userId });

    // 3️⃣ Save in Redis (expire in 60 sec)
    await redisClient.set(`todos:${userId}`, JSON.stringify(todos), { EX: 60 });

    console.log("📦 Todos from MongoDB");

    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle Todo
exports.toggleTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    todo.completed = !todo.completed;
    await todo.save();

    // clear cache
    await redisClient.del(`todos:${req.user.id}`);

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Todo
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // clear cache
    await redisClient.del(`todos:${req.user.id}`);

    res.json({ message: "Todo deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

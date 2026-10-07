const express = require("express");

const {
  getFoods,
  getFood,
  createFood,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");

const router = express.Router();

router.get("/", getFoods);

router.get("/:id", getFood);

router.post("/", createFood);

router.put("/:id", updateFood);

router.delete("/:id", deleteFood);

module.exports = router;
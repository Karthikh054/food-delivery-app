const express = require("express");

const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");

const router = express.Router();

router.get("/", getRestaurants);

router.get("/:id", getRestaurant);

router.post("/", createRestaurant);

router.put("/:id", updateRestaurant);

router.delete("/:id", deleteRestaurant);

module.exports = router;
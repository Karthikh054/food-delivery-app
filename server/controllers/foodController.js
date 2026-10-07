const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

const getFoods = async (req, res) => {
  try {
    const { restaurantId, category, search } = req.query;

    const filter = {};

    if (restaurantId) {
      filter.restaurant = restaurantId;
    }

    if (category) {
      filter.category = category;
    }

    if(search){
      filter.name = { $regex: search, $options: "i",};
    }

    const foods = await Food.find(filter)
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

      const categoryFilter = {};

    if (restaurantId) {
      categoryFilter.restaurant = restaurantId;
    }

    const categories = await Food.distinct(
      "category",
      categoryFilter
    );

    res.json({
      success: true,
      categories,
      data: foods,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate("restaurant", "name");

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    res.json({
      success: true,
      data: food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createFood = async (req, res) => {
  try {
    const {
      restaurant,
      name,
      description,
      image,
      category,
      price,
      isVeg,
      isAvailable,
    } = req.body;

    const restaurantExists = await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const food = await Food.create({
      restaurant,
      name,
      description,
      image,
      category,
      price,
      isVeg,
      isAvailable,
    });

    res.status(201).json({
      success: true,
      message: "Food item created successfully",
      data: food,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    res.json({
      success: true,
      message: "Food item updated successfully",
      data: food,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(
      req.params.id
    );

    if (!food) {
      return res.status(404).json({
        success: false,
        message: "Food item not found",
      });
    }

    res.json({
      success: true,
      message: "Food item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getFoods,
  getFood,
  createFood,
  updateFood,
  deleteFood,
};
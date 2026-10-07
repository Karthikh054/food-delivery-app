const mongoose = require("mongoose");

const Order = require("../models/Order");
const Food = require("../models/Food");
const Restaurant = require("../models/Restaurant");

const createOrder = async (req,res) => {
    try{
        const {restaurantId, items, customer, deliveryAddress,} = req.body;

        if(!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)){
            return res.status(400).json({
                success: false,
                message: "Invalid restaurant ID",
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty",
            });
        }

        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        const orderItems = [];

        let subtotal = 0;

        for (const item of items) {
            if (!item.foodId || !mongoose.Types.ObjectId.isValid(item.foodId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid food ID",
                });
            }

            if (!item.quantity || item.quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Food quantity must be at least 1",
                });
            }

            const food = await Food.findById(item.foodId);

            if (!food) {
                return res.status(404).json({
                    success: false,
                    message: "One or more food items were not found",
                });
            }

            if (!food.isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: `${food.name} is currently unavailable`,
                });
            }

            if (food.restaurant.toString() !== restaurantId.toString()) 
                {
                return res.status(400).json({
                    success: false,
                    message: `${food.name} does not belong to this restaurant`,
                });
            }

            const itemTotal = food.price * item.quantity;

            subtotal += itemTotal;

            orderItems.push({
                food: food._id,
                name: food.name,
                price: food.price,
                quantity: item.quantity,
                total: itemTotal,
            });
        }

        const deliveryFee = restaurant.deliveryFee || 0;

        const totalAmount = subtotal + deliveryFee;

        const order = await Order.create({restaurant: restaurant._id, items: orderItems,
            customer: {
                name: customer.name,
                mobile: customer.mobile,
            },
            deliveryAddress: {
                address: deliveryAddress.address,
                city: deliveryAddress.city,
                pincode: deliveryAddress.pincode,
            },
            subtotal,
            deliveryFee,
            totalAmount,
            status: "Pending",
        });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            data: order,
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

module.exports = {
  createOrder,
};
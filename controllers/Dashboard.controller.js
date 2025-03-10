const Express = require("express");
const Dashboard = Express.Router();
const Car = require("../models/Car.model");
Dashboard.get("/cars", async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json({
      cars,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching cars",
      success: false,
    });
  }
});
module.exports = { Dashboard };

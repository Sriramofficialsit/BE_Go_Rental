const mongoose = require("mongoose");

const CarSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  modelYear: {
    type: Number,
    required: false,
  },
  priceperday: {
    type: Number,
    required: true,
  },
  transmission: {
    type: String,
    enum: ["Auto", "Manual"],
    required: true,
  },
  ac: {
    type: String,
    enum: ["ac", "non-ac"],
    required: true,
  },
  passangers: {
    type: String,
    required: true,
    max: 8,
  },
  seats: {
    type: String,
    required: true,
    max: 8,
  },
  doors: {
    type: String,
    required: true,
    max: 6,
  },
  carimg: {
    type: String,
    required: true,
  },
  ratings: {
    type: String,
    required: true,
    max: 5,
  },
  reviews: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("Cars", CarSchema);

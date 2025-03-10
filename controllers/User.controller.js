const Express = require("express");
const Auth = Express.Router();
const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  secure: true,
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

Auth.post("/register", async (req, res) => {
  const { name, email, password, mobileno } = req.body;

  if (!name || !email || !password || !mobileno) {
    return res.status(400).json({
      message: "Please Provide All Informations",
      success: false,
    });
  }
  try {
    const existing_user = await User.findOne({ email });
    if (existing_user) {
      return res.status(400).json({
        message: "User Already Exist",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const NewUser = new User({
      name,
      email,
      password: hashedPassword,
      mobileno,
    });
    await NewUser.save();
    return res.status(201).json({
      message: "User Registeration Sucessfull",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
});

Auth.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid  User",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          mobileno: user.mobileno,
        },
        success: false,
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Username Or Password",
        success: false,
      });
    }
    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role, Mobile: user.mobileno },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    return res.status(200).json({
      message: "Login Successfull",
      token: token,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
});

Auth.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User Not Found!!",
        success: false,
      });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetpasswordtoken = token;
    user.resetpasswordexpires = Date.now() + 60 * 60 * 1000;

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: `
          <p>Hello, ${user.name}. You requested a password reset.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">Reset Your Password</a>
          <p>If you did not request this, please ignore this email. The link will expire in 1 hour.</p>
        `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Password reset email sent successfully",
      success: true,
      token: token,
    });
  } catch (error) {
    res.status(503).json({
      message: "Something went wrong on the server side",
      success: false,
      error: error.message,
    });
  }
});

Auth.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetpasswordtoken: token,
      resetpasswordexpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token",
        success: false,
      });
    }

    // Hash the new password before saving
    user.password = await bcrypt.hash(newPassword, 10);

    // Clear reset token fields
    user.resetpasswordtoken = undefined;
    user.resetpasswordexpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password successfully reset",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong on the server side",
      success: false,
      error: error.message,
    });
  }
});

module.exports = { Auth };

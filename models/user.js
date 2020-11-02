const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    resetPasswordLink: "",
  },

  //data 가 생성될 때 날짜가 자동으로 생성되도록
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);

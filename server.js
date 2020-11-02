const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

//req middleware
const morgan = require("morgan");
const bodyParser = require("body-parser");

//req db
const mongoose = require("mongoose");

//connect to db
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(process.env.MONGODB_ADDRESS, dbOptions)
  .then(() => console.log("db connected"))
  .catch((err) => console.log(err.message));

//use middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 7000;
app.listen(PORT, console.log("server connected"));

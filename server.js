const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

//bring router
const userRoute = require("./router/user");

//req middleware
const morgan = require("morgan");
const bodyParser = require("body-parser");

require("./config/db");

//use middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//use router
app.use("/user", userRoute);

const PORT = process.env.PORT || 7000;
app.listen(PORT, console.log(`server started at ${PORT}`));

const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

//bring router
const userRoute = require("./router/user");
const profileRoute = require("./router/profile");

//req middleware
const morgan = require("morgan");
const bodyParser = require("body-parser");
const passport = require("passport");

require("./config/db");

//use middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

//passport config
require("./config/passport")(passport);

//use router
app.use("/user", userRoute);
app.use("/profile", profileRoute);

const PORT = process.env.PORT || 7000;
app.listen(PORT, console.log(`server started at ${PORT}`));

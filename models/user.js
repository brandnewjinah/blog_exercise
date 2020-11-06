const mongoose = require("mongoose");
const gravatar = require("gravatar");
const normalize = require("normalize-url");
const bcrypt = require("bcryptjs");

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
    resetPasswordLink: {
      data: String,
      default: "",
    },
  },

  //data 가 생성될 때 날짜가 자동으로 생성되도록
  {
    timestamps: true,
  }
);

//pre runs before save
userSchema.pre("save", async function (next) {
  try {
    console.log("entered");
    const avatar = normalize(
      gravatar.url(this.email, {
        s: "200",
        r: "pg",
        d: "mm",
      }),
      { forceHttps: true }
    );

    this.avatar = avatar;

    //password 암호화
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(this.password, salt);
    this.password = passwordHash;

    console.log("exited");
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

module.exports = mongoose.model("user", userSchema);

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// **************************************

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter your first name"],
    },
    lastName: {
      type: String,
    },
    fullName: {
      type: String,
    },

    email: {
      type: String,
      required: [true, "Please enter your mail id"],
      unique: [true, "User with this mail id is already registered"],
      validate: {
        validator: function (email) {
          return validator.isEmail(email);
        },
        message: "Mail id is not valid",
      },
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [8, "Password is too small"],
      validate: {
        validator: function (password) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            password
          );
        },

        message:
          "Password must contain at least one: \nUpper case letter \nLower case letter \nOne digit \nSpecial character[ @, $, !, %, *, ?, &]",
      },
      select: false,
    },

    passwordConfirm: {
      type: String,
      required: [true, "Please confirm the password"],
      validate: {
        validator: function (passwordConfirm) {
          return this.password === passwordConfirm;
        },

        message: "Password is not matched",
      },

      select: false,
    },
    refreshToken: String,

    role: {
      type: "String",
      enum: ["user", "admin"],
    },
    imageUrl: {
      type: "String",
      default:
        "https://res.cloudinary.com/dhaboeimw/image/upload/v1701969474/fsxon1hleyiw6nk8zosa.png",
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // console.log(this);

  // 1.) Encrypt the password and set the passwordConfirm to undefined
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(this.password, salt);

    this.password = hashedPassword;
    this.passwordConfirm = undefined;

    // 2.)Set the fullName prop

    this.fullName = this.firstName + " " + this.lastName;
  }

  next();
});

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken, passwordResetToken: this.passwordResetToken });
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const UserModel = mongoose.model("Users", userSchema);
module.exports = UserModel;

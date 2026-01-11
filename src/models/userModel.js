const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: ["admin", "volunteer"],
      default: "volunteer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, //automatically adds createdAt, updatedAt
  }
);

//HASHING LOGIC using pre-save middleware and bcrypt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
//   next();
});

//Schema Method | Password Comparison
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;

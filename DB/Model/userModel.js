import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  activeStatus: {
    type: Boolean,
    required: true,
  },
  SecurityCode: {
    type: String,
    required: false,
  },
  url : {
    type : mongoose.Schema.Types.ObjectId,
    required:false
  }
});
export const userModel = mongoose.model("users", userSchema);

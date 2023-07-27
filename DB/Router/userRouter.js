import { userModel } from "../Model/userModel.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const mail = process.env.mailid;
const passkey = process.env.password;
const link = process.env.LINK;
const secret_key = process.env.secret_key;

const router = express.Router();

//All Users
router.get("/all", async (req, res) => {
  const all_users = await userModel.find({});
  res.status(200).json({ data: all_users });
});

//User Register
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const index = email.indexOf("@");
    const username = email.slice(0, index).toLowerCase();
    let domain = email.slice(index);
    const lowercasemail = username + domain;
    const user = await userModel.findOne({ email: lowercasemail });
    if (user) {
      return res.json({ message: "User already Exsist" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);
    const new_user = await userModel({
      firstName,
      lastName,
      email: lowercasemail,
      password: hashpassword,
      activeStatus: false,
    });
    await new_user.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: mail,
        pass: passkey,
      },
    });

    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
      // send mail with defined transport object
      await transporter.sendMail({
        from: mail, // sender address
        to: lowercasemail, // list of receivers
        subject: "Short Url", // Subject line
        text: `Click the below link to activate your account :\n ${link}/activateaccount/${lowercasemail}`, // plain text body
      });
    }
    main().catch(console.error.message);
    res.status(200).json({
      message:
        "User added Successfully,Please Check your email to activate the acoount",
    });
  } catch (error) {
    console.log(error.message);
    res.json({ Error: error.message });
  }
});

//Account Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const index = email.indexOf("@");
    const username = email.slice(0, index).toLowerCase();
    let domain = email.slice(index);
    const lowercasemail = username + domain;
    const find_User = await userModel.findOne({ email: lowercasemail });
    if (!find_User) {
      return res.json({ message: "User Not Registered " });
    }
    const verify_password = await bcrypt.compare(password, find_User.password);
    if (!verify_password) {
      return res.json({ message: "Invalid Password" });
    }
    const generate_token = jwt.sign(
      { id: find_User._id },
      process.env.secret_key
    );
    res.status(200).json({
      message: "Login Successfull",
      token: generate_token,
      user_id: find_User._id,
      firstName: find_User.firstName,
      lastName: find_User.lastName,
      activeStatus: find_User.activeStatus,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ Error: error.message });
  }
});

//Account Activation
router.put("/activate_account", async (req, res) => {
  const email = req.body.email;
  const index = email.indexOf("@");
  const username = email.slice(0, index).toLowerCase();
  let domain = email.slice(index);
  const lowercasemail = username + domain;
  const find_user = await userModel.findOne({ email: lowercasemail });
  if (!find_user) {
    return res.json({ message: "User Not Found" });
  }
  if (find_user.activeStatus === true) {
    return res
      .status(200)
      .json({ message: "Your account is already Activated" });
  }
  await userModel.findOneAndUpdate(
    { email: lowercasemail },
    { $set: { activeStatus: true } }
  );
  res.json({
    message: `${find_user.firstName} ${find_user.lastName},Your account is now activated `,
  });
});

//Forgot Password
router.put("/forgot_password", async (req, res) => {
  const email = req.body.email;
  const index = email.indexOf("@");
  const username = email.slice(0, index).toLowerCase();
  let domain = email.slice(index);
  const lowercasemail = username + domain;
  const user_exsist = await userModel.findOne({ email: lowercasemail });
  if (!user_exsist) {
    return res.status(400).json({ message: "User Not Found" });
  }
  const token = jwt.sign({ userid: user_exsist._id }, secret_key, {
    expiresIn: "5m",
  });
  await userModel.findOneAndUpdate(
    { email: lowercasemail },
    { $set: { SecurityCode: token } }
  );
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: mail,
      pass: passkey,
    },
  });

  // async..await is not allowed in global scope, must use a wrapper
  async function main() {
    // send mail with defined transport object
    const forgot_password_link = `${link}/resetpassword?token=${token}&email=${lowercasemail}`;
    await transporter.sendMail({
      from: mail, // sender address
      to: lowercasemail, // list of receivers
      subject: "Forgot Password", // Subject line
      text: `Click the below link to reset the password,This link will expire in 5 minutes : \n ${forgot_password_link}`, // plain text body
    });
  }
  main().catch(console.error.message);
  res.json({
    message: "An password Reset link is send to your mail",
  });
});

//Reset Password
router.put("/reset_password", async (req, res) => {
  try {
    const { email, token, newpassword } = req.body;
    const index = email.indexOf("@");
    const username = email.slice(0, index).toLowerCase();
    let domain = email.slice(index);
    const lowercasemail = username + domain;
    const find_User = await userModel.findOne({ email: lowercasemail });
    if (!find_User) {
      return res.status(400).json({ message: "User Not Found" });
    }
    jwt.verify(token, secret_key, async function (err) {
      if (err) {
        return res.status(400).json({ message: `${err.message}` });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(newpassword, salt);
        await userModel.findOneAndUpdate(
          { email: lowercasemail },
          { $set: { password: hashpassword } }
        );
        await userModel.findOneAndUpdate(
          { email: lowercasemail },
          { $unset: { SecurityCode: 1 } }
        );
        res.status(200).json({ message: "Password Changed Successfully" });
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ Error: `${error.message}` });
  }
});

export { router as userRouter };

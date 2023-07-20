import { shorturlModel } from "../Model/shorturlModel.js";
import isAuthenticated from "../Authentication/Auth.js";
import express from "express";
import { nanoid } from "nanoid";

const router = express.Router();

router.post("/shorten", isAuthenticated, async (req, res) => {
  try {
    const { longurl, userid } = req.body;
    const shortidCode = nanoid(5);
    const new_url = await shorturlModel({
      shorturl: `https://urlsshort.vercel.app/${shortidCode}`,
      longurl,
      shortCode: shortidCode,
      userid,
      count: 0,
    });
    await new_url.save();
    res.status(200).json({ message: "Url Saved" });
  } catch (error) {
    console.log(error.message);
  }
});

router.get("/user/:userid", isAuthenticated, async (req, res) => {
  try {
    const { userid } = req.params;
    const data = await shorturlModel.find({ userid });
    res.json({ data });
  } catch (error) {
    console.log(error.message);
  }
});

router.get("/dashboard/:userid", isAuthenticated, async (req, res) => {
  try {
    const { userid } = req.params;
    const data = await shorturlModel.find({ userid });
    function gettotalclicks(shorturldata) {
      let total_clicks = 0;
      shorturldata.forEach((element) => {
        total_clicks += element.count;
      });
      return total_clicks;
    }
    const totalClicks = gettotalclicks(data);
    res.status(200).json({ totalClicks, totalurls: data.length });
  } catch (error) {
    console.log(error.message);
  }
});

router.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;
    const result = await shorturlModel.findOne({ shortCode });
    await shorturlModel.findOneAndUpdate({ shortCode }, { $inc: { count: 1 } });
    res.redirect(result.longurl);
  } catch (error) {
    console.log(error.message);
  }
});

export { router as shorturlRouter };
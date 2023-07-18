import mongoose from "mongoose";

const shorturlSchema = new mongoose.Schema({
    shorturl : {
        type : String,
        required : true
    },
    longurl : {
        type : String,
        required : true
    }
})

export const shorturlModel = mongoose.model("urls",shorturlSchema);
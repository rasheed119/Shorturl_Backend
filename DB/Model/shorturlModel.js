import mongoose from "mongoose";

const shorturlSchema = new mongoose.Schema({
    shorturl : {
        type : String,
        required : true
    },
    longurl : {
        type : String,
        required : true
    },
    shortCode : {
        type : String,
        required : true
    },
    userid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true
    },
    count : {
        type :Number,
        required : true
    }
})

export const shorturlModel = mongoose.model("urls",shorturlSchema);
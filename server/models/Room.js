import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    hotel :{type : String , ref : "Hotel" , required:true},
    roomType : {type : Number , required : true},
    pricePerNight :{type : Number , required:true},
    amentities : {type : Array , required : true},
    images : [{type : String}],
    isAvailable : {type : Boolean , default:true},
},{timestamps:true});

const Room = mongoose.model("HRoom" , roomSchema);


export default Room;
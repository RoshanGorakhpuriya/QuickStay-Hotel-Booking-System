// import mongoose from "mongoose";

// const connectDB = async ()=>{
//     try{
//         mongoose.connection.on('connected', ()=>console.log("Database Connected"));


//         await mongoose.connect(`${process.env.MONGODB_URI}/hotel-booking`)
//     } catch(error){
//         console.log(error.message);
//     }
// }

// export default connectDB

// configs/db.js

import mongoose from "mongoose";

const dbConnect = async () => {
  if (mongoose.connections[0].readyState) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
  }
};

export default dbConnect;

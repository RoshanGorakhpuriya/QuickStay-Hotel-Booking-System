// import User
//  from "../models/User.js";

//  import { Webhook } from "svix";

//  const clerkWebhooks = async (req , res)=>{
//     try{
//         const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

//         const headers = {
//             "svix-id":req.headers["svix-id"],
//             "svix-timestamp":req.headers["svix-timestamp"],
//             "svix-signature":req.headers["svix-signature"]
//         };

//         await whook.verify(JSON.stringify(req.body),headers)

//         const {data , type} = req.body

//         const userData = {
//             _id : data.id,
//             email:data.email_addresses[0].email_address,
//             username : data.first_name + " " + data.last_name,
//             image:data.image_url,
//         }

//         switch(type) {
//             case "user.created":{
//                 await User.create(userData)
//                 break;
//             }

//             case "user.updated":{
//                 await User.findByIdAndUpdate(data.id , userData)
//                 break;
//             }

//             case "user.deleted":{
//                 await User.findByIdAndDelete(data.id);
//                 break;
//             }

//             default:
//                 break;
//         }
//         res.json({success : true , message : "Webhook Recieved"})
//     } catch(error){
//         console.log(error.message);
//         res.json({success:false , message:error.message});
//     }
// }
// export default clerkWebhooks;


// api/clerk.js

import { buffer } from "micro";
import { Webhook } from "svix";
import dbConnect from "../configs/db.js";
import User from "../models/User.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const payload = (await buffer(req)).toString();

    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    if (!headers["svix-id"] || !headers["svix-timestamp"] || !headers["svix-signature"]) {
      return res.status(400).json({ success: false, message: "Missing required headers" });
    }

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(payload, headers);
    const { data, type } = evt;

    await dbConnect();

    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address || "no-email",
      username: `${data.first_name} ${data.last_name}`,
      image: data.image_url,
    };

    switch (type) {
      case "user.created":
        await User.create(userData);
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;
      default:
        console.log("Unhandled type", type);
    }

    res.status(200).json({ success: true, message: "Webhook handled" });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
}

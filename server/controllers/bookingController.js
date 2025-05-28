import Booking from "../models/Booking.js"
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";


const checkAvailability = async ({checkInDate , checkOutDate , room}) =>{
    try{
        const bookings = await Booking.find({
            room,
            checkInDate:{$lte , checkOutDate},
            checkOutDate : {$gte , checkInDate},
        });

        const isAvailable = bookings.length === 0;
        return isAvailable;
    }
    catch(error){
        console.log(error.message);
    }
}
export const checkAvailabilityAPI = async(req , res)=>{
    try{
        const { room , checkInDate , checkOutDate }= req.body;

        const isAvailable = await checkAvailability({checkInDate , checkOutDate , room});

        res.json({success:true , isAvailable});
    }catch(error){
        res.json({success:false , message:error.message});
    }
};

export const createBooking = async(req , res) =>{
    try{
        const {room , checkInDate , checkOutDate , guests} = req.body;

        const user = req.user._id;

        const isAvailable = await checkAvailability({checkInDate , checkOutDate , room});

        if(!isAvailable){
            return res.json({success:false , message:"Room is not available"});
        }

        const roomData = await Room.findById(room).populate("hotel")

        let totalPrice = roomData.pricePerNight;

        const checkIn = new Date(checkInDate);

        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const night = Math.ceil(timeDiff/(1000 * 3600 * 24))

        totalPrice *= night;
        const booking = await Booking.create({
            user , 
            room , 
            hotel:roomData.hotel._id,
            guests : +guests,
            totalPrice,
        })

        res.json({success:true , message:"Booking created successfully"});

    }catch(error){
        console.log(error);
        res.json({success:false , message:"Failed to create booking"});
    }
};


export const getUserBookings = async (req , res)=>{
    try{
        const user = req.user._id;
        const bookings = await Booking.find({user}).populate("room hotel").sort({createdAt:-1})
        res.json({success:true , bookings})
    }catch(error){
        res.json({success:false , message:"Failed to fetch bookings"})
    }
}

export const getHotelBookings = async (req , res)=>{
    try{
        const hotel = await Hotel.findOne({owner : req.auth.userId});

    if(!hotel){
        return res.json({success:false , message:"No Hotel found"});
    }

    const bookings = await Booking.find({hotel:hotel._id}).pupulate("room hotel user").sort({createdAt:-1});

    const totalBookings = bookings.length;

    const totalRevenue = bookings.reduce((acc , booking)=>acc+booking.totalPrice , 0)

    res.json({success:true , dashboardData:{totalBookings ,totalRevenue , bookings}})
    }
    catch(error){
        res.json({success:false , message:"Failed to fetch bookings"})
    }
}
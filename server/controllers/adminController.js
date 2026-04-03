import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import { createClerkClient } from "@clerk/backend";

// Fetching user details from Clerk to get the name for admin bookings list
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});


// API to check if the user is an admin
export const isAdmin = async (req, res) => {
  res.json({ success: true, isAdmin: true });
};

// API to get dashboard data for admin
export const getDashboardData = async (req, res) => {
  try {
    const bookings = await Booking.find({ isPaid: true });
    const activeShows = await Show.find({
      showDateTime: { $gte: new Date() },
    }).populate("movie");

    const totalUsers = await User.countDocuments();

    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
      activeShows,
      totalUsers,
    };

    res.json({ success: true, dashboardData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all shows for admin management
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({
      showDateTime: { $gte: new Date() },
    })
      .populate("movie")
      .sort({ showDateTime: 1 });

    res.json({ success: true, shows });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

//  API to get all bookings for admin management
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    const showIds = bookings.map(b => b.show);

    const shows = await Show.find({ _id: { $in: showIds } })
      .populate("movie");

    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const show = shows.find(
          s => s._id.toString() === booking.show
        );

        let userName = "Unknown";

        try {
          const user = await clerkClient.users.getUser(booking.user);
          userName = `${user.firstName || ""} ${user.lastName || ""}`;
        } catch (err) {
          console.log("User fetch failed");
        }

        return {
          ...booking.toObject(),
          show: show || null,
          userName,
        };
      })
    );

    res.json({ success: true, bookings: enrichedBookings });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
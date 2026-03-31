import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import sendEmail from "../configs/nodeMailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Create a function that listens for the "clerk/user.created" event and creates a user in the database
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: { event: "clerk/user.created" },
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    };

    await User.create(userData);
  }
);

// Create a function that listens for the "clerk/user.deleted" event and deletes the user from the database
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
    triggers: { event: "clerk/user.deleted" },
  },
  async ({ event }) => {
    const { id } = event.data;
    await User.findOneAndDelete({ id });
  }
);

// Create a function that listens for the "clerk/user.updated" event and updates the user in the database
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: { event: "clerk/user.updated" },
  },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    };

    await User.findOneAndUpdate({ id }, userData);
  }
);

// Inngest Function to cancel booking and release seats after 10 minutes if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  {
    id: "release-seats-delete-booking",
    triggers: [{ event: "app/checkpayment" }],
  },
  async ({ event, step }) => {
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);

    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;

      const booking = await Booking.findById(bookingId);

      // If payment is not made, release seats and delete booking
      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);

        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });

        show.markModified("occupiedSeats");
        await show.save();

        await Booking.findByIdAndDelete(booking._id);
      }

    });
  }
);

// Inngest Function to send email when user books a show
const sendBookingConfirmationEmail = inngest.createFunction(
  {
    id: "send-booking-confirmation-email",
    triggers: [{ event: "app/show.booked" }],
  },

  async ({ event, step }) => {
    const { bookingId } = event.data;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: { path: "movie", model: "Movie" },
      })
      .populate("user");

    // You can proceed with email logic here
    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
      body: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Hi ${booking.user.name},</h2>

      <p>
        Your booking for 
        <strong style="color: #F84565;">
          "${booking.show.movie.title}"
        </strong> is confirmed.
      </p>

      <p>
        <strong>Date:</strong> 
        ${new Date(booking.show.showDateTime).toLocaleDateString("en-US", {
        timeZone: "Asia/Kolkata",
      })}
        <br/>
        <strong>Time:</strong> 
        ${new Date(booking.show.showDateTime).toLocaleTimeString("en-US", {
        timeZone: "Asia/Kolkata",
      })}
      </p>

      <p>Enjoy the show! 🍿🍿🍿</p>

      <p>
        Thanks for booking with us! <br/>
        - From Astevion Hunter Team
      </p>
    </div>
  `,
    });
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  sendBookingConfirmationEmail,
  releaseSeatsAndDeleteBooking,
];
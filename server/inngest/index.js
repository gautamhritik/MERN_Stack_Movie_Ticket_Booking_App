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

  async ({ event }) => {
    const { userEmail, userName, movieTitle, showTime } = event.data;
    const subject = `Payment Confirmation: "${movieTitle}" booked!`;
    const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${userName},</h2>

        <p>
         Your booking for 
         <strong style="color: #F84565;">
           "${movieTitle}"
         </strong> is confirmed.
        </p>

        <p>
          <strong>Date:</strong> 
          ${new Date(showTime).toLocaleDateString("en-US", {
            timeZone: "Asia/Kolkata",
          })}
          <br/>
          <strong>Time:</strong> 
          ${new Date(showTime).toLocaleTimeString("en-US", {
            timeZone: "Asia/Kolkata",
          })}
        </p>

        <p>Enjoy the show! 🍿🍿🍿</p>

        <br/>

        <p>
          Thanks for booking with us! <br/>
          From Astevion Hunter Team
        </p>
      </div>
    `;

    await sendEmail({
      to: userEmail,
      subject,
      body,
    });

    return { message: "Email sent successfully" };
  }
);

// Inngest Function to send reminders every 8 hours
const sendShowReminders = inngest.createFunction(
  {
    id: "send-show-reminders",
    triggers: [{ cron: "*/5 * * * *" }], // every 5 minutes
  },
  async ({ step }) => {
    const now = new Date();

    const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);
    const windowEnd = new Date(in8Hours.getTime() + 10 * 60 * 1000);

    const shows = await step.run("prepare-reminder-tasks", async () => {
      const data = await Show.find({
        showDateTime: { $gte: windowStart, $lte: windowEnd },
        reminderSent: false, // only shows that haven't had reminders sent
      }).populate("movie");

      console.log("Now:", now);
      console.log("Target (8h):", in8Hours);
      console.log("Window:", windowStart, windowEnd);
      console.log("Shows found:", data.length);

      return data;
    });

    if (shows.length === 0) {
      return { sent: 0, message: "No reminders to send." };
    }

    let sent = 0;
    let failed = 0;

    for (const show of shows) {
      if (!show.movie || !show.occupiedSeats) continue;

      const userIds = [
        ...new Set(Object.values(show.occupiedSeats)),
      ];

      if (userIds.length === 0) continue;

      const users = await User.find({
        id: { $in: userIds }, // Clerk ID match
      }).select("name email");

      console.log(`Users found for show ${show._id}:`, users.length);

      if (users.length === 0) continue;

      const results = await Promise.allSettled(
        users.map((user) => {
          console.log("Sending email to:", user.email);

          return sendEmail({
            to: user.email,
            subject: `Reminder: Your movie "${show.movie.title}" starts in 8 hours`,
            body: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hello ${user.name},</h2>

                <p>This is a reminder for your upcoming movie:</p>

                <h3 style="color: #F84565;">
                  "${show.movie.title}"
                </h3>

                <p>
                  <strong>Date:</strong>
                  ${new Date(show.showDateTime).toLocaleDateString("en-US", {
                    timeZone: "Asia/Kolkata",
                  })}
                  <br/>
                  <strong>Time:</strong>
                  ${new Date(show.showDateTime).toLocaleTimeString("en-US", {
                    timeZone: "Asia/Kolkata",
                  })}
                </p>

                <p>
                  It starts in approximately <strong>8 hours</strong>.
                </p>

                <br/>

                <p>
                  Enjoy the show! <br/>
                  From Astevion Hunter Team
                </p>
              </div>
            `,
          });
        })
      );

      const successCount = results.filter(r => r.status === "fulfilled").length;
      const failCount = results.length - successCount;

      sent += successCount;
      failed += failCount;

      await Show.findByIdAndUpdate(show._id, {
        reminderSent: true,
      });

      console.log(`Show ${show._id} marked as reminderSent`);
    }

    console.log(`Emails sent: ${sent}, Failed: ${failed}`);

    return {
      sent,
      failed,
      message: `Sent ${sent} reminder(s), ${failed} failed.`,
    };
  }
);

// Inngest Function to send notifications when a new show is added
const sendNewShowNotifications = inngest.createFunction(
  {
    id: "send-new-show-notifications",
    triggers: { event: "app/show.added" },
  },
  async ({ event }) => {
    const { movieTitle } = event.data;

    const users = await User.find({});

    for (const user of users) {
      const userEmail = user.email;
      const userName = user.name;

      const subject = `New Show Added: ${movieTitle}`;

      const body = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                  <h2>Hi ${userName},</h2>

                  <p>We've just added a new show to our library:</p>

                  <h3 style="color: #F84565;">
                    "${movieTitle}"
                  </h3>

                  <p>Visit our website to explore show timings and book your seats.</p>

                  <br/>

                  <p>
                    Thanks,<br/>
                    From Astevion Hunter Team
                  </p>
                </div>
                `;

      await sendEmail({
        to: userEmail,
        subject,
        body,
      });
    }

    return { message: "Notifications sent successfully." };
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  sendBookingConfirmationEmail,
  releaseSeatsAndDeleteBooking,
  sendShowReminders,
  sendNewShowNotifications,
];
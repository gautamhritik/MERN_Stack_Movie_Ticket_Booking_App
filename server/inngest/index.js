import { User } from "@clerk/express";
import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

const syncUserCreation = inngest.createFunction(
    { id: "sync-user-from-clerk" },
    { event: "clerk/user.created" },
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

const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-with-clerk" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        const { id } = event.data;
        await User.findOneAndDelete({ id });
    }
);

const syncUserUpdation = inngest.createFunction(
    { id: "update-user-from-clerk" },
    { event: "clerk/user.updated" },
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

export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation
];
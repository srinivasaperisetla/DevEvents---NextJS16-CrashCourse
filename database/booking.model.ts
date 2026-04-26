import { Schema, model, models, Document, Types } from "mongoose";

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: (props: { value: string }) =>
          `"${props.value}" is not a valid email address`,
      },
    },
  },
  { timestamps: true }
);

// Verify the referenced event exists before persisting the booking
BookingSchema.pre("save", async function (next) {
  if (this.isModified("eventId")) {
    const Event = this.model("Event");
    const exists = await Event.exists({ _id: this.eventId });
    if (!exists) {
      return next(new Error(`Event with id "${this.eventId}" does not exist`));
    }
  }
  next();
});

// Speed up lookups by eventId (e.g. "all bookings for this event")
BookingSchema.index({ eventId: 1 });

const Booking = models.Booking ?? model<IBooking>("Booking", BookingSchema);

export default Booking;

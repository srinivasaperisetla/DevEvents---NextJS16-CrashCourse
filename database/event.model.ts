import { Schema, model, models, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: {
      type: String,
      required: true,
      enum: ["online", "offline", "hybrid"],
    },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) =>
          Array.isArray(v) && v.length > 0 && v.every((item) => typeof item === "string" && item.trim().length > 0),
        message: "agenda must contain at least one non-blank string",
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) =>
          Array.isArray(v) && v.length > 0 && v.every((item) => typeof item === "string" && item.trim().length > 0),
        message: "tags must contain at least one non-blank string",
      },
    },
  },
  { timestamps: true }
);

// Slug generation, date normalization, and field validation before every save
EventSchema.pre("save", function (next) {
  // Regenerate slug only when title changes (or on first save)
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!this.slug) {
      return next(new Error("Title cannot produce a valid slug — it must contain at least one alphanumeric character"));
    }
  }

  // Validate date is strict YYYY-MM-DD without re-parsing (avoids timezone-driven day shifts)
  if (this.isModified("date")) {
    if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(this.date)) {
      return next(new Error(`Invalid date format: "${this.date}" — expected YYYY-MM-DD`));
    }
  }

  // Normalize time to HH:MM 24-hour format
  if (this.isModified("time")) {
    const timeMatch = this.time.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i
    );
    if (!timeMatch) {
      return next(new Error(`Invalid time format: "${this.time}"`));
    }

    let hours = parseInt(timeMatch[1], 10);
    const mins = parseInt(timeMatch[2], 10);
    const period = timeMatch[3]?.toUpperCase();

    if (mins < 0 || mins > 59 ||
        (period && (hours < 1 || hours > 12)) ||
        (!period && (hours < 0 || hours > 23))) {
      return next(new Error(`Invalid time format or out-of-range time: "${this.time}"`));
    }

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    this.time = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }

  // Guard against empty-string required fields that bypass Mongoose's `required`
  const requiredStrings: (keyof IEvent)[] = [
    "title", "description", "overview", "image",
    "venue", "location", "date", "time", "mode",
    "audience", "organizer",
  ];

  for (const field of requiredStrings) {
    const value = this.get(field);
    if (typeof value === "string" && value.trim().length === 0) {
      return next(new Error(`"${field}" must not be empty`));
    }
  }

  next();
});

EventSchema.index({ slug: 1 }, { unique: true });

const Event = models.Event ?? model<IEvent>("Event", EventSchema);

export default Event;

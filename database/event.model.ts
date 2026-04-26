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
    agenda: { type: [String], required: true, validate: (v: string[]) => v.length > 0 },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true, validate: (v: string[]) => v.length > 0 },
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
  }

  // Normalize date to ISO 8601 (YYYY-MM-DD)
  if (this.isModified("date")) {
    const parsed = new Date(this.date);
    if (isNaN(parsed.getTime())) {
      return next(new Error(`Invalid date value: "${this.date}"`));
    }
    this.date = parsed.toISOString().split("T")[0];
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
    const minutes = timeMatch[2];
    const period = timeMatch[3]?.toUpperCase();

    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    this.time = `${String(hours).padStart(2, "0")}:${minutes}`;
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

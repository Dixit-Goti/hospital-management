import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: [2, "Medicine name must be at least 2 characters"],
    },
    strength: {
      type: String,
      required: true,
      trim: true,
      minLength: [1, "Strength must be at least 1 character"],
    },
    form: {
      type: String,
      required: true,
      trim: true,
      minLength: [1, "Form must be at least 1 character"],
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
medicineSchema.index({ name: 1 });
medicineSchema.index({ name: 1, strength: 1, form: 1 }, { unique: true });

// Pre-save hook to normalize name to lowercase
medicineSchema.pre("save", function (next) {
  if (this.name) {
    this.name = this.name.toLowerCase();
  }
  next();
});

// Pre-find hook to exclude deleted medicines
medicineSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;

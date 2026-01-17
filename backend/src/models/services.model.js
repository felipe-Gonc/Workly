import mongoose from "mongoose";

const servicesSchema = mongoose.Schema(
  {
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    typeProvider: {
      type: String,
      required: true,
    },
    applicants: [
      {
        providerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        message: {
          type: String,
          maxlength: 500,
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "canceled"],
      default: "open",
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", servicesSchema);

export default Service;

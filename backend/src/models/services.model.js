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
      required: true,
    },
    titleService: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
      required: true,
    },
    descriptionService: {
      type: String,
      required: true,
    },
    typeProvider: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", servicesSchema)

export default Service;

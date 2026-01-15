import mongoose from "mongoose";

const citySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    numero: {
      type: String,
    },
    complemento: {
      type: String,
    },
    bairro: {
      type: String,
    },
    cidade: {
      type: String,
    },
    estado: {
      type: String,
      maxlength: 2,
      minlength: 2,
    },
    cep: {
      type: String,
    },
  },
  { timestamps: true }
);

const City = mongoose.model("City", citySchema);

export default City;

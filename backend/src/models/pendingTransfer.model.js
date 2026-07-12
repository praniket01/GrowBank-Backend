import mongoose from "mongoose";

const pendingTransferSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },

    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
      required: true,
    },

    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "accounts",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: {
        expires: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const pendingTransferModel = mongoose.model(
  "pendingTransfer",
  pendingTransferSchema
);

export default pendingTransferModel;
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must contain sender's account"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "account",
        required: [true, "Transaction must contain receiver's account"],
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
            message: "status can be either pending,failed,completed,reversed"
        },
        default: "PENDING"
    },
    amount: {
        type: Number,
        required: [true, "Amount is compulsary field"],
        min: [0, "Transactio cannot contain -ve values"]
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency key is required for creating a transaction"],
        index: true,
        unique: true
    }
},
    {
        timestamps: true
    });

const transactionModel = mongoose.model("transaction", transactionSchema);

export default transactionModel;
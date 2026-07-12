import mongoose, { mongo } from "mongoose";

const otpSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "OTP must beloing to a user" ],
        index: true
    }
    ,
    otpHash: {
        type: String,
        requiered: [true, "OTP hash is required" ],
    },
    expiresAt: {
        type: Date,
        requiered: true,
        index: {
            expires: 0,
        }
    },
    attempts: {
        type: Number,
        default: 0,
        min: 0,

    },
}, {
    timestamps: true
}
)


const transactionOtpModel = mongoose.model("transactionOtp", otpSchema);

export default transactionOtpModel;
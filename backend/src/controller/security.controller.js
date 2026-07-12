import userModel from "../models/user.model.js";
import transactionOtpModel from "../models/transactionOtp.model.js";
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sendEmail, transactionOtpTemplate } from "../services/email.service.js";
import transactionModel from "../models/transaction.model.js";
import pendingTransferModel from "../models/pendingTransfer.model.js";
import accountModel from "../models/account.model.js";
import mongoose from "mongoose";
import ledgerModel from "../models/ledger.model.js";

export const setTransactionPin = async (req, res, next) => {
    try {
        const { pin, confirmPin } = req.body;

    if (!pin || !confirmPin) {
        return res.status(400).json({
            success: false,
            message: "PIN and confirm PIN are required"
        })
    }

    if (pin != confirmPin) {
        return res.status(400).json({
            success: false,
            message: "PIN and confirm PIN do not match"
        })
    }

    if (!/^\d{6}$/.test(pin)) {
        return res.status(400).json({
            success: false,
            message: "PIN must be exactly 6 digits"
        })
    }

    const user = await userModel.findById(req.user._id).select("+transactionPin");

    if (!user) {
        return res.status(400).json({
            success: false,
            message: "User not found"
        })
    }

    if (user.transactionPin) {
        return res.status(400).json({
            success: false,
            message: "Transaction pin already exists"
        })
    }

    user.transactionPin = pin;

    await user.save();

    return res.status(200).json({
        success: false,
        message: "Pin saved successfully"
    })
    } catch (error) {
        console.log(error);
    }

}

export const verifyTransactionPin = async (req, res, next) => {
    try {
        const { pin } = req.body;
        console.log("pin : ", pin);
        if (!pin) {
            return res.status(400).json({
                success: false,
                message: "Transaction pin is Required"
            })
        }

        const userPresent = await userModel.findById(req.user._id)
            .select("+transactionPin");


        if (!userPresent) {
            return res.status(400).json({
                success: false,
                message: "User not Found"
            })
        }
        const valid = await userPresent.compareTransactionPin(pin);
        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Invalid Transaction Pin"
            })
        }
        return res.status(200).json({
            success: true
        });

    } catch (error) {
        next(error);
    }


}

export const verifyTransactionOtp = async (req, res, next) => {
    try {
        const { otp } = req.body;
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required"
            })
        }
        const transactionOtp = await transactionOtpModel.findOne({
            user: req.user._id
        });

        if (!transactionOtp) {
            return res.status(400).json({
                success: false,
                message: "OTP not found. Please request a new OTP."
            })
        }

        if (transactionOtp.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            })
        }

        const isValid = await bcrypt.compare(
            otp,
            transactionOtp.otpHash
        );

        if (!isValid) {
            transactionOtp.attempts += 1;
            if (transactionOtp.attempts >= 3) {
                await transactionOtp.deleteOne();

                return res.status(400).json({
                    success: false,
                    message: "Maximum attempts exceeded. Please request a new otp"
                })
            }

            await transactionOtp.save();

            return res.status(400).json({
                success: false,
                message: `Invalid OTP. ${3 - transactionOtp.attempts
                    } attempts remaining.`
            })
        }


        const pendingTransfer = await pendingTransferModel.findOne({
            user: req.user._id
        });

        console.log("Pending Transfer", pendingTransfer);
        if (!pendingTransfer) {
            return res.status(404).json({
                success: false,
                message: "Pending transfer not found"
            });
        }

        const fromUserAccount = await accountModel.findById(
            pendingTransfer.fromAccount
        );

        const toUserAccount = await accountModel.findById(
            pendingTransfer.toAccount
        );

        console.log("From accout : ", fromUserAccount, "To user account : ", toUserAccount);

        if (!fromUserAccount || !toUserAccount) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        try {
            const session = await mongoose.startSession();

            try {

                session.startTransaction();

                const transaction = (
                    await transactionModel.create([{
                        fromAccount: fromUserAccount._id,
                        toAccount: toUserAccount._id,
                        amount: pendingTransfer.amount,
                        idempotencyKey: pendingTransfer.idempotencyKey,
                        status: "PENDING"
                    }], { session })
                )[0];

                await ledgerModel.create([{
                    account: fromUserAccount._id,
                    amount: pendingTransfer.amount,
                    transaction: transaction._id,
                    type: "DEBIT"
                }], { session });

                await ledgerModel.create([{
                    account: toUserAccount._id,
                    amount: pendingTransfer.amount,
                    transaction: transaction._id,
                    type: "CREDIT"
                }], { session });

                await transactionModel.findByIdAndUpdate(
                    transaction._id,
                    {
                        status: "COMPLETED"
                    },
                    {
                        session
                    }
                );

                await session.commitTransaction();

                await pendingTransfer.deleteOne();

                await transactionOtp.deleteOne();

                return res.status(200).json({
                    success: true,
                    message: "Transfer Successful",
                    transaction
                });

            } catch (error) {

                await session.abortTransaction();

                throw error;

            } finally {

                session.endSession();

            }
        } catch (error) {
            console.log(error);
        }


    } catch (error) {
        console.log(error);
        next(error);
    }
}

export const sendTransactionOtp = async (
    req,
    res,
    next
) => {
    try {
        const user = await userModel.findById(req.user._id);
        console.log("Requested user ", user);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not Found"
            })
        }

        await transactionOtpModel.deleteMany({
            user: req.user._id,
        });

        const otp = crypto.randomInt(100000, 999999).toString();

        const otpHash = await bcrypt.hash(otp, 10);

        const expiresAt = new Date(
            Date.now() + 2 * 60 * 1000
        );

        await transactionOtpModel.create({
            user: req.user._id,
            otpHash,
            expiresAt
        });

        console.log("User Present", user.email);
        await sendEmail(user.email
            , "Growbank Transaction Verification",
            "Please find you OTP below",
            `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px">

      <h2 style="color:#1E3A8A;">
        GrowBank
      </h2>

      <p>Hello <strong>${user.name}</strong>,</p>

      <p>
        You are attempting to authorize a secure transaction.
      </p>

      <p>
        Your One-Time Password is:
      </p>

      <div
        style="
          font-size:32px;
          font-weight:bold;
          letter-spacing:8px;
          padding:20px;
          text-align:center;
          background:#F3F4F6;
          border-radius:8px;
        "
      >
        ${otp}
      </div>

      <p>
        This OTP will expire in
        <strong>2 minutes</strong>.
      </p>

      <p>
        If you did not request this transaction,
        please ignore this email.
      </p>

      <br/>

      <p>
        Regards,<br/>
        <strong>GrowBank Security Team</strong>
      </p>

    </div>
  `,
        );

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });
    } catch (error) {
        next(error);
    }
}
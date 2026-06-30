import transactionModel from "../models/transaction.model.js";
import ledgerModel from "../models/ledger.model.js";
import accountModel from "../models/account.model.js";
import mongoose from "mongoose";
import sendTransactionEmail from "../services/email.service.js";

async function createTransaction(req, res) {
    //Request Validation
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "Please enter all required fields"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user : fromAccount
    })

    const toUserAccount = await accountModel.findOne({
        user : toAccount
    })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid from and to accounts"
        })
    }


    //Idempotency key validation
    const transactionExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    });

    if (transactionExists) {
        if (transactionExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction Already completed",
                transaction: transactionExists
            })
        }

        if (transactionExists.status === "PENDING") {
            return res.status(200).json({
                message: "Transaction is in pending state",
            })
        }

        if (transactionExists.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction failed",
            })
        }

        if (transactionExists.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction Already Reversed",
            })
        }
    }

    //Check accouint status
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "From and to user account should be in active state"
        })
    }

    //Get sender balance from ledger
    const balance = await fromUserAccount.getBalance();
    console.log("Balance", balance);
    if (balance < amount) {
        return res.status(400).json({
            message: "Insufficient balance."
        })
    }

    let transaction;

    try {

        //Transaction creatioin
        const session = await mongoose.startSession();
        session.startTransaction();

        transaction = (await transactionModel.create([{
            fromAccount:fromUserAccount._id,
            toAccount:toUserAccount._id,
            amount,
            idempotencyKey,
            status : "PENDING"
        }],{ session } ))[0]

        const debitLedgerEntry = await ledgerModel.create([{
            account : fromUserAccount._id,
            amount : amount,
            transaction : transaction._id,
            type : "DEBIT"
        }], {session})

        const creditLedgerEntry = await ledgerModel.create([{
            account : toUserAccount._id,
            amount : amount,
            transaction : transaction._id,
            type : "CREDIT"
        }], {session})

        await transactionModel.findOneAndUpdate(
            { _id : transaction._id},
            { status : "COMPLETED"},
            { session }
        );

        await session.commitTransaction()
        session.endSession();

    } catch (error) {
        return res.status(400).json({
            message : "Issue occured"
        })
    }

    await sendTransactionEmail(req.user.email, req.user.name, amount ,toAccount);

    return res.status(201).json({
        message : "Transaction completed successfully",
        transaction : transaction
    });
}


async function createInitialFunds(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        user : toAccount,
    });
    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }
    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })
    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount : toUserAccount._id,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([ {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    } ], { session })

    const creditLedgerEntry = await ledgerModel.create([ {
        account: toUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    } ], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })


}

export {createTransaction,createInitialFunds};
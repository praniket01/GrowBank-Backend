import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
    account : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "account",
        required : [true,"Ledger must be associated with an account"],
        index : true,
        immutable : true
    },
    amount : {
        type : Number,
        required : [true, "amount is necessary to enter a ledger"],
        immutable : true
    },
    transaction : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "transaction",
        required : [true,"Ledger must be associated with a transaction"],
        index : true,
        immutable : true
    },
    type :{
        type: String,
        enum : {
            values : ["CREDIT", "DEBIT"],
            message : "Type can either be credit or debit"
        },
        required : [true, "Ledger type is required"],
        immutable : true
    }

})

function preventLedgerChanges(){
    throw new Error("Ledger cannot be changed");
}


ledgerSchema.pre('findOneAndUpdate', preventLedgerChanges);
ledgerSchema.pre('UpdateOne', preventLedgerChanges);
ledgerSchema.pre('findOneAndDelete', preventLedgerChanges);
ledgerSchema.pre('remove', preventLedgerChanges);
ledgerSchema.pre('deleteMany', preventLedgerChanges);
ledgerSchema.pre('deleteOne', preventLedgerChanges);
ledgerSchema.pre('findOneAndReplace', preventLedgerChanges);
ledgerSchema.pre('updateMany', preventLedgerChanges);


const ledgerModel = mongoose.model('ledger', ledgerSchema);

export default ledgerModel;
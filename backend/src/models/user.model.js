import mongoose from "mongoose";
import bcrypt from "bcrypt"



const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email field is compulsary"],
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/],
        unique: [true, "Email already exists"]
    },
    name: {
        type: String,
        required: [true, "Name field is compulsary"]
    },
    hasTransactionPin :{
        type : Boolean,
        default : false,
    },
    systemuser: {
        type: Boolean,
        default: false,
        immutable: true,
        select: false
    },
    password: {
        type: String,
        required: [true, "Password field is required"],
        minlength: [6, "Password should be of atleast length 6 letters"],
        select: false
    },
    transactionPin: {
        type: String,
        select: false
    },

}, {
    timestamps: true
})

userSchema.pre("save", async function () {

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    if (this.isModified("transactionPin") && this.transactionPin) {
        this.transactionPin = await bcrypt.hash(
            this.transactionPin,
            10
        );
    }

});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.compareTransactionPin = async function (pin) {
        console.log("From PIN : ",pin, "Compare with pin : ",this.transactionPin);
        return await bcrypt.compare(pin, this.transactionPin)
    }

const userModel = mongoose.model("user", userSchema);

export default userModel;
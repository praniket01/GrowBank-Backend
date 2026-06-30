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
    systemuser : {
        type : Boolean,
        default : false,
        immutable : true,
        select : false
    },
    password: {
        type: String,
        required: [true, "Password field is required"],
        minlength: [6, "Password should be of atleast length 6 letters"],
        select: false
    },

}, {
    timestamps: true
})


userSchema.pre("save", async function () {
    console.log("Password before hashing:", this.password);

    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.model("user", userSchema);

export default userModel;
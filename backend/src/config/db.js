import mongoose from "mongoose";
import 'dotenv/config'

const connectToDb = () =>{
    console.log(process.env.MONGOOSE_CONNECTION_STRING);
    mongoose.connect(process.env.MONGOOSE_CONNECTION_STRING)
    .then(() => {
        console.log('Connected to db')
    })
    .catch(err => {
        console.log(err);
        process.exit(1);
    })
}

export default connectToDb;
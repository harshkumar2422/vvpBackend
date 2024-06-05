import mongoose, { mongo } from "mongoose";


const connectDb = () => {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log("mongodb is connected");
    }).catch((e) => {
        console.log("Disconnected",e);
    })
}
export default connectDb;
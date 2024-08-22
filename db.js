// Mongoose
import mongoose from "mongoose";

export default async () => {
    try {
        await mongoose.connect(
            process.env.DB_URL,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });

        console.log("Database connected successfully");
    } catch (error) {
        console.log(`Error connecting to database: ${error}`);
    }
}
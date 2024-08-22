// Mongoose
import mongoose from "mongoose";

// Mongoose Paginate v2
import mongoosePaginate from "mongoose-paginate-v2";

// Constants
import { ROLES } from "../../constants/roles.js";

/**
 * @description Defines the user's account schema
 */
const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true,
        min: 2,
        max: 255
    },
    last_name: {
        type: String,
        required: true,
        min: 2,
        max: 255
    },
    email: {
        type: String,
        required: true,
        min: 2,
        max: 255
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024
    },
    phone: {
        type: String,
        min: 7,
        max: 15
    },
    role: {
        type: String,
        required: true,
        default: ROLES.STUDENT
    },
    about_me: {
        type: String,
        min: 2,
        max: 1024
    },
    school_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School"
    },
    current_class: {
        type: String,
        min: 2,
        max: 255
    },
    token: {
        type: String,
        min: 2,
        max: 1024
    },
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

userSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", userSchema);
export default User;
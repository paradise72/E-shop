import mongoose, {Document, Schema} from "mongoose";
export interface IUser extends Document{
    name: string,
    email: string,
    password: string,
    role:"Customer" | "Seller" | "Admin",
    resetCode?: string;
    resetCodeExpires?: Date;
}

const userSchema = new Schema<IUser>({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type:String,
        enum:["Customer","Seller","Admin"],
        required: true,
        default:"Customer"
    },
    resetCode: {
        type: String
    },

    resetCodeExpires: {
        type: Date
    }

},{
    timestamps: true
})

export const userModel = mongoose.model<IUser>("User",userSchema)
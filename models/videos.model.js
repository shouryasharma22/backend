import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-paginate-v2';

const videoSchema = new mongoose.Schema(
    {
        videoFile:{
            type: String, //cloudinary url
            required: true
        },
        thumbnail:{ 
            type: String, //cloudinary url
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        duration: {
            type: String,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },  
        duration: {
            type: Number,
            required: true 
        },         
        isPublished: {
            type: Boolean,  
            default:true  
            },
        owner:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
},
{timestamps: true});

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)
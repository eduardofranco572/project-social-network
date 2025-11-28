import mongoose, { Schema, model, models, Model } from 'mongoose';

interface IMediaItem {
    url: string;  
    type: string;
}

interface IPost {
    media: IMediaItem[];   
    description?: string;
    authorId: number;
    likes: number[];
    autoTags: string[];
    createdAt: Date;
}

const PostSchema = new Schema<IPost>({
    media: [
        {
            url: { type: String, required: true },
            type: { type: String, required: true }
        }
    ],

    description: { type: String },
    authorId: { type: Number, required: true },
    likes: { type: [Number], default: [] },
    autoTags: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
});

PostSchema.index({ description: 'text', autoTags: 'text' });
PostSchema.index({ authorId: 1, createdAt: -1 });

const Post = (models.Post as Model<IPost>) || model<IPost>('Post', PostSchema);

export default Post;
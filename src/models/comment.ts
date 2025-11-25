import mongoose, { Schema, model, models, Model } from 'mongoose';

interface IComment {
    postId: string;
    userId: number;
    text: string;
    parentId?: string | null;
    createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
    postId: { 
        type: String, 
        required: true,
        index: true
    },

    userId: { 
        type: Number, 
        required: true 
    },

    text: { 
        type: String, 
        required: true 
    },

    parentId: {
        type: String,
        default: null
    },


    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

const Comment = (models.Comment as Model<IComment>) || model<IComment>('Comment', CommentSchema);

export default Comment;
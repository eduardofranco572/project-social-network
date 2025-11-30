import mongoose, { Schema, model, Model } from 'mongoose';

interface IComment {
    postId: string;
    userId: number;
    userName: string;
    userPhoto: string;
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

    userName: { 
        type: String, 
        required: true 
    },

    userPhoto: { 
        type: String, 
        default: '/img/iconePadrao.svg' 
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

const Comment = (mongoose.models.Comment as Model<IComment>) || model<IComment>('Comment', CommentSchema);

export default Comment;
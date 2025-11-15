import mongoose, { Schema, model, models, Model } from 'mongoose';

// Status
interface IStatus {
    mediaUrl: string;    
    mediaType: string;   
    description?: string;
    authorId: number;  
    createdAt: Date;
}

const StatusSchema = new Schema<IStatus>({
    mediaUrl: { 
        type: String, 
        required: true 
    },
    mediaType: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    authorId: { 
        type: Number, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});


StatusSchema.index({ authorId: 1, createdAt: -1 });

const Status = (models.Status as Model<IStatus>) || model<IStatus>('Status', StatusSchema);

export default Status;
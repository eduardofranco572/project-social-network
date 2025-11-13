import mongoose, { Schema, model, models, Model } from 'mongoose';

interface ITesteMongo {
    name: string;
    createdAt: Date;
}

const TesteMongoSchema = new Schema<ITesteMongo>({
    name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const TesteMongo = (models.TesteMongo as Model<ITesteMongo>) || model<ITesteMongo>('TesteMongo', TesteMongoSchema);

export default TesteMongo;
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  apifyApiKey?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  aiPrompt?: string;
  apolloApiKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    apifyApiKey: { type: String, required: false },
    geminiApiKey: { type: String, required: false },
    geminiModel: { type: String, required: false, default: 'gemini-2.5-flash' },
    aiPrompt: { type: String, required: false },
    apolloApiKey: { type: String, required: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

import connectToDatabase from '@/app/lib/db';
import User from '@/app/models/User';

export class SettingsService {
  static async getAdminConfig() {
    await connectToDatabase();
    return await User.findOne({ role: 'admin' });
  }

  static async getSettings(email: string) {
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    return user;
  }

  static async updateSettings(email: string, updates: any) {
    await connectToDatabase();

    const updateData: Record<string, any> = {};
    if (updates.aiPrompt !== undefined) updateData.aiPrompt = updates.aiPrompt;
    if (updates.apifyApiKey !== undefined) updateData.apifyApiKey = updates.apifyApiKey;
    if (updates.geminiApiKey !== undefined) updateData.geminiApiKey = updates.geminiApiKey;
    if (updates.geminiModel !== undefined) updateData.geminiModel = updates.geminiModel;

    const user = await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!user) throw new Error('User not found');
    return user;
  }
}

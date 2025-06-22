import mongoose from 'mongoose';

export async function initMongoConnection() {
  const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URL}/${process.env.MONGODB_DB}?retryWrites=true&w=majority`;

  try {
    console.log(
      '✅ ENV values:',
      process.env.MONGODB_USER,
      process.env.MONGODB_URL,
      process.env.MONGODB_DB,
    );
    await mongoose.connect(uri);
    console.log('✅ Mongo connection successfully established!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

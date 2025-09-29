import mongoose from 'mongoose';
import { config } from './config.js';

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongodb.uri, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
        });
        
        console.log('✅ MongoDB connected successfully');
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
        });
        
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed through app termination');
            process.exit(0);
        });
        
        return true; // Connection successful
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        console.log('🔄 Falling back to in-memory storage (data will not persist)');
        
        // Don't exit, continue with in-memory storage
        return false;
    }
};

export default connectDB;

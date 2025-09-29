import dotenv from 'dotenv';

dotenv.config();

export const config = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/compilex'
    },
    server: {
        port: process.env.PORT || 3000
    },
    environment: process.env.NODE_ENV || 'development'
};

export default config;


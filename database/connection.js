import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connection = async () => {
    try {
        let db_url = process.env.MONGO_URI;
       return  await mongoose.connect(db_url);

    } catch (error) {
        console.log('Error connecting to the database');
    }
}
export default connection;
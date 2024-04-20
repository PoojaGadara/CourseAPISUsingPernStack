import express from 'express';
import userRoute from './routes/userRoute.js';
import getClient from './database.js';
import courseRoute from './routes/courseRoute.js'
import fileUpload from 'express-fileupload';
import cloudinary from 'cloudinary'

const app = express()
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(fileUpload())


const connectDB = async () => {
    try{
        const port = process.env.PORT || 3000; // Default port or use a specific port from environment variable
        await getClient; // Call getClient function to establish connection
        app.listen(port, () => {
            console.log(`NEW App running on port ${port}...`);
            console.log("Function called Successfull")
        });
    }catch(err){
        console.log(err)
    }
}
try {
    connectDB();
  } catch (err) {
    console.log('Failed to connect to MongoDB 2', err);
    try {
      connectDB();
    } catch (err) {
      console.log('Failed to connect to MongoDB 3', err);
      process.exit(0);
    }
  }

  cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.API_KEY,
    api_secret : process.env.SECRET_KEY
})


app.enable('trust proxy')

app.use('/api/user',userRoute)
app.use('/api/course',courseRoute)

export default app
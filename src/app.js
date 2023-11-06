import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';


const app =express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))


app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))   //for handling URL-encoded data in the request body
app.use(express.static("public"))      //serve static files such as HTML, CSS, JavaScript, images, and other assets from a specific directory
app.use(cookieParser())






export{app}
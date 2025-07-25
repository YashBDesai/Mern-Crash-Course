import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Product from "./models/product.model.js";
import mongoose from "mongoose";
import productRoutes from "./routes/product.route.js";
import cors from "cors";
import path from "path";
import fs from "fs";

dotenv.config();

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Environment check:", process.env.NODE_ENV === "production");

const app = express();
const PORT = process.env.PORT || 5000;


const __dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use("/api/products", productRoutes);

// Production setup - check multiple ways
const isProduction =
  process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod";
console.log("Is production mode:", isProduction);

 if (isProduction) {
   const buildPath = path.join(__dirname, "Frontend", "dist"); // 🔄 changed 'build' → 'dist'
   const indexPath = path.resolve(__dirname, "Frontend", "dist", "index.html");

   console.log("Build path:", buildPath);
   console.log("Index path:", indexPath);

   // Check if build folder exists
   if (fs.existsSync(buildPath)) {
     console.log("✅ Dist folder exists");

     // Check if index.html exists
     if (fs.existsSync(indexPath)) {
       console.log("✅ index.html exists");
     } else {
       console.log("❌ index.html NOT found");
     }

     // List files in dist directory
     const buildFiles = fs.readdirSync(buildPath);
     console.log("Files in dist folder:", buildFiles);
   } else {
     console.log("❌ Dist folder does NOT exist");
     console.log("Please run 'npm run build' first in Frontend/");
   }

   // Serve static files from the React app dist directory
   app.use(express.static(buildPath));

   // Test route
   app.get("/api/test", (req, res) => {
     res.json({ message: "Server is working!", buildPath, indexPath });
   });

   // Catch-all for frontend routes
   app.get("*", (req, res) => {
     console.log("Catch-all route hit for:", req.url);

     if (fs.existsSync(indexPath)) {
       console.log("Serving index.html");
       res.sendFile(indexPath);
     } else {
       console.log("index.html not found, sending error");
       res
         .status(404)
         .send("Dist files not found. Please run 'npm run build' first.");
     }
   });
 } else {
   // Development route
   app.get("/", (req, res) => {
     res.send("API is running in development mode");
   });
 }

// Start server
app.listen(PORT, () => {
  connectDB();
  console.log(`Server started at http://localhost:${PORT}`);
});

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import connectDB from "./config/db.js";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import projectRoute from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";    
import tempTimeRoutes from "./routes/tempTimeRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";

import "./services/deadlineReminder.js";
import "./services/updateExperience.js";

const app = express();

// Allow multiple origins for frontend
// const allowedOrigins = [
//   'http://localhost:5173',
//   'https://anushtaan.ganglia.in'
//   'http://localhost:5173'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }));

app.use(cors({ origin: "*" }));
app.use(cors({ origin: 'http://localhost:5173' }));

app.use(bodyParser.json());
app.use(express.json());

connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/api", authRoutes);
app.use("/api", projectRoute);
app.use("/api", taskRoutes);
app.use("/api", uploadRoutes);
app.use("/api", tempTimeRoutes);
app.use("/api", notificationRoutes);
app.use("/admin", adminRoutes);
app.use("/requests", requestRoutes);

app.listen(5000, () => console.log("Server has started"));

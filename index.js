// Express imports
import express from "express";
const app = express();
import routes from "./routes/index.js";

// Get HTTP status codes and messages
import { HTTP_STATUS_CODES, HTTP_STATUS_MESSAGES } from "./constants/status.js"; 

// Configure dotenv for accessing environment variables
import dotenv from "dotenv";
dotenv.config();

// Configure CORS for Cross Origin Resource Sharing
import cors from "cors";
app.use(cors());

// Set default port if environment doesn't have port
const PORT = process.env.PORT || 3000;

// Connect to Database
// const connectToDatabase = require("./db");
import connectToDatabase from "./db.js";
connectToDatabase();

// Ping cache
// const { pingRedis } = require("./cache");
// pingRedis();

// Configure middleware
app.use(express.json());

app.use("/api", routes);

// Listen to port
app.listen(PORT, () => {
    console.log(`Server listenning at port: ${PORT}`);
});

// Get the root / initial route
app.get("/", (req, res) => {
    res.status(HTTP_STATUS_CODES.OK)
        .send({
            status: HTTP_STATUS_MESSAGES.SUCCESS,
            message: `App running at port ${PORT}`
        });
});

// Import Routes
// const authRoute = require("./routes/auth/Auth");
// const accountRoute = require("./routes/account/Account");
// const tradeRoute = require("./routes/trade/Trade");
// const orderRoute = require("./routes/order/Order");
// const reviewRoute = require("./routes/review/Review");
// const { router: transactionRoute } = require("./routes/transaction/Transaction");
// const profileRoute = require("./routes/profile/Profile");
// const adminRoute = require("./routes/admin/Admin");
// const noticeRoute = require("./routes/notice/Notice");
// const faqRoute = require("./routes/faq/FAQ");
// const webhooksRoute = require("./routes/webhooks/Webhooks");

// // Authentication
// app.use("/api/auth", authRoute);

// // Account
// app.use("/api/account", accountRoute);

// // Trade
// app.use("/api/trade", tradeRoute);

// // Order
// app.use("/api/order", orderRoute);

// // Review
// app.use("/api/review", reviewRoute);

// // Transaction
// app.use("/api/transaction", transactionRoute);

// // Webhooks
// app.use("/api/profile", profileRoute);

// // Admin
// app.use("/api/admin", adminRoute);

// // Notice
// app.use("/api/notice", noticeRoute);

// // FAQ
// app.use("/api/faq", faqRoute);

// // Webhooks
// app.use("/api/webhooks", webhooksRoute);

// Error Handling Middleware
import { errorHandler } from "./middleware/error.js";
// const { errorHandler } = require("./middleware/error");
app.use(errorHandler);
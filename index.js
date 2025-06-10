const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cors = require("cors");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const productRoutes = require("./routes/productroutes");
const brandRoutes = require("./routes/brandroutes");
const user_producerRoutes = require("./routes/user_producerroutes");
const stampRoutes = require("./routes/stamproutes");
const unity_dataroutes = require("./routes/unity_dataroutes");
const notificationsRoutes = require("./routes/notificationsroutes");
const adminRoutes = require("./routes/user_adminroutes");
const purchase_orderroutes = require("./routes/purchase_orderroutes");
const user_buyerRoutes = require("./routes/user_buyerroutes");
const primary_packagingRoutes = require("./routes/primary_packagingroutes");
const chatRoutes = require("./routes/chatroutes");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/product", productRoutes);
app.use("/brand", brandRoutes);
app.use("/user_producer", user_producerRoutes);
app.use("/stamp", stampRoutes);
app.use("/unity_data", unity_dataroutes);
app.use("/notifications", notificationsRoutes);
app.use("/user_admin", adminRoutes);
app.use("/purchase_order", purchase_orderroutes);
app.use("/user_buyer", user_buyerRoutes);
app.use("/primary_packaging", primary_packagingRoutes);
app.use("/chat", chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

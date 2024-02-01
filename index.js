/* READ ME BEFORE YOUR START



**********Import Postman files included in folder to postman for easier and quicker tests*********


 Enjoy :D

Made By : Ahmed Samy Nashaat
For : Node Js Project Eng Nourhan

*/
import "dotenv/config";
import express from "express";
import initConnection from "./DB/initConnection.js";
import userRoutes from "./src/modules/users/user.routes.js";
import productRoutes from "./src/modules/products/product.routes.js";
import categoryRoutes from "./src/modules/categories/category.routes.js";
import couponRoutes from "./src/modules/coupons/coupon.routes.js";
import cartRoutes from "./src/modules/carts/cart.routes.js";
import orderRoutes from "./src/modules/orders/order.routes.js";
import cors from "cors";

const server = express();
server.use(cors());
server.use(express.json());
initConnection();

server.use(userRoutes);
server.use(productRoutes);
server.use(categoryRoutes);
server.use(couponRoutes);
server.use(cartRoutes);
server.use(orderRoutes);

server.listen(3000);

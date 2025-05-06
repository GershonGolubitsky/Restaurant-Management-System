import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";

import tableController from "./controllers/tableController";
import WorkDayController from "./controllers/workDayController";
import dinerOrdersController from './controllers/dinerOrdersController';
import menuController from './controllers/menuController';
import dinerOrdersDishesController from './controllers/dinerOrdersDishesController';
import dishesCategoriesController from './controllers/dishesCategoriesController';
import inventory from './controllers/inventoryController';
import supplierOrder from './controllers/supplierOrderController';
import suppliers from './controllers/suppliersController';
import login from './controllers/loginController';
import products from './controllers/productController';
import users from './controllers/usersController';
import sendEmail from './controllers/sendEmailController';

const app = express();
const port = process.env.PORT || 8888;

// 🛡️ Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🖼️ Serve static files (user images)
app.use('/users/img', express.static(path.join('users_images')));

// 📦 API Routes
app.use("/tables", tableController);
app.use("/work_day", WorkDayController);
app.use('/diners_orders', dinerOrdersController);
app.use('/dishes', menuController);
app.use('/diners_orders_dishes', dinerOrdersDishesController);
app.use("/dishes_categories", dishesCategoriesController);
app.use("/inventory", inventory);
app.use("/supplierOrder", supplierOrder);
app.use("/suppliers", suppliers);
app.use("/login", login);
app.use("/products", products);
app.use("/users", users);
app.use("/sendEmail", sendEmail);

// 🖥️ Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

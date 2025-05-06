import { Router, Request, Response } from "express";
import db from "../dbObj"; // לוודא שיש לך dbObj

const router = Router();

// חדש לגמרי: קבלת מנות עם רכיבים + זמינות מלאי
router.get("/with-inventory", async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        d.id AS dish_id,
        d.name AS dish_name,
        d.price,
        d.picture,
        d.description,
        d.category_id,
        di.inventory_id,
        i.name AS inventory_name,
        di.quantity AS quantity_needed,
        i.quantity AS quantity_available
      FROM dishes d
      LEFT JOIN dishes_inventory di ON d.id = di.dish_id
      LEFT JOIN inventory i ON di.inventory_id = i.id
      WHERE d.in_stock >= 0;
    `;
    db.query(query, (error: any, rows: any[]) => {
      if (error) {
        console.error("❌ Error fetching dishes with inventory:", error);
        return res.status(500).json({ error: error.message });
      }
      const groupedDishes: any = {};

      for (const row of rows) {
        if (!groupedDishes[row.dish_id]) {
          groupedDishes[row.dish_id] = {
            id: row.dish_id,
            name: row.dish_name,
            price: row.price,
            picture: row.picture,
            description: row.description,
            category_id: row.category_id,
            products: [],
          };
        }
        if (row.inventory_id) {
          groupedDishes[row.dish_id].products.push({
            inventory_id: row.inventory_id,
            inventory_name: row.inventory_name,
            quantity_needed: row.quantity_needed,
            quantity_available: row.quantity_available,
          });
        }
      }

      res.status(200).json(Object.values(groupedDishes));
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;

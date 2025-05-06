import { Request, Response } from 'express';
import db from "../dbObj"

const express = require("express");
const router = express.Router();
const TABLE_NAME = "users"

const getUser = async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.query;

    if (!userName || !password) {
      res.status(400).json("לא נשלחו ערכים");
      return;
    }

    const cleanUsername = (userName as string).trim();
    const cleanPassword = (password as string).trim();

    console.log("🔍 ניסיון התחברות עם:");
    console.log("👤 username:", `"${cleanUsername}"`);
    console.log("🔑 password:", `"${cleanPassword}"`);

    const result: any = await selectByColumns(TABLE_NAME, "username", "password", cleanUsername, cleanPassword);

    console.log("🧾 תוצאה מה-DB:", result);

    if (result.length > 0) {
      res.status(200).json({ success: true, items: result });
    } else {
      res.status(401).json({ success: false, message: "שם משתמש או סיסמה שגויים" });
    }
  } catch (error: any) {
    console.error("❌ שגיאה:", error.message);
    res.status(500).json({ error: error.message });
  }
};


  
function selectByColumns(
  tableName: string,
  column1: string,
  column2: string,
  value1: any,
  value2: any
) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM ${tableName} WHERE ${column1} = ? AND ${column2} = ?`;

    db.query(query, [value1, value2], (error: any, rows: any) => {
      if (error) {
        console.error("❌ שגיאת SQL:", error.message);
        reject(error); // במקום throw
        return;
      }
      resolve(rows);
    });
  });
}


router.get('/', getUser)

export default router;

import { Request, Response } from 'express';
import {
  selectAll,
  insertRow,
  updateRow,
  selectByColumn,
  fakeDelete
} from '../baseServer';

import crypto from 'crypto';
import { unlink } from 'node:fs';
import db from '../dbObj';
import express from 'express';
import multer from 'multer';

const router = express.Router();
const TABLE_NAME = "users";

// 🧠 MULTER CONFIG (אחסון תמונות)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'users_images'),
  filename: (_req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });


// 🔐 אימות סיסמה (עם הצפנה)
const checkPassword = async (req: Request, res: Response) => {
  try {
    const { userName, password } = req.query;

    if (!userName || !password) {
      return res.status(400).json("לא נשלחו ערכים");
    }

    const hash = crypto
      .createHash("sha256")
      .update(password as string)
      .digest("hex");

    db.query(
      `SELECT * FROM users WHERE username = ? LIMIT 1`,
      [userName],
      (err: any, rows: any[]) => {
        if (err) {
          console.error("DB error:", err.message);
          return res.status(500).json({ error: err.message });
        }

        if (!rows.length) {
          return res.status(401).json({ success: false, message: "שם משתמש לא קיים" });
        }

        const user = rows[0];
        if (user.password === hash) {
          return res.status(200).json({ success: true, user });
        } else {
          return res.status(401).json({ success: false, message: "סיסמה שגויה" });
        }
      }
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


// 🖼️ העלאת תמונה
router.post('/img', upload.single('file'), (req: Request, res: Response) => {
  try {
    res.status(200).send("ok");
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
});

// 🗑️ מחיקת תמונה
router.post('/delete_img', (req: Request, res: Response) => {
  const file_name = req.body.id;

  unlink(`users_images/${file_name}`, (err) => {
    if (err) {
      console.error(err.message);
      return res.status(500).send("Error deleting image");
    }
    res.status(200).send("Image deleted successfully");
  });
});


// 🟢 משתמשים פעילים בלבד
router.get('/active', async (req: Request, res: Response) => {
  try {
    db.query(`
      SELECT id, first_name, last_name, phone_number, email, username, role_id
      FROM users
      WHERE is_active = 1
    `, (err, rows) => {
      if (err) {
        console.error("❌ DB ERROR:", err.message);
        return res.status(500).send("DB error");
      }
      res.status(200).json(rows);
    });
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
});



// 📋 כל המשתמשים
router.get('/all', async (req: Request, res: Response) => {
  try {
    const users = await selectAll(TABLE_NAME);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
});

// ❌ מחיקת משתמש לוגית (fake delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await fakeDelete(TABLE_NAME, req.params.id);
    res.status(200).send('ok');
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
});

// ➕ הוספת משתמש
router.post('/add', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // ✨ הצפנת סיסמה
    if (body.password) {
      body.password = crypto
        .createHash("sha256")
        .update(body.password)
        .digest("hex");
    }

    await insertRow(TABLE_NAME, body);
    res.status(200).send('ok');
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
});

// 🛠️ עדכון משתמש
router.put('/update/:id', async (req: Request, res: Response) => {
  try {
    const user = req.body;
    const id = req.params.id;

    if (user.password) {
      user.password = crypto
        .createHash("sha256")
        .update(user.password)
        .digest("hex");
    }

    await updateRow(TABLE_NAME, user, 'id', id);
    res.status(200).send('ok');
  } catch (error) {
    res.status(500).send(`Error: ${error}`);
  }
});


router.get('/check', checkPassword);

export default router;

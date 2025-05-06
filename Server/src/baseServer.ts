import { QueryError, ResultSetHeader, RowDataPacket, FieldPacket } from 'mysql2';
import db from './dbObj';

export function insertRow(tableName: string, item: object): Promise<{ insertId: number }> {
  return new Promise((resolve, reject) => {
    const keys = Object.keys(item);
    const values = Object.values(item);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName}(${keys.join(',')}) VALUES (${placeholders})`;
    
    db.query(
      sql,
      values,
      function (error: QueryError | null, result: ResultSetHeader, _fields: FieldPacket[]) {
        if (error) {
          reject(error.message);
        } else {
          resolve({ insertId: result.insertId });
        }
      }
    );
  });
}


export function selectAll(collection: string): Promise<RowDataPacket[]> {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT * FROM ${collection}`,
      (error: QueryError | null, rows: RowDataPacket[]) => {
        if (error) {
          reject(error.message);
        } else {
          resolve(rows);
        }
      }
    );
  });
}


export function selectByColumn(
  collection: string,
  column: string,
  value: string | number
) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM ${collection} WHERE ${column} = ?`;
    db.query(query, [value], (error: any, rows: any) => {
      if (error) {
        throw new Error(error.message);
      }
      resolve(rows);
    });
  });
}

export function updateRow(tableName: string, item: object, column:string, value: string | number) {
  const keys = Object.keys(item)
  const values = Object.values(item)
  const setKeys = keys.map((key) => `${key} = ?`); 
  const sql = `
  UPDATE ${tableName}
  SET ${setKeys}
  WHERE ${column} = ${value}
`;
  return db.query(sql, values, function (error: any) {
    if (error) {
      console.error(error.message);
    }
  });
}

export function deleteRow(tableName: string, column: string, value: number|string) {
  db.query(`DELETE FROM ${tableName} WHERE ${column} = ${value}`,  function (error: any) {
    if (error) {
      console.error(error.message);
    }
    console.log(`Row ${value} has been deleted`);
  });
}

export function deleteRows(tableName: string, ids: string[]) {
  if (ids.length === 0) {
    console.log("No IDs provided. No rows will be deleted.");
    return;
  }
  const placeholders = ids.map(() => "?").join(",");
  const sql = `DELETE FROM ${tableName} WHERE id IN (${placeholders})`;
  db.query(sql, ids, function (error: any) {
    if (error) {
      console.error(error.message);
    } else {
      console.log(`Rows with IDs [${ids.join(", ")}] have been deleted`);
    }
  });
}

export function fakeDelete(tableName: string, id: string) {
  db.query(
    `UPDATE ${tableName} SET is_active = false WHERE id = ${id}`,
    function (error: any) {
      if (error) {
        console.error(error.message);
      }
      console.log(`Row ${id} has been deleted`);
    });
}

export function makeActive(tableName: string, id: string) {
  return db.query(
    `UPDATE ${tableName} SET is_active = TRUE WHERE ID = ${id}`,
    function (error: any) {
      if (error) {
        console.error(error.message);
      }
      console.log(`Row ${id} has been active`);
    }
  );
}

export function SelectSupplierProducts(id:any) {
  return new Promise((resolve, reject) => {
    db.query(`SELECT
    products.id,
    products.mkt,
    products.name,
    products.inventory_id,
    products.size_type||
    products.size as size,
    supplier_products.price,
    supplier_products.id as supplier_products_id

FROM
    products
JOIN
    supplier_products ON products.id = supplier_products.product_id
WHERE
    supplier_products.supplier_id = ${id};`, (error: any, row: any) => {
      if (error) {
        throw new Error(error.message);
      }
      resolve(row);
    });
  });
}

export function insertAndGetKey(tableName: string, item: object): Promise<number> {
  return new Promise((resolve, reject) => {
    const keys = Object.keys(item);
    const values = Object.values(item);
    const numOfValues = values.map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName}(${keys.join(',')}) VALUES (${numOfValues})`;

    db.query(
      sql,
      values,
      function (error: QueryError | null, result: ResultSetHeader, fields: FieldPacket[]) {
        if (error) {
          reject(error.message);
        } else {
          resolve(result.insertId);
        }
      }
    );
  });
}



export function runQuery(query: string) {
  return new Promise((resolve, reject) => {

    db.query(query, function (error: any) {
      if (error) {
        console.error(error.message);
      }
      resolve("The query was successful");
    });
  })

}

export function getProducts() {
  return new Promise((resolve, reject) => {
    db.query(`SELECT products.*, inventory.name AS inventory_name
      FROM products
      JOIN inventory ON products.inventory_id = inventory.id`, (error: any, row: any) => {
      if (error) {
        throw new Error(error.message);
      }
      resolve(row);
    });
  });
}

export function getActiveProducts() {
  return new Promise((resolve, reject) => {
    db.query(`SELECT products.*, inventory.name AS inventory_name
      FROM products
      JOIN inventory ON products.inventory_id = inventory.id
      WHERE products.is_active = true`, (error: any, row: any) => {
      if (error) {
        throw new Error(error.message);
      }
      resolve(row);
    });
  });
}


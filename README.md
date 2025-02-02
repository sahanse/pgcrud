# pgcrudify - A Simple PostgreSQL CRUD Utility

**pgcrudify** is a lightweight and efficient PostgreSQL query builder for performing Create, Read, Update, and Delete (CRUD) operations. It provides a simple API to interact with your PostgreSQL database without writing raw SQL queries.

## Features
- 🛠️ **Simplified CRUD operations** for PostgreSQL
- ✅ **Automatic query generation**
- 🎯 **Prevents SQL injection** by using parameterized queries
- 📜 **Supports RETURNING fields** to retrieve inserted, updated, or deleted rows
- ⚡ **Error handling** with custom error methods
- 🔄 **Handles both single and batch operations**

## Installation
```sh
npm install pgcrudify
```

## Importing the Module
```javascript
import { createQuery, readQuery, updateQuery, deleteQuery } from "pgcrudify";
```

## Usage
### 1. Database Connection
Ensure you have a PostgreSQL client (like `pg` package) set up:
```javascript
import pg from "pg";

const db = new pg.Pool({
    user: "your_user",
    host: "your_host",
    database: "your_database",
    password: "your_password",
    port: 5432,
});
```

---

## CRUD Operations

### 2. Create (INSERT)
```javascript
const newUser = await createQuery(db, "users", { name: "John Doe", age: 25 }, ["id", "name"]);
console.log(newUser.rows);
```
#### Explanation:
- `db` → Database connection

- `"users"` → Table name

- `{ name: "John Doe", age: 25 }` → Object containing data to insert

- `["id", "name"]` → Fields to return after insertion (provide `["*"]` to return all fields, if empty `[]` nothing is returned)

- `conflictAction` (Optional) → handle conflicts that may arise due to unique constraints or primary key violations in PostgreSQL, (Default: `""`) 

   It allows defining whether to ignore conflicts (DO NOTHING) or update certain fields (DO UPDATE).
   
   If conflictAction is an empty string `""`, the query proceeds as a normal INSERT without handling conflicts.

- `errorMethod` (Optional) → The errorMethod parameter determines how errors are handled when executing queries. (Default: `throw`)

   errorMethod = `throw` → Stops execution immediately if an error occurs

   errorMethod = `return` → Returns the error object so you can handle it manually.

---

### 3. Read (SELECT)
```javascript
const users = await readQuery(db, "users", ["*"], { age: 25 });
console.log(users.rows);
```
#### Explanation:
- `db` → Database connection

- `"users"` → Table name

- `["*"]` → Returns all columns (if empty `[]`, an error is thrown, for specific fields `["name", "id]`)

- `{ age: 25 }` → Filters records where `age = 25`,

   - Composite Filtering: `{age:25, id:12}` → Filters records where `age = 25` and `id = 12`

- `errorMethod` (Optional) → The errorMethod parameter determines how errors are handled when executing queries. (Default: `throw`)

   errorMethod = `throw` → Stops execution immediately if an error occurs

   errorMethod = `return` → Returns the error object so you can handle it manually.

---

### 4. Update (UPDATE)
```javascript
const updatedUser = await updateQuery(db, "users", { age: 26 }, { name: "John Doe" }, ["age"]);
console.log(updatedUser.rows);
```
#### Explanation:
- `{ age: 26 }` → Fields to update

- `{ name: "John Doe" }` → Filters records where `name = John Doe`,

   - Composite Filtering:  `{age:25, name: "John Doe" }` → Filters records where `age = 25` and `name = John Doe`

- `["age"]` → Returns updated field values (if empty `[]`, nothing is returned, `["*"]`  Returns all columns)
- `errorMethod` (Optional) → The errorMethod parameter determines how errors are handled when executing queries. (Default: `throw`)

   errorMethod = `throw` → Stops execution immediately if an error occurs

   errorMethod = `return` → Returns the error object so you can handle it manually.
---

### 5. Delete (DELETE)
```javascript
const deletedUser = await deleteQuery(db, "users", { name: "John Doe" }, ["id"]);
console.log(deletedUser.rows);
```
#### Explanation:
- `{ name: "John Doe" }` → Condition for deletion
   - Composite Filtering: `{age:25, name: "John Doe" }` → delete  records where `age = 25` and `name = John Doe`

- `deleteQuery(db, "users", {})` → Deletes **all rows** if an empty object `{}` is provided

- `["id"]` → Returns deleted row ID (provide `["*"]` to return all fields, if empty `[]` nothing is returned)

- `errorMethod` (Optional) → The errorMethod parameter determines how errors are handled when executing queries. (Default: `throw`)

   errorMethod = `throw` → Stops execution immediately if an error occurs

   errorMethod = `return` → Returns the error object so you can handle it manually.

---

## Error Handling
All functions return errors if something goes wrong. You can choose how to handle them:
```javascript
try {
    await createQuery(db, "users", { name: 123 });
} catch (error) {
    console.error("Error:", error.message);
}
```
---
### Returning Fields Behavior

| `returningFields` | Behavior |
|------------------|----------|
| `[]` | No fields returned |
| `["*"]` | All fields returned |
| `["id", "name"]` | Only specified fields returned |

## Conclusion
`pgcrudify` makes it easy to perform CRUD operations in PostgreSQL with a clean and structured API. 🚀 Happy coding!

---

### Contributing

Contributions are welcome! Please open an issue or submit a pull request on the https://github.com/sahanse/pgcrudify

---
### License
MIT License


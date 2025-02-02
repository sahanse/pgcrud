const handleError = (message, errorMethod) => {
    const error = new Error(message); // Create an actual Error object
    if (errorMethod === "throw") throw error; // Throw it if needed
    return error; // Return the error object instead of a plain JSON
};

// Execute database query
const executeQuery = async (db, query, values, errorMethod) => {
    try {
        const result = await db.query(query, values);
        return result;
    } catch (error) {
        return handleError(error.message, errorMethod);
    }
};

// Build the SQL query
const buildQuery = (operation, tableName, fields = {}, matchFields = {}, returnFields = [], conflictAction = "") => {
    let query = '';
    let values = [];
    const keys = Object.keys(fields);
    const vals = Object.values(fields);

    switch (operation) {
        case 'insert':
            if (keys.length === 0) {
                query = `INSERT INTO ${tableName} DEFAULT VALUES`;
            } else {
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
                query = `INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${placeholders})`;
                values = vals;
            }

            if (conflictAction) query += ` ${conflictAction}`;
            query += returnFields.length > 0 ? ` RETURNING ${returnFields.join(", ")}` : "";
            break;

        case 'select':
            if (returnFields.length === 0) {
                throw new Error("You must provide return fields in the array. For all fields, use ['*']");
            }
            query = `SELECT ${returnFields.length ? returnFields.join(", ") : "*"} FROM ${tableName}`;
            if (Object.keys(matchFields).length > 0) {
                const matchFieldConditions = Object.keys(matchFields).map((key, i) => `${key}=$${i + 1}`).join(' AND ');
                query += ` WHERE ${matchFieldConditions}`;
                values = Object.values(matchFields);
            }
            break;

        case 'update':
            query = `UPDATE ${tableName} SET ${keys.map((key, i) => `${key}=$${i + 1}`).join(", ")}`;
            values = vals;

            if (Object.keys(matchFields).length > 0) {
                const matchFieldConditions = Object.keys(matchFields).map((key, i) => `${key}=$${keys.length + i + 1}`).join(' AND ');
                query += ` WHERE ${matchFieldConditions}`;
                values.push(...Object.values(matchFields));
            }

            if (returnFields.length > 0) query += ` RETURNING ${returnFields.join(", ")}`;
            break;

        case 'delete':
            query = `DELETE FROM ${tableName}`;
            if (Object.keys(matchFields).length > 0) {
                const matchFieldConditions = Object.keys(matchFields).map((key, i) => `${key}=$${i + 1}`).join(' AND ');
                query += ` WHERE ${matchFieldConditions}`;
                values = Object.values(matchFields);
            }

            if (returnFields.length > 0) query += ` RETURNING ${returnFields.join(", ")}`;
            break;

        default:
            throw new Error("Invalid operation type");
    }

    return { query, values };
};


// Create Insert query
const createQuery = async (db, tableName, insertKeyValues = {}, returnFields = [], conflictAction = "", errorMethod = "throw") => {
    // Validation checks
    if (!db || typeof db !== "object") return handleError("Invalid database object provided", errorMethod);
    if (!tableName || typeof tableName !== "string") return handleError("Table name must be a valid string", errorMethod);
    if (typeof insertKeyValues !== "object" || Array.isArray(insertKeyValues)) return handleError("Insert data must be an object with key-value pairs", errorMethod);
    if (!Array.isArray(returnFields)) return handleError("Return fields must be provided as an array", errorMethod);

    const { query, values } = buildQuery('insert', tableName, insertKeyValues, {}, returnFields, conflictAction);
    return executeQuery(db, query, values, errorMethod);
};

// Read (SELECT) query
const readQuery = async (db, tableName, returnFields = [], matchFields = {}, errorMethod = "throw") => {
    if (!db || typeof db !== "object") return handleError("Invalid database object provided", errorMethod);
    if (!tableName || typeof tableName !== "string") return handleError("Table name must be a valid string", errorMethod);
    if (!Array.isArray(returnFields)) return handleError("Return fields must be an array", errorMethod);
    if (returnFields.length === 0) return handleError("You must provide return fields in the array. For all fields, use ['*']", errorMethod);
    if (typeof matchFields !== "object") return handleError("Match fields must be an object", errorMethod);

    const { query, values } = buildQuery('select', tableName, {}, matchFields, returnFields);
    return executeQuery(db, query, values, errorMethod);
};

// Update query
const updateQuery = async (db, tableName, setFields = {}, matchFields = {}, returnFields = [], errorMethod = "throw") => {
    if (!db || typeof db !== "object") return handleError("Invalid database object provided", errorMethod);
    if (!tableName || typeof tableName !== "string") return handleError("Table name must be a valid string", errorMethod);
    if (typeof setFields !== "object") return handleError("Set fields must be an object", errorMethod);
    if (typeof matchFields !== "object") return handleError("Match fields must be an object", errorMethod);
    if (!Array.isArray(returnFields)) return handleError("Return fields must be an array", errorMethod);

    const { query, values } = buildQuery('update', tableName, setFields, matchFields, returnFields);
    return executeQuery(db, query, values, errorMethod);
};

// Delete query
const deleteQuery = async (db, tableName, matchFields = {}, returnFields = [], errorMethod = "throw") => {
    // Validate the database object
    if (!db || typeof db !== "object") return handleError("Invalid database object provided", errorMethod);
    
    // Validate the tableName
    if (!tableName || typeof tableName !== "string") return handleError("Table name must be a valid string", errorMethod);
    
    // Validate returnFields to be an array
    if (!Array.isArray(returnFields)) {
        return handleError("Return fields must be an array", errorMethod);
    }

    // Check if matchFields is an object and either empty or not
    if (typeof matchFields !== "object" || Array.isArray(matchFields)) {
        return handleError("Match fields must be an object", errorMethod);
    }

    // Construct the DELETE query based on matchFields
    let query = `DELETE FROM ${tableName}`;
    let values = [];

    // If matchFields is an empty object, delete all records
    if (Object.keys(matchFields).length === 0) {
        query = `DELETE FROM ${tableName}`; // Delete all rows
    } else {
        // If matchFields is not empty, build the WHERE clause
        const matchFieldConditions = Object.keys(matchFields)
            .map((key, i) => `${key}=$${i + 1}`)
            .join(' AND ');

        query += ` WHERE ${matchFieldConditions}`;
        values = Object.values(matchFields);
    }

    // If returnFields is provided, add the RETURNING clause
    if (returnFields.length > 0) {
        query += ` RETURNING ${returnFields.join(", ")}`;
    }

    // Execute the query
    return executeQuery(db, query, values, errorMethod);
};

export { createQuery, readQuery, updateQuery, deleteQuery };

// databaseSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SQLiteConnection, SQLiteDBConnection, CapacitorSQLite } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | null = null;

interface DatabaseState {
  initialized: boolean;
  isInitializing: boolean;
  error: string | null;
}

const initialState: DatabaseState = {
  initialized: false,
  isInitializing: false,
  error: null,
};

export const initializeDB = createAsyncThunk<boolean, void, { rejectValue: string }>(
  'database/initializeDB',
  async (_, { rejectWithValue }) => {
    try {
      // Create a new connection
      db = await sqlite.createConnection(
        'db_vite',
        false,
        'no-encryption',
        1,
        false
      );

      // Open the database
      await db.open();

      // Create tables
      await initializeWaterIntakeTable(db);
      await initializeQuickAddTable(db);
      await initializeDrinkTypeTable(db);

      return true;
    } catch (error: unknown) {
      return rejectWithValue(`Database error: ${(error as Error).message}`);
    }
  }
);

// Async thunk to create tables if they do not exist
export const initializeWaterIntakeTable = async (db: SQLiteDBConnection) => {
  const tableExistsQuery = `
    SELECT name FROM sqlite_master WHERE type='table' AND name='water_intake';
  `;
  
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS water_intake (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      hydration_amount REAL NOT NULL,
      drink_type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (drink_type) REFERENCES drink_type(name)
    );
  `;

  try {
    // Check if table exists
    const result = await db.query(tableExistsQuery);
    const tableExists = result?.values && result.values.length > 0;

    if (!tableExists) {
      await db.execute(createTableQuery);
      console.log('Created water_intake table');
    }
  } catch (error) {
    console.error('Error initializing water_intake table:', error);
    throw error;
  }
};

// Async thunk to create tables if they do not exist
export const initializeQuickAddTable = async (db: SQLiteDBConnection) => {
    // Check if table exists
    const tableExistsQuery = `
        SELECT name FROM sqlite_master WHERE type='table' AND name='quick_add';
    `;
    
    const createQuickAddTableQuery = `
        CREATE TABLE IF NOT EXISTS quick_add (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quick_add_amount REAL NOT NULL
        );
    `;
    
    const insertDefaultValuesQuery = `
        INSERT INTO quick_add (quick_add_amount)
        VALUES (8), (16.9);
    `;
  
    try {
        // Check if table exists
        const result = await db.query(tableExistsQuery);
        const tableExists = (result.values?.length ?? 0) > 0;
        
        // Create table
        await db.execute(createQuickAddTableQuery);
        
        // Only insert default values if table didn't exist before
        if (!tableExists) {
            await db.execute(insertDefaultValuesQuery);
            console.log("Quick add table created with default values.");
        } else {
            console.log("Quick add table already exists.");
        }
    } catch (error) {
        console.error("Error setting up quick add table:", error);
        throw error;
    }
};

// Async thunk to create tables if they do not exist
export const initializeDrinkTypeTable = async (db: SQLiteDBConnection) => {
    // Check if table exists
    const tableExistsQuery = `
        SELECT name FROM sqlite_master WHERE type='table' AND name='drink_type';
    `;
    
    const createDrinkTypeTableQuery = `
        CREATE TABLE IF NOT EXISTS drink_type (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            hydration_factor REAL NOT NULL
        );
    `;
    
    const insertDefaultValuesQuery = `
        INSERT INTO drink_type (name, hydration_factor)
        VALUES 
            ('Water', 1.0),
            ('Coffee', 0.98),
            ('Tea', 0.99),
            ('Soda', 0.93),
            ('Milk', 0.87);
    `;
  
    try {
        // Check if table exists
        const result = await db.query(tableExistsQuery);
        const tableExists = (result.values?.length ?? 0) > 0;
        
        // Create table
        await db.execute(createDrinkTypeTableQuery);
        
        // Only insert default values if table didn't exist before
        if (!tableExists) {
            await db.execute(insertDefaultValuesQuery);
            console.log("Drink type table created with default values.");
        } else {
            console.log("Drink type table already exists.");
        }
    } catch (error) {
        console.error("Error setting up drink type table:", error);
        throw error;
    }
};

// Async thunk to perform SQL actions
export const performSQLAction = createAsyncThunk<
  any,
  { action: (db: SQLiteDBConnection) => Promise<any> },
  { rejectValue: string }
>('database/performSQLAction', async ({ action }, { rejectWithValue }) => {
  try {
    if (!db) {
      throw new Error('Database not initialized');
    }

    return await action(db);
  } catch (error: unknown) {
    return rejectWithValue(`SQL error: ${(error as Error).message}`);
  }
});

const databaseSlice = createSlice({
  name: 'database',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeDB.pending, (state) => {
        state.isInitializing = true;
        state.error = null;
      })
      .addCase(initializeDB.fulfilled, (state) => {
        state.initialized = true;
        state.isInitializing = false;
        state.error = null;
      })
      .addCase(initializeDB.rejected, (state, action) => {
        state.initialized = false;
        state.isInitializing = false;
        state.error = action.payload ?? 'Unknown error';
      });
  },
});

export default databaseSlice.reducer;

// databaseSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
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

      return true;
    } catch (error: unknown) {
      return rejectWithValue(`Database error: ${(error as Error).message}`);
    }
  }
);

// Async thunk to create tables if they do not exist
export const initializeWaterIntakeTable = async (db: SQLiteDBConnection) => {
  const createWaterIntakeTableQuery = `
    CREATE TABLE IF NOT EXISTS water_intake (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount INTEGER NOT NULL,
        drink_type TEXT NOT NULL,
        timestamp TEXT NOT NULL
    );
  `;

  try {
    await db.execute(createWaterIntakeTableQuery);
    console.log("Water intake table created or already exists.");
  } catch (error) {
    console.error("Error creating water intake table:", error);
    throw error;
  }
};

// Async thunk to create tables if they do not exist
export const initializeQuickAddTable = async (db: SQLiteDBConnection) => {
    const createQuickAddTableQuery = `
        CREATE TABLE IF NOT EXISTS quick_add (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quick_add_amount INTEGER NOT NULL
        );
        `;
  
    try {
      await db.execute(createQuickAddTableQuery);
      console.log("Quick add table created or already exists.");
    } catch (error) {
      console.error("Error creating quick add table:", error);
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
      .addCase(initializeDB.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.initialized = false;
        state.isInitializing = false;
        state.error = action.payload || 'Unknown database error';
      });
  },
});

export default databaseSlice.reducer;

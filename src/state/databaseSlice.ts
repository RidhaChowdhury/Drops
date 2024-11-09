// databaseSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SQLiteConnection, SQLiteDBConnection, CapacitorSQLite } from '@capacitor-community/sqlite';

const sqlite = new SQLiteConnection(CapacitorSQLite);
let db: SQLiteDBConnection | null = null;

interface DatabaseState {
  initialized: boolean;
  error: string | null;
}

const initialState: DatabaseState = {
  initialized: false,
  error: null,
};

// Async thunk to initialize the database and create tables
export const initializeDB = createAsyncThunk<boolean, void, { rejectValue: string }>(
  'database/initializeDB',
  async (_, { rejectWithValue }) => {
    try {
        sqlite.checkConnectionsConsistency();
      const isConn = (await sqlite.isConnection('db_vite', false)).result;

      db = isConn
        ? await sqlite.retrieveConnection('db_vite', false)
        : await sqlite.createConnection('db_vite', false, 'no-encryption', 1, false);

      await db.open();

      // Create necessary tables
      await initializeTables(db);

      return true;
    } catch (error: unknown) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Async thunk to create tables if they do not exist
export const initializeTables = async (db: SQLiteDBConnection) => {
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

// Async thunk to perform SQL actions
export const performSQLAction = createAsyncThunk<
  any,
  { action: (db: SQLiteDBConnection) => Promise<any> },
  { rejectValue: string }
>('database/performSQLAction', async ({ action }, { rejectWithValue }) => {
  try {
    if (!db) throw new Error("Database not initialized");
    await db.open();
    const result = await action(db);
    await db.close();
    return result;
  } catch (error: unknown) {
    return rejectWithValue((error as Error).message);
  }
});

const databaseSlice = createSlice({
  name: 'database',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeDB.fulfilled, (state) => {
        state.initialized = true;
        state.error = null;
      })
      .addCase(initializeDB.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || null;
      })
      .addCase(performSQLAction.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.error = action.payload || null;
      });
  },
});

export default databaseSlice.reducer;

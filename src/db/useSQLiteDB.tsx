import { useEffect, useRef, useState } from "react";
import {
  SQLiteDBConnection,
  SQLiteConnection,
  CapacitorSQLite,
} from "@capacitor-community/sqlite";

const useSQLiteDB = () => {
  const db = useRef<SQLiteDBConnection>();
  const sqlite = useRef<SQLiteConnection>();
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        if (sqlite.current) return;

        console.log("Initializing database connection");
        sqlite.current = new SQLiteConnection(CapacitorSQLite);
        
        // Ensure platform is ready
        await sqlite.current.initWebStore();
        
        const ret = await sqlite.current.checkConnectionsConsistency();
        const isConn = (await sqlite.current.isConnection("db_vite", false)).result;

        if (ret.result && isConn) {
          console.log("Retrieving existing connection");
          db.current = await sqlite.current.retrieveConnection("db_vite", false);
        } else {
          console.log("Creating new connection");
          db.current = await sqlite.current.createConnection(
            "db_vite",
            false,
            "no-encryption",
            1,
            false
          );
        }

        // Explicitly open the database after creation
        await db.current.open();
        console.log("Database connection established successfully");
      } catch (error) {
        console.error("Database initialization error:", error);
        throw error;
      }
    };

    initializeDB().then(() => {
      initializeTables();
      setInitialized(true);
    });
  }, []);

  const performSQLAction = async (
    action: (db: SQLiteDBConnection | undefined) => Promise<void>,
    cleanup?: () => Promise<void>
  ) => {
    try {
      // Check if database is already open
      if (!(await db.current?.isDBOpen())?.result) {
        await db.current?.open();
      }
      await action(db.current);
    } catch (error) {
      console.error("SQL action error:", error);
      alert((error as Error).message);
    } finally {
      try {
        if ((await db.current?.isDBOpen())?.result) {
          await db.current?.close();
        }
        cleanup && (await cleanup());
      } catch (error) {
        console.error("Error closing database:", error);
      }
    }
  };

  // create table
  const initializeTables = async () => {
    performSQLAction(async (db: SQLiteDBConnection | undefined) => {
      const queryCreateTable = `
        CREATE TABLE IF NOT EXISTS water_intake (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount INTEGER NOT NULL,
            drink_type TEXT NOT NULL,
            timestamp TEXT NOT NULL
        );
    `;
      const respCT = await db?.execute(queryCreateTable);
      console.log(`res: ${JSON.stringify(respCT)}`);
    });
  };

  return { performSQLAction, initialized };
};

export default useSQLiteDB;
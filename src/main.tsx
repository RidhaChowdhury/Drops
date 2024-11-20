import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './state/store';
import App from './App.tsx';
import './index.css';
import { Capacitor } from "@capacitor/core";
import {
  CapacitorSQLite,
  SQLiteConnection,
} from "@capacitor-community/sqlite";
import { JeepSqlite } from "jeep-sqlite/dist/components/jeep-sqlite";

window.addEventListener("DOMContentLoaded", async () => {
   try {
     const platform = Capacitor.getPlatform();
 
 
     // WEB SPECIFIC FUNCTIONALITY
     if (platform === "web") {
       const sqlite = new SQLiteConnection(CapacitorSQLite);
       // Create the 'jeep-sqlite' Stencil component
       customElements.define("jeep-sqlite", JeepSqlite);
       const jeepSqliteEl = document.createElement("jeep-sqlite");
       document.body.appendChild(jeepSqliteEl);
       await customElements.whenDefined("jeep-sqlite");
       console.log(`after customElements.whenDefined`);
 
       // Initialize the Web store
       await sqlite.initWebStore();
       console.log(`after initWebStore`);
     }
 
     const container = document.getElementById("root");
     const root = createRoot(container!);
     root.render(
      <StrictMode>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </StrictMode>
    );
   } catch (e) {
     console.log(e);
   }
 });
import React, { useState } from "react";
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import ConnectionForm from "./components/ConnectionForm";
import QuerySection from "./components/QuerySection";
import QueryResults from "./components/QueryResults";
import AuthSection from "./components/AuthSection";
import { getPaths } from "./getPaths";

const App: React.FC = () => {
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(
    null
  );
  const [queryResults, setQueryResults] = useState<string[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [authStatus, setAuthStatus] = useState("Not Authenticated");
  const [user, setUser] = useState<any>(null);

  const addQueryResult = (result: string) => {
    setQueryResults((prevResults) => [...prevResults, result]);
  };

  const discoverTables = async (url: string, key: string) => {
    const tableNames = await getPaths(url, key);
    setTables(tableNames);
  };

  const handleAuthStatus = (status: string, user?: any) => {
    setAuthStatus(status);
    setUser(user);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen flex flex-col items-center justify-center w-full">
      <ConnectionForm
        setSupabaseClient={setSupabaseClient}
        discoverTables={discoverTables}
      />

      {supabaseClient ? (
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex flex-row items-center justify-center space-x-2 w-full ">
            <QuerySection
              supabaseClient={supabaseClient}
              addQueryResult={addQueryResult}
              tables={tables}
            />
            <AuthSection
              supabaseClient={supabaseClient}
              setAuthStatus={handleAuthStatus}
            />
          </div>
          <QueryResults queryResults={queryResults} />
        </div>
      ) : (
        <div className="py-12 text-center w-2/5 bg-white rounded-xl">
          <p className="text-xl font-bold">
            Connect to Supabase to make queries
          </p>
        </div>
      )}
    </div>
  );
};

export default App;

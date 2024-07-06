import React, { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import ConnectionForm from "./components/ConnectionForm";
import QuerySection from "./components/QuerySection";
import QueryResults, { result } from "./components/QueryResults";
import AuthSection from "./components/AuthSection";
import { getPaths } from "./getPaths";
import toast, { Toaster } from "react-hot-toast";
import VulnerabilityDisclosure from "./components/VulnerabilityDisclosure";
import Settings from "./components/Settings";
import ExposedKeys from "./components/ExposedKeys";

const App: React.FC = () => {
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(
    null
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (supabaseClient) {
        window.supabase = supabaseClient;
      } else {
        window.supabase = null;
      }
    }
  }, [supabaseClient]);

  const [queryResults, setQueryResults] = useState<result[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const defaultSettings = {
    showConnectionForm: false,
    showQuerySection: true,
    showAuthSection: true,
    showVulnerabilityDisclosure: true,
    showQueryResults: true,
    showExposedKeys: true,
  };

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("uiSettings");
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [exposedOpenAIKeys, setExposedOpenAIKeys] = useState<Set<string>>(
    new Set()
  );

  const addKeys = (inputString: string) => {
    // Regular expression to match OpenAI API keys (example: 'sk-xxx')
    const keyPattern = /sk-[A-Za-z0-9]{48}/g;

    // Find all matches in the input string
    const matches = inputString.match(keyPattern);

    // Add all found keys to the state
    if (matches) {
      setExposedOpenAIKeys((prevSet) => {
        const newSet = new Set(prevSet);
        matches.forEach((key) => newSet.add(key));
        return newSet;
      });
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      if (supabaseClient) {
        setIsAuthenticated(!!(await supabaseClient.auth.getUser()).data.user);
      }
    };
    checkUser();
    supabaseClient?.auth.onAuthStateChange((_event, session) => {
      if (session?.user.id) setIsAuthenticated(true);
      else setIsAuthenticated(false);
    });
  }, [supabaseClient]);

  const addQueryResult = (data: string, bypassCharLimit?: boolean) => {
    const result: result = {
      data,
      bypasscharlimit: bypassCharLimit,
    };
    setQueryResults((prevResults) => [result, ...prevResults]);
  };

  const discoverTables = async (url: string, key: string) => {
    const toastId = toast.loading("Discovering tables...");
    const tableNames = await getPaths(url, key);
    setTables(tableNames);
    toast.success("Done discovering tables", { id: toastId });
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 min-h-screen flex flex-col items-center justify-center w-full">
      <Toaster />
      <Settings settings={settings} setSettings={setSettings} />

      {(!supabaseClient || settings.showConnectionForm) && (
        <ConnectionForm
          setSupabaseClient={setSupabaseClient}
          discoverTables={discoverTables}
        />
      )}

      {supabaseClient ? (
        <div>
          <div className="flex flex-row items-center justify-center space-x-2 w-full">
            {settings.showQuerySection && (
              <QuerySection
                supabaseClient={supabaseClient}
                addQueryResult={addQueryResult}
                tables={tables}
                addKeys={addKeys}
              />
            )}
            {settings.showAuthSection && (
              <AuthSection
                supabaseClient={supabaseClient}
                isAuthenticated={isAuthenticated}
              />
            )}
          </div>

          <div className="flex flex-col items-center justify-center">
            {settings.showVulnerabilityDisclosure && (
              <VulnerabilityDisclosure
                supabaseClient={supabaseClient}
                tables={tables}
                isAuthenticated={isAuthenticated}
              />
            )}
            {settings.showQueryResults && (
              <QueryResults queryResults={queryResults} />
            )}
            {settings.showExposedKeys && (
              <ExposedKeys keys={[...exposedOpenAIKeys]} />
            )}
          </div>
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

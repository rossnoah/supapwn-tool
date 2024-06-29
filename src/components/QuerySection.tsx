import React, { useState, useEffect } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import VulnerabilityDisclosure from "./VulnerabilityDisclosure";
import {
  handleResult,
  fetchTableData,
  processTablesInChunks,
} from "../supabaseUtils";

interface QuerySectionProps {
  supabaseClient: SupabaseClient;
  addQueryResult: (data: string, bypassCharLimit?: boolean) => void;
  tables: string[];
}

const QuerySection: React.FC<QuerySectionProps> = ({
  supabaseClient,
  addQueryResult,
  tables,
}) => {
  const [table, setTable] = useState<string>("");
  const [skipEmpty, setSkipEmpty] = useState<boolean>(false);
  const [companyName, setCompanyName] = useState<string>("");
  const [companyUrl, setCompanyUrl] = useState<string>("");
  const [disclosureCredits, setDisclosureCredits] = useState<string>(
    localStorage.getItem("disclosureCredits") || ""
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("disclosureCredits", disclosureCredits);
  }, [disclosureCredits]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const user = (await supabaseClient.auth.getUser()).data.user;
      setIsAuthenticated(!!user);
    };

    checkAuthStatus();
  }, [supabaseClient.auth]);

  const querySupabase = async (table: string, query: string) => {
    const date = new Date().toLocaleString();
    const result = await fetchTableData(supabaseClient, table, query);
    handleResult(result, query, date, addQueryResult, skipEmpty);
    return result;
  };

  const queryAllTables = async () => {
    const summary = await processTablesInChunks(tables, (table) =>
      fetchTableData(supabaseClient, table)
    );

    const summaryReport = summary
      .map(
        (entry) =>
          `Table: ${entry.table} - ${
            entry.error
              ? `Error: ${entry.error}`
              : `Size: ${entry.data?.length ?? 0}`
          }`
      )
      .join("\n");

    addQueryResult(`Summary Report:\n\n${summaryReport}`, true);
  };

  return (
    <div
      id="query-section"
      className="flex flex-col items-center justify-center mb-4 space-y-6 bg-white p-8 rounded-lg shadow-lg w-2/5"
    >
      <h3 className="text-lg text-center text-gray-700">Query Supabase</h3>
      <input
        type="text"
        placeholder="Table"
        className="w-full p-2 border border-gray-300 rounded"
        value={table}
        onChange={(e) => setTable(e.target.value)}
      />
      <div className="flex space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => querySupabase(table, "*")}
        >
          Query
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={queryAllTables}
        >
          Query All
        </button>
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="checkbox"
          checked={skipEmpty}
          onChange={(e) => setSkipEmpty(e.target.checked)}
        />
        <label className="text-gray-700">Skip Empty Collections</label>
      </div>
      <div className="mt-4 w-full">
        {tables.length > 0 ? (
          <div>
            <h4 className="text-lg font-bold">Tables:</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {tables.map((tableName) => (
                <span
                  key={tableName}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-300"
                  onClick={() => setTable(tableName)}
                >
                  {tableName}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-4">No tables found.</div>
        )}
      </div>
      <div className="mt-4 w-full">
        <input
          type="text"
          placeholder="Company Name"
          className="w-full p-2 border border-gray-300 rounded"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Company URL"
          className="w-full p-2 border border-gray-300 rounded mt-2"
          value={companyUrl}
          onChange={(e) => setCompanyUrl(e.target.value)}
        />
        <input
          type="text"
          placeholder="Disclosure Author"
          className="w-full p-2 border border-gray-300 rounded mt-2"
          value={disclosureCredits}
          onChange={(e) => setDisclosureCredits(e.target.value)}
        />
      </div>
      <VulnerabilityDisclosure
        supabaseClient={supabaseClient}
        tables={tables}
        isAuthenticated={isAuthenticated}
        companyName={companyName}
        companyUrl={companyUrl}
        disclosureCredits={disclosureCredits}
      />
    </div>
  );
};

export default QuerySection;

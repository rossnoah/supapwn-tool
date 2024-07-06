import React, { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  handleResult,
  fetchTableData,
  processTablesInChunks,
} from "../supabaseUtils";
import toast from "react-hot-toast";

interface QuerySectionProps {
  supabaseClient: SupabaseClient;
  addQueryResult: (data: string, bypassCharLimit?: boolean) => void;
  tables: string[];
  addKeys: (inputString: string) => void;
}

const QuerySection: React.FC<QuerySectionProps> = ({
  supabaseClient,
  addQueryResult,
  tables,
  addKeys,
}) => {
  const [table, setTable] = useState<string>("");
  const [skipEmpty, setSkipEmpty] = useState<boolean>(false);
  const [querying, setQuerying] = useState<boolean>(false); // State to track if a query is in progress

  const querySupabase = async (table: string, query: string) => {
    if (querying) {
      toast.error("Another query is already in progress.");
      return;
    }
    setQuerying(true); // Set querying to true
    const date = new Date().toLocaleString();
    try {
      const result = await fetchTableData(supabaseClient, table, query);
      if (result.data) {
        addKeys(JSON.stringify(result.data));
      }
      handleResult(result, query, date, addQueryResult, skipEmpty);
    } catch (error) {
      toast.error(`Error querying table ${table}: ${(error as Error).message}`);
    } finally {
      setQuerying(false); // Set querying to false
    }
  };

  const queryAllTables = async (query: string) => {
    if (querying) {
      toast.error("Another query is already in progress.");
      return;
    }
    setQuerying(true); // Set querying to true
    console.log("Querying all tables...");
    try {
      const summary = await processTablesInChunks(tables, (table) =>
        fetchTableData(supabaseClient, table, query, skipEmpty)
      );

      // run addKeys on all data as string
      summary.forEach((entry) => {
        if (entry.data) {
          addKeys(JSON.stringify(entry.data));
        }
      });
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
    } catch (error) {
      toast.error(`Error querying all tables: ${(error as Error).message}`);
    } finally {
      setQuerying(false); // Set querying to false
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mb-4 space-y-6 bg-white p-8 rounded-lg shadow-lg w-2/5">
      <div
        id="query-section"
        className="flex flex-col items-center w-full space-y-6"
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
            disabled={querying} // Disable button if querying is true
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
              querying ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => querySupabase(table, "*")}
          >
            {querying ? "Querying..." : "Query"}
          </button>
          <button
            disabled={querying} // Disable button if querying is true
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
              querying ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => queryAllTables("*")}
          >
            {querying ? "Querying..." : "Query All"}
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
            <div className="text-center text-gray-500 mt-4">
              No tables found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuerySection;

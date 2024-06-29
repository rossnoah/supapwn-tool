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
}

const QuerySection: React.FC<QuerySectionProps> = ({
  supabaseClient,
  addQueryResult,
  tables,
}) => {
  const [table, setTable] = useState<string>("");
  const [skipEmpty, setSkipEmpty] = useState<boolean>(false);

  const querySupabase = async (table: string, query: string) => {
    const date = new Date().toLocaleString();
    const result = await fetchTableData(supabaseClient, table, query);
    handleResult(result, query, date, addQueryResult, skipEmpty);
    return result;
  };

  const queryAllTables = async (query: string) => {
    const toastId = toast.loading("Querying all tables...");
    console.log("Querying all tables...");
    const summary = await processTablesInChunks(tables, (table) =>
      fetchTableData(supabaseClient, table, query, skipEmpty)
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
    toast.success("Query completed.", { id: toastId });
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => querySupabase(table, "*")}
          >
            Query
          </button>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => queryAllTables("*")}
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

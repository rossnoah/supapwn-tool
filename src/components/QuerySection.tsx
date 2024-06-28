import React, { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

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
  const [table, setTable] = useState("");
  const [skipEmpty, setSkipEmpty] = useState(false);

  const querySupabase = async (table: string, query: string) => {
    const date = new Date().toLocaleString();
    try {
      const { data, error } = await supabaseClient.from(table).select(query);
      if (error) throw error;

      if (!skipEmpty || (data && data.length > 0)) {
        console.log(table, data);

        addQueryResult(
          `Table: ${table}\nQuery: ${query}\nDate: ${date}\n\n${JSON.stringify(
            data,
            null,
            2
          )}`,
          false
        );
      }
      return { table, data };
    } catch (err: any) {
      console.log(table, err);
      addQueryResult(
        `Table: ${table}\nQuery: ${query}\nDate: ${date}\n\nFailed to query: ${err.message}`,
        false
      );
      return { table, error: err.message };
    }
  };

  const queryAllTables = async () => {
    const summary: { table: string; size: number; error?: string }[] = [];
    const chunkSize = 100;

    for (let i = 0; i < tables.length; i += chunkSize) {
      const chunk = tables.slice(i, i + chunkSize);

      const promises = chunk.map(async (tableName) => {
        const result = await querySupabase(tableName, "*");
        if (result) {
          return {
            table: result.table,
            size: result.data ? result.data.length : 0,
            error: result.error,
          };
        }
        return null;
      });

      const results = await Promise.all(promises);

      results.forEach((entry) => {
        if (entry) {
          summary.push(entry);
        }
      });
    }

    const summaryReport = summary
      .map(
        (entry) =>
          `Table: ${entry.table} - ${
            entry.error ? `Error: ${entry.error}` : `Size: ${entry.size}`
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
    </div>
  );
};

export default QuerySection;

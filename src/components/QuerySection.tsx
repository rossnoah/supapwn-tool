import React, { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

interface QuerySectionProps {
  supabaseClient: SupabaseClient;
  addQueryResult: (result: string) => void;
  tables: string[];
}

const QuerySection: React.FC<QuerySectionProps> = ({
  supabaseClient,
  addQueryResult,
  tables,
}) => {
  const [table, setTable] = useState("");

  const querySupabase = async (table: string, query: string) => {
    const date = new Date().toLocaleString();
    try {
      const { data, error } = await supabaseClient.from(table).select(query);
      if (error) throw error;
      console.log(data);
      addQueryResult(
        `Table: ${table}\nQuery: ${query}\nDate: ${date}\n\n${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    } catch (err: any) {
      console.log(err);
      addQueryResult(
        `Table: ${table}\nQuery: ${query}\nDate: ${date}\n\nFailed to query: ${err.message}`
      );
    }
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
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => querySupabase(table, "*")}
      >
        Query
      </button>
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

import React, { useState, useEffect } from "react";
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
  const [companyName, setCompanyName] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [disclosureCredits, setDisclosureCredits] = useState("");
  const [vulnerabilityReport, setVulnerabilityReport] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedDisclosureCredits = localStorage.getItem("disclosureCredits");
    if (savedDisclosureCredits) {
      setDisclosureCredits(savedDisclosureCredits);
    }

    const checkAuthStatus = async () => {
      const user = (await supabaseClient.auth.getUser()).data.user;
      setIsAuthenticated(!!user);
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    localStorage.setItem("disclosureCredits", disclosureCredits);
  }, [disclosureCredits]);

  const fetchTableData = async (table: string) => {
    try {
      const { data, error } = await supabaseClient.from(table).select("*");
      if (error) throw error;
      console.log(table, data);
      return { table, data };
    } catch (err: any) {
      console.log(table, err);
      return { table, error: err.message };
    }
  };

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

  const processTablesInChunks = async (
    tables: string[],
    processFn: (table: string) => Promise<any>,
    chunkSize = 100
  ) => {
    const summary: any[] = [];

    for (let i = 0; i < tables.length; i += chunkSize) {
      const chunk = tables.slice(i, i + chunkSize);

      const promises = chunk.map(processFn);
      const results = await Promise.all(promises);

      results.forEach((entry) => {
        if (entry) {
          summary.push(entry);
        }
      });
    }

    return summary;
  };

  const queryAllTables = async () => {
    const summary = await processTablesInChunks(tables, fetchTableData);

    summary.forEach((entry) => {
      if (entry.error) {
        addQueryResult(`Table: ${entry.table} - ${entry.error}`, false);
      } else {
        addQueryResult(
          `Table: ${entry.table} - Size: ${entry.data.length}`,
          false
        );
      }
    });
    const summaryReport = summary
      .map(
        (entry) =>
          `Table: ${entry.table} - ${
            entry.error ? `Error: ${entry.error}` : `Size: ${entry.data.length}`
          }`
      )
      .join("\n");

    addQueryResult(`Summary Report:\n\n${summaryReport}`, true);
  };

  const generateVulnerabilityReport = async () => {
    const summary = await processTablesInChunks(tables, fetchTableData);

    const vulnerableTableNameList = summary
      .filter((entry) => entry.data && entry.data.length > 0)
      .map((entry) => ({
        table: entry.table,
        size: entry.data.length > 1000 ? "1000+" : entry.data.length,
      }));
    const vulnerableTables = vulnerableTableNameList
      .map(
        (entry) =>
          `${entry.table} (${
            entry.size >= 1000 ? "1000+" : entry.size
          } entries)`
      )
      .join(", ");

    let accessLinksText = "";
    if (!isAuthenticated) {
      const accessLinks = vulnerableTableNameList.map(
        (entry) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-expect-error
          `${supabaseClient.supabaseUrl}/rest/v1/${entry.table}?select=*&apikey=${supabaseClient.supabaseKey}`
      );

      accessLinksText = `Here is an example link using the API:\n${accessLinks
        .slice(0, 1)
        .join("\n")}`;
    }

    const report = `Hello ${companyName} team,
  
I wanted to let you know of an important security issue. Specifically, your Supabase database is not properly secured (with row level security or other measures). As a result, an attacker can access data stored in the Supabase instance used at ${companyUrl}.

Supabase instance in question:
URL: ${
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      supabaseClient.supabaseUrl
    }
Anon Key: ${
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      supabaseClient.supabaseKey
    }

This affects the following tables:
${vulnerableTables}

The data is accessible via the API or using the Supabase client as usual (which utilizes the mentioned API).
${accessLinksText}

Let me know if you need more information or have any further questions.

Best,
${disclosureCredits}`;

    setVulnerabilityReport(report);
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
      {/* Company Name and URL fields */}
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
      {/* Generate Report button */}
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
        onClick={generateVulnerabilityReport}
      >
        Generate Report
      </button>
      {/* Display vulnerability disclosure report if generated */}
      {vulnerabilityReport && (
        <div className="mt-4 w-full bg-gray-100 p-4 rounded">
          <h4 className="text-lg font-bold">Vulnerability Report:</h4>
          <pre className="mt-2 whitespace-pre-wrap text-xs">
            {vulnerabilityReport}
          </pre>
        </div>
      )}
    </div>
  );
};

export default QuerySection;
``;

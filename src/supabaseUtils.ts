import { SupabaseClient } from "@supabase/supabase-js";

// Define the type for the result entries
interface QueryResult {
  table: string;
  data: unknown[] | null;
  error: string | null;
}

export const logResult = (entry: QueryResult): void => {
  console.log(`Table: ${entry.table}:`, entry.data ? entry.data : entry.error);
};

declare global {
  interface Window {
    limit: number;
  }
}

window.limit = 100;

export const handleResult = (
  entry: QueryResult,
  query: string,
  date: string,
  addQueryResult: (data: string, bypassCharLimit?: boolean) => void,
  skipEmpty: boolean
): void => {
  if (entry.error) {
    addQueryResult(
      `Table: ${entry.table}\nQuery: ${query}\nDate: ${date}\n\nFailed to query: ${entry.error}`,
      false
    );
  } else {
    if (!skipEmpty || (entry.data && entry.data.length > 0)) {
      addQueryResult(
        `Table: ${
          entry.table
        }\nQuery: ${query}\nDate: ${date}\n\n${JSON.stringify(
          entry.data,
          null,
          2
        )}`,
        false
      );
    }
  }
};

export const fetchTableData = async (
  supabaseClient: SupabaseClient,
  table: string,
  query: string = "*",
  dontLogEmptyCollections: boolean = false
): Promise<QueryResult> => {
  try {
    const { data, error } = await supabaseClient
      .from(table)
      .select(query)
      .limit(window.limit);
    const result: QueryResult = {
      table,
      data,
      error: error ? error.message : null,
    };
    if (!dontLogEmptyCollections || (data && data.length > 0)) {
      logResult(result);
    }
    return result;
  } catch (err: unknown) {
    const error = err as Error;
    return { table, data: null, error: error.message };
  }
};

export const processTablesInChunks = async (
  tables: string[],
  processFn: (table: string) => Promise<QueryResult>,
  chunkSize = 20
): Promise<QueryResult[]> => {
  const summary: QueryResult[] = [];

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

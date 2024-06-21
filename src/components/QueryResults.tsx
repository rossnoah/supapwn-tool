import React from "react";

interface QueryResultsProps {
  queryResults: result[];
}

export interface result {
  data: string;
  bypasscharlimit?: boolean;
}

const MAX_CHARACTERS = 1000; // Define the maximum number of characters to display

const QueryResults: React.FC<QueryResultsProps> = ({ queryResults }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg w-4/5 text-xs font-mono">
      {queryResults.map((result, index) => (
        <pre key={index} className="mb-4 whitespace-pre-wrap">
          {result.bypasscharlimit || result.data.length <= MAX_CHARACTERS
            ? result.data
            : `${result.data.substring(0, MAX_CHARACTERS)}...`}
        </pre>
      ))}
    </div>
  );
};

export default QueryResults;

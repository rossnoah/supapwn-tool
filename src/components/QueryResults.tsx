import React from "react";

interface QueryResultsProps {
  queryResults: string[];
}

const QueryResults: React.FC<QueryResultsProps> = ({ queryResults }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg w-4/5 text-xs font-mono">
      {queryResults.map((result, index) => (
        <pre key={index} className="mb-4 whitespace-pre-wrap">
          {result}
        </pre>
      ))}
    </div>
  );
};

export default QueryResults;

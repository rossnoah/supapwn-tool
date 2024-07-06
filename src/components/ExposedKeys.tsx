import React from "react";

interface ExposedKeysProps {
  keys: string[];
}

const ExposedKeys: React.FC<ExposedKeysProps> = ({ keys }) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg w-4/5 text-xs font-mono mt-4">
      <ul>
        {keys.map((key, index) => (
          <li key={index} className="mb-4 whitespace-pre-wrap">
            {key}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExposedKeys;

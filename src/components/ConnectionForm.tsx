import React, { useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface ConnectionFormProps {
  setSupabaseClient: React.Dispatch<
    React.SetStateAction<SupabaseClient | null>
  >;
  discoverTables: (url: string, key: string) => Promise<void>;
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({
  setSupabaseClient,
  discoverTables,
}) => {
  const [status, setStatus] = useState("Not Connected");
  const [statusColor, setStatusColor] = useState("text-red-500");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(true);

  const createSupabaseClient = async (url: string, key: string) => {
    try {
      const client = createClient(url, key);
      const { data, error } = await client.from("test").select("*");
      console.log(data);
      console.log(error);

      if (error && error.code !== "42P01") {
        throw error;
      }

      setSupabaseClient(client);
      setStatus("Connected");
      setStatusColor("text-green-500");
      setError("");
      setShowForm(false);

      await discoverTables(url, key); // Discover tables after connecting
    } catch (err: any) {
      setStatus("Not Connected");
      setStatusColor("text-red-500");
      setError("Failed to connect: " + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center my-4 space-y-6 bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-7xl font-black text-center text-blue-600 mt-8">
        SupaPwn
      </h1>
      <h3 className="text-lg text-center text-gray-700">
        The easiest way to test your Supabase security.
      </h3>

      {showForm && (
        <div
          id="connection-form"
          className="flex flex-col items-center justify-center bg-gray-100 p-4 rounded-lg space-y-4 w-96"
        >
          <input
            type="text"
            placeholder="Url"
            id="url"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Key"
            id="key"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <div className="flex items-center justify-between w-full">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                const url = (document.getElementById("url") as HTMLInputElement)
                  .value;
                const key = (document.getElementById("key") as HTMLInputElement)
                  .value;
                createSupabaseClient(url, key);
              }}
            >
              Connect
            </button>
            <span id="status" className={`ml-4 ${statusColor}`}>
              {status}
            </span>
          </div>
          <p id="error" className="text-red-500 text-sm mt-2">
            {error}
          </p>
        </div>
      )}

      {!showForm && (
        <button
          id="show-form-btn"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Hide Connection Form" : "Show Connection Form"}
        </button>
      )}
    </div>
  );
};

export default ConnectionForm;
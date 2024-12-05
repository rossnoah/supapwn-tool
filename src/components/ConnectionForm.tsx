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
  const [pageURL, setPageURL] = useState("");
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");

  const createSupabaseClient = async (
    url: string,
    key: string,
    pageURL: string
  ) => {
    if (!url && !key && pageURL) {
      // Parse pageURL to get hostname

      if (!(pageURL.startsWith("http://") || pageURL.startsWith("https://"))) {
        pageURL = "https://" + pageURL;
      }
      const parsedUrl = new URL(pageURL);
      const hostName = parsedUrl.hostname;

      const corsProxy = "https://corsproxy.io/?url=";

      let bigString = "";
      let success = false;

      try {
        // Fetch the main page through the CORS proxy
        const response = await fetch(
          corsProxy.includes("allorigins")
            ? `${corsProxy}${encodeURIComponent(pageURL)}`
            : `${corsProxy}${pageURL}`
        );

        // Handle AllOrigins-specific structure
        const html = corsProxy.includes("allorigins")
          ? (await response.json()).contents
          : await response.text();

        bigString += html;

        // Extract all script tag sources
        const scriptTags = html.match(/<script.*?src="(.*?)".*?>/g);
        console.log("Script tags found:", scriptTags);

        if (scriptTags) {
          for (const scriptTag of scriptTags) {
            try {
              const scriptSrc = scriptTag.match(/src="(.*?)"/)?.[1];

              if (scriptSrc) {
                // Resolve relative URLs to absolute URLs
                const absoluteScriptSrc = new URL(
                  scriptSrc,
                  `https://${hostName}`
                ).href;

                // Fetch the script content through the CORS proxy
                const scriptResponse = await fetch(
                  corsProxy.includes("allorigins")
                    ? `${corsProxy}${encodeURIComponent(absoluteScriptSrc)}`
                    : `${corsProxy}${absoluteScriptSrc}`
                );

                const scriptHtml = corsProxy.includes("allorigins")
                  ? (await scriptResponse.json()).contents
                  : await scriptResponse.text();

                bigString += scriptHtml;
              }
            } catch (err) {
              console.error("scriptTag error:", scriptTag, err);
            }
          }
        }

        console.log("Collected page content and scripts:", bigString);

        // Extract Supabase key
        const supabaseKeyRegex =
          /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI[A-Za-z0-9+/=]*\.[A-Za-z0-9-_]+/;
        const supabaseKey = bigString.match(supabaseKeyRegex);

        if (supabaseKey) {
          key = supabaseKey[0]; // Use the first match as the key
          console.log("Auto-detected Supabase key:", key);
          success = true;
        } else {
          throw new Error("Supabase key not found in the fetched content.");
        }
      } catch (err) {
        console.error(`Failed with proxy: ${corsProxy}`, err);
      }

      if (!success) {
        console.error("CORS proxies failed or no Supabase key was found.");
        return;
      }
    }

    if (!url) {
      const bodyString = key.split(".")[1];
      const b64decoded = atob(bodyString);
      const jsonbody = JSON.parse(b64decoded);
      url = "https://" + jsonbody.ref + ".supabase.co";
      console.log("Auto-detected URL: " + url);
    }
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

      // Save connection details to local storage
      localStorage.setItem("supabaseUrl", url);
      localStorage.setItem("supabaseKey", key);

      await discoverTables(url, key); // Discover tables after connecting
    } catch (err: unknown) {
      const error = err as Error;
      setStatus("Not Connected");
      setStatusColor("text-red-500");
      setError("Failed to connect: " + error.message);
    }
  };

  const fillCachedConnection = () => {
    const cachedUrl = localStorage.getItem("supabaseUrl");
    const cachedKey = localStorage.getItem("supabaseKey");
    if (cachedUrl && cachedKey) {
      setUrl(cachedUrl);
      setKey(cachedKey);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center my-4 space-y-6 bg-white p-8 rounded-lg">
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
          {/* <input
            type="text"
            placeholder="Page URL (Use this or the other manual fields)"
            value={pageURL}
            onChange={(e) => setPageURL(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          /> */}
          <input
            type="text"
            placeholder="Url (Optional as the key contains the URL)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="text"
            placeholder="Key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <div className="flex items-center justify-between w-full">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => createSupabaseClient(url, key, pageURL)}
            >
              Connect
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
              onClick={fillCachedConnection}
            >
              Fill Cached
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

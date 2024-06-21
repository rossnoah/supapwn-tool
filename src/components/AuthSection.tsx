import React, { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

interface AuthSectionProps {
  supabaseClient: SupabaseClient;
}

const AuthSection: React.FC<AuthSectionProps> = ({ supabaseClient }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Not Authenticated");

  const handleLogin = async () => {
    try {
      const response = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      console.log(response);
      if (response.error) throw response.error;
      setStatus("Authenticated");
      setError("");
    } catch (err: any) {
      setError(err.message);
      setStatus("Not Authenticated");
    }
  };

  const handleRegister = async () => {
    try {
      const response = await supabaseClient.auth.signUp({ email, password });
      console.log(response);
      if (response.error) throw response.error;
      setStatus("Authenticated");
      setError("");
    } catch (err: any) {
      setError(err.message);
      setStatus("Not Authenticated");
    }
  };

  const handleAutoRegister = async () => {
    try {
      const autoEmail = "test@test.com";
      const autoPassword = "testtest";
      const response = await supabaseClient.auth.signUp({
        email: autoEmail,
        password: autoPassword,
      });
      console.log(response);
      if (response.error) throw response.error;
      setStatus("Authenticated");
      setError("");
    } catch (err: any) {
      setError(err.message);
      setStatus("Not Authenticated");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center my-4 space-y-6 bg-white p-8 rounded-lg shadow-lg">
      <h3 className="text-lg text-center text-gray-700">Authenticate</h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      />
      <div className="flex space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleLogin}
        >
          Login
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleRegister}
        >
          Register
        </button>
        <button
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleAutoRegister}
        >
          Auto Register
        </button>
      </div>
      <p className="text-sm mt-2">
        Status:{" "}
        <span
          className={`font-bold ${
            status === "Authenticated" ? "text-green-500" : "text-red-500"
          }`}
        >
          {status}
        </span>
      </p>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default AuthSection;

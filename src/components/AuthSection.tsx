import React, { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

interface AuthSectionProps {
  supabaseClient: SupabaseClient;
  isAuthenticated: boolean;
}

const AuthSection: React.FC<AuthSectionProps> = ({
  supabaseClient,
  isAuthenticated,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      console.log(response);
      if (response.error) throw response.error;
      setError("");
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await supabaseClient.auth.signUp({ email, password });
      console.log(response);
      if (response.error) throw response.error;
      setError("");
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  const handleAutoLoginOrRegister = async () => {
    const autoEmail = "95t3wg29ce992b014zvf@test.com"; //this is just inteanded to be an email that is not already in use.
    const autoPassword = ">}7H96t]E9[V1£t.%).x"; //this is not inteaded to be secure. It is just inteanded to be random and pass password requirements.

    try {
      // Try logging in first
      const loginResponse = await supabaseClient.auth.signInWithPassword({
        email: autoEmail,
        password: autoPassword,
      });

      if (loginResponse.error || !loginResponse.data.user) {
        // If login fails, try registering
        const registerResponse = await supabaseClient.auth.signUp({
          email: autoEmail,
          password: autoPassword,
        });

        if (registerResponse.error) throw registerResponse.error;
        console.log(registerResponse);
      } else {
        console.log(loginResponse);
      }

      // If either login or registration succeeds
      setError("");
    } catch (err: unknown) {
      // If both login and registration fail
      setError((err as Error).message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 bg-white p-8 rounded-lg shadow-lg">
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
      <div className="flex flex-wrap justify-center gap-4">
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
          onClick={handleAutoLoginOrRegister}
        >
          Auto Register
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            supabaseClient.auth.signOut();
            //delete everything from local storage that starts with sb-
            Object.keys(localStorage).forEach((key) => {
              if (key.startsWith("sb-")) {
                localStorage.removeItem(key);
              }
            });
            console.log("Signed out");
          }}
        >
          Sign out
        </button>
        <button
          className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded"
          onClick={async () => {
            console.log(
              "User:",
              (await supabaseClient.auth.getUser()).data.user
            );
          }}
        >
          Print User
        </button>
      </div>
      <p className="text-sm mt-2">
        Status:{" "}
        <span
          className={`font-bold ${
            isAuthenticated ? "text-green-500" : "text-red-500"
          }`}
        >
          {isAuthenticated ? "Authenticated" : "Not Authenticated"}
        </span>
      </p>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default AuthSection;

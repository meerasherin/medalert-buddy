
import React from "react";
import LoginForm from "@/components/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-mymed-50 to-mymed-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-8">
        <h1 className="text-3xl font-bold text-center text-mymed-900 mb-1">MyMed</h1>
        <p className="text-center text-gray-600 mb-8">Your personal medicine reminder</p>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;

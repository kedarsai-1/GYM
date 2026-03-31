import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { motion } from "framer-motion";
import { pageAnimation, popAnimation } from "../animations/pageAnimations";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/admin/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageAnimation}
      initial="hidden"
      animate="show"
      className="relative flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <motion.form
        variants={popAnimation}
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-2xl border border-orange-200/60 bg-white/95 p-6 shadow-xl backdrop-blur"
      >
        <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">Sign in to access United Gym</p>

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="mt-4 w-full rounded-lg border border-slate-300 p-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="mt-3 w-full rounded-lg border border-slate-300 p-2"
        />

        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-orange-600 px-4 py-2 text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </motion.form>
    </motion.div>
  );
}

export default Login;

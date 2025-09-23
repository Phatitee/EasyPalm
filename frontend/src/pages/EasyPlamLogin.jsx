import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // ✅ เพิ่มตรงนี้

export default function EasyPlamLogin() {
  const navigate = useNavigate(); // ✅ hook สำหรับเปลี่ยนหน้า
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [remember, setRemember] = useState(true);

  const validate = () => {
    if (!email) return "Please enter your email.";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return "Please enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);

      // ✅ หลังจาก sign in เสร็จให้ redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }, 900);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-indigo-50 flex items-center justify-center p-6">
      {/* ... โค้ด UI เดิมทั้งหมด ... */}
      {/* Decorative floating shapes */}{" "}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -left-20 -top-20 w-80 h-80 bg-gradient-to-tr from-emerald-300 to-indigo-400 rounded-3xl blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="absolute -right-24 bottom-0 w-96 h-96 bg-gradient-to-tr from-pink-300 to-yellow-300 rounded-full blur-3xl"
        />
      </div>{" "}
      <motion.div
        className="relative z-10 flex max-w-5xl w-full rounded-2xl shadow-2xl overflow-hidden"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {" "}
        {/* Left: illustration / branding */}{" "}
        <div
          className="hidden lg:flex lg:w-2/5 bg-[linear-gradient(135deg,#0ea5a7_0%,#7c3aed_100%)] 
        items-center justify-center p-12 text-white"
        >
          {" "}
          <div className="space-y-6">
            {" "}
            <div className="flex items-center gap-3">
              {" "}
              <div className="bg-white/20 p-2 rounded-full">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C13.1046 2 14 2.89543 14 4V10H18C19.1046 10 20 10.8954 20 12V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V12C4 10.8954 4.89543 10 6 10H10V4C10 2.89543 10.8954 2 12 2Z"
                    fill="white"
                    fillOpacity="0.9"
                  />
                </svg>{" "}
              </div>{" "}
              <div>
                {" "}
                <h3 className="text-xl font-semibold">Easy Plam</h3>{" "}
                <p className="text-sm opacity-90">
                  Smooth. Smart. Palm farming simplified.
                </p>
              </div>{" "}
            </div>{" "}
            <h2 className="text-3xl font-bold max-w-xs">
              Welcome back — make farming less grind, more growth.
            </h2>{" "}
            <p className="text-sm max-w-xs opacity-90">
              Sign in to access your dashboard, tasks and smart suggestions.
              Designed for palm farmers and field managers who want to run
              smarter, not harder.
            </p>{" "}
            <div className="flex items-center gap-3">
              {" "}
              <div className="bg-white/20 px-3 py-2 rounded-lg text-sm">
                Fast insights
              </div>
              <div className="bg-white/20 px-3 py-2 rounded-lg text-sm">
                Task automations
              </div>{" "}
              <div className="bg-white/20 px-3 py-2 rounded-lg text-sm">
                Offline sync
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {/* Right: Login form */}{" "}
        <div className="w-full lg:w-3/5 bg-white p-8 md:p-12">
          {" "}
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              {" "}
              <h1 className="text-2xl font-extrabold">
                Sign in to Easy Plam
              </h1>{" "}
              <p className="text-sm text-slate-500">
                Use your account to manage fields, schedules and harvests.
              </p>{" "}
            </div>{" "}
            {success ? (
              <div className="rounded-xl p-4 bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                {" "}
                <CheckCircle className="w-6 h-6 text-emerald-600" />{" "}
                <div>
                  {" "}
                  <div className="font-semibold">Signed in</div>{" "}
                  <div className="text-sm text-slate-600">
                    Welcome back — redirecting to your dashboard...
                  </div>{" "}
                </div>{" "}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {" "}
                <div>
                  {" "}
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>{" "}
                  <div className="mt-2 relative">
                    {" "}
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="you@farmmail.com"
                      aria-label="Email"
                    />{" "}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60">
                      {" "}
                      <Mail className="w-5 h-5" />{" "}
                    </div>{" "}
                  </div>{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>{" "}
                  <div className="mt-2 relative">
                    {" "}
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      placeholder="Enter your password"
                      aria-label="Password"
                    />{" "}
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 p-1"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {" "}
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}{" "}
                    </button>{" "}
                  </div>{" "}
                </div>{" "}
                <div className="flex items-center justify-between text-sm">
                  {" "}
                  <label className="flex items-center gap-2">
                    {" "}
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={() => setRemember((r) => !r)}
                      className="form-checkbox h-4 w-4 rounded"
                    />{" "}
                    <span>Remember me</span>{" "}
                  </label>{" "}
                  <a href="#" className="text-emerald-600 hover:underline">
                    Forgot password?
                  </a>{" "}
                </div>{" "}
                {error && <div className="text-sm text-red-600">{error}</div>}{" "}
                <div className="pt-2">
                  {" "}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg py-3 font-semibold shadow-md bg-gradient-to-r from-emerald-500 to-indigo-600 text-white hover:scale-[1.01] transform-gpu transition"
                  >
                    {" "}
                    {loading ? "Signing in..." : "Sign in"}{" "}
                  </button>{" "}
                </div>{" "}
                <div className="flex items-center gap-3 my-3">
                  {" "}
                  <div className="flex-1 h-px bg-slate-100" />{" "}
                  <div className="text-xs text-slate-400">or continue with</div>{" "}
                  <div className="flex-1 h-px bg-slate-100" />{" "}
                </div>{" "}
                <div className="grid grid-cols-2 gap-3">
                  {" "}
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 py-2 flex items-center justify-center gap-2 text-sm hover:bg-slate-50"
                  >
                    {" "}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21.6 12.227c0-.82-.07-1.605-.2-2.36H12v4.472h5.52c-.238 1.28-.96 2.37-2.04 3.1v2.57h3.3c1.93-1.777 3.03-4.4 3.03-7.782z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 22c2.7 0 4.98-.9 6.64-2.45l-3.3-2.57c-.92.62-2.1.99-3.34.99-2.56 0-4.73-1.73-5.5-4.06H3.02v2.55C4.69 19.94 8.05 22 12 22z"
                        fill="#34A853"
                      />
                      <path
                        d="M6.5 13.88a6.14 6.14 0 010-3.76V7.57H3.02A9.99 9.99 0 002 12c0 1.58.37 3.08 1.02 4.43l3.46-2.55z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 6.4c1.47 0 2.8.51 3.85 1.5l2.88-2.88C16.98 3.5 14.7 2.5 12 2.5 8.05 2.5 4.69 4.56 3.02 7.57l3.46 2.55C7.27 8.13 9.44 6.4 12 6.4z"
                        fill="#EA4335"
                      />
                    </svg>{" "}
                    Google{" "}
                  </button>{" "}
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 py-2 flex items-center justify-center gap-2 text-sm hover:bg-slate-50"
                  >
                    {" "}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H8.9v-2.9h1.58V9.8c0-1.56.93-2.42 2.36-2.42.68 0 1.39.12 1.39.12v1.53h-.78c-.77 0-1.01.48-1.01.97v1.17h1.72l-.28 2.9h-1.44v6.99C18.34 21.12 22 16.99 22 12z"
                        fill="#1877F2"
                      />
                    </svg>{" "}
                    Facebook{" "}
                  </button>{" "}
                </div>{" "}
                <p className="text-center text-sm text-slate-500 mt-4">
                  Don’t have an account?{" "}
                  <a href="#" className="font-semibold text-emerald-600">
                    Sign up
                  </a>
                </p>{" "}
              </form>
            )}{" "}
            {/* subtle footer */}{" "}
            <div className="mt-6 text-xs text-slate-400 text-center">
              By continuing you agree to our{" "}
              <a href="#" className="underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="underline">
                Privacy Policy
              </a>
              .
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </motion.div>
    </div>
  );
}

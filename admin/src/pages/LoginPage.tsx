import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Phone, Sparkles, LoaderCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Scene3D from "@/components/Scene3D";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(phone.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } }; message?: string })
          ?.response?.data?.error ||
        (err as Error)?.message ||
        "Could not log in.";
      setError(message);
    }
  }

  return (
    <div className='bg-base-950 relative flex min-h-screen items-center justify-center overflow-hidden px-4'>
      <Scene3D variant='login' />
      <div
        className='pointer-events-none fixed inset-0 -z-10'
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(139,92,246,0.18), transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className='glass-panel w-full max-w-sm rounded-3xl p-8 shadow-2xl'
      >
        <div className='mb-7 flex flex-col items-center text-center'>
          <div className='animate-float mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 shadow-lg shadow-violet-500/40'>
            <Sparkles size={26} className='text-white' />
          </div>
          <h1 className='text-base-100 text-xl font-semibold'>
            Hulu Service Admin
          </h1>
          <p className='text-base-400 mt-1 text-sm'>
            Sign in to manage bookings, providers &amp; prices
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='text-base-300 mb-1.5 block text-xs font-medium'>
              Phone number
            </label>
            <div className='relative'>
              <Phone
                size={16}
                className='text-base-400 absolute top-1/2 left-3 -translate-y-1/2'
              />
              <input
                type='text'
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder='0900000000'
                className='border-base-600 bg-base-900/60 text-base-100 placeholder:text-base-400 focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40 w-full rounded-xl border py-2.5 pr-3 pl-9 text-sm outline-none transition-colors'
              />
            </div>
          </div>

          <div>
            <label className='text-base-300 mb-1.5 block text-xs font-medium'>
              Password
            </label>
            <div className='relative'>
              <Lock
                size={16}
                className='text-base-400 absolute top-1/2 left-3 -translate-y-1/2'
              />
              <input
                type='password'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
                className='border-base-600 bg-base-900/60 text-base-100 placeholder:text-base-400 focus:border-violet-400/60 focus:ring-1 focus:ring-violet-400/40 w-full rounded-xl border py-2.5 pr-3 pl-9 text-sm outline-none transition-colors'
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className='rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-300'
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type='submit'
            disabled={loading}
            className='mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-opacity disabled:opacity-60'
          >
            {loading ? (
              <>
                <LoaderCircle size={16} className='animate-spin' />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

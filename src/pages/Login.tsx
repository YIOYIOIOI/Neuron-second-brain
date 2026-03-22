import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const { login } = useStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      login(username.trim());
      toast.success(t('loginSuccess'));
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <h1 className="text-5xl font-serif tracking-tighter mb-8 text-center">SB.</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-xs uppercase tracking-widest font-mono text-text-secondary">
              {t('username')}
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('enterUsername')}
              className="bg-transparent border-b border-border-subtle pb-2 text-xl font-light focus:outline-none focus:border-text-primary transition-colors"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={!username.trim()}
            className="mt-4 bg-text-primary text-bg-primary py-4 rounded-sm text-sm uppercase tracking-widest font-medium hover:bg-text-secondary transition-colors disabled:opacity-50"
          >
            {t('signIn')}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

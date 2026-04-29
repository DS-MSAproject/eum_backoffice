import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminLoginMutation } from '@/api/authApi'
import { ShieldCheck } from 'lucide-react'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [login, { isLoading, error }] = useAdminLoginMutation()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(form).unwrap()
      navigate('/dashboard')
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3ea76e]/10 rounded-2xl mb-4">
            <ShieldCheck size={32} className="text-[#3ea76e]" />
          </div>
          <h1 className="text-[28px] font-black text-white tracking-tight">EUM Backoffice</h1>
          <p className="text-slate-400 text-[14px] mt-1">관리자 전용 시스템</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-[13px] font-bold text-slate-400 mb-2">이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="admin@eum.com"
              className="w-full bg-[#0f172a] text-white border border-slate-600 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#3ea76e] transition-colors placeholder:text-slate-600"
            />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-slate-400 mb-2">비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="••••••••"
              className="w-full bg-[#0f172a] text-white border border-slate-600 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#3ea76e] transition-colors placeholder:text-slate-600"
            />
          </div>
          {error && (
            <p className="text-red-400 text-[13px] font-bold">
              {error.data?.message ?? '로그인에 실패했습니다.'}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#3ea76e] hover:bg-[#318a57] text-white font-black text-[15px] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}

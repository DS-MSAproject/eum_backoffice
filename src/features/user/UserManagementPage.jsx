import { useState } from 'react'
import { Search, Users, User, Shield, ShoppingBag } from 'lucide-react'
import { useGetAdminUsersQuery } from '@/api/userApi'
import { formatNumber } from '@/shared/utils/formatters'
import Spinner from '@/shared/components/Spinner'

const PROVIDER_BADGE = {
  local:  { label: '이메일',  cls: 'bg-slate-700 text-slate-300' },
  google: { label: 'Google', cls: 'bg-blue-500/20 text-blue-400' },
  kakao:  { label: 'Kakao',  cls: 'bg-yellow-500/20 text-yellow-300' },
  naver:  { label: 'Naver',  cls: 'bg-green-500/20 text-green-400' },
}

function ProviderBadge({ provider }) {
  const b = PROVIDER_BADGE[provider] ?? PROVIDER_BADGE.local
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.cls}`}>{b.label}</span>
  )
}

function UserRow({ user }) {
  const initial = user.name?.[0] ?? user.email?.[0] ?? '?'
  const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'

  return (
    <tr className="border-b border-slate-700/40 hover:bg-slate-700/20 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {user.profileImgUrl ? (
            <img src={user.profileImgUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#3ea76e]/20 flex items-center justify-center">
              <span className="text-[#3ea76e] text-[11px] font-bold">{initial.toUpperCase()}</span>
            </div>
          )}
          <div>
            <p className="text-[13px] font-semibold text-white">{user.name ?? '-'}</p>
            <p className="text-[11px] text-slate-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <ProviderBadge provider={user.provider} />
      </td>
      <td className="px-4 py-3 text-[12px] text-slate-400">{user.phoneNumber ?? '-'}</td>
      <td className="px-4 py-3">
        {user.emailVerified ? (
          <span className="text-[11px] font-bold text-[#3ea76e]">인증</span>
        ) : (
          <span className="text-[11px] font-bold text-slate-500">미인증</span>
        )}
      </td>
      <td className="px-4 py-3 text-[12px] text-slate-400">{joined}</td>
    </tr>
  )
}

export default function UserManagementPage() {
  const [keyword, setKeyword] = useState('')
  const [inputVal, setInputVal] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading } = useGetAdminUsersQuery({ keyword, page, size: 20 })

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(inputVal)
    setPage(0)
  }

  const totalElements = data?.totalElements ?? 0
  const totalPages    = data?.totalPages ?? 1
  const users         = data?.content ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-black text-white">회원 관리</h2>
          <p className="text-[13px] text-slate-400 mt-0.5">총 {formatNumber(totalElements)}명</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: '전체 회원',   value: formatNumber(totalElements), color: 'text-blue-400 bg-blue-400/10' },
          { icon: Shield, label: '이메일 인증', value: formatNumber(users.filter(u => u.emailVerified).length), color: 'text-[#3ea76e] bg-[#3ea76e]/10' },
          { icon: ShoppingBag, label: '소셜 가입', value: formatNumber(users.filter(u => u.provider !== 'local').length), color: 'text-yellow-400 bg-yellow-400/10' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-[#1e293b] rounded-xl p-4 border border-slate-700/50">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} mb-2`}>
              <Icon size={16} />
            </div>
            <p className="text-[22px] font-black text-white">{value}</p>
            <p className="text-[12px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-2.5">
          <Search size={14} className="text-slate-500 shrink-0" />
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="이름, 이메일 검색..."
            className="flex-1 bg-transparent text-[13px] text-white placeholder-slate-500 outline-none"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-[#3ea76e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#35916a] transition-colors"
        >
          검색
        </button>
      </form>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700/50 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size={28} /></div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-500">
            <User size={32} className="mb-2" />
            <p className="text-[13px]">회원이 없습니다.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/60">
                {['회원', '가입 방식', '연락처', '이메일 인증', '가입일'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => <UserRow key={u.id} user={u} />)}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-[12px] text-slate-400 border border-slate-700 rounded-lg hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>
          <span className="text-[12px] text-slate-400">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-[12px] text-slate-400 border border-slate-700 rounded-lg hover:border-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}

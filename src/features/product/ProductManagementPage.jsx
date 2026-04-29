import { useState } from 'react'
import {
  useGetAdminProductsQuery,
  useDeleteAdminProductMutation,
  useCreateAdminProductMutation,
} from '@/api/productApi'
import { formatPrice, formatDate } from '@/shared/utils/formatters'
import DataTable from '@/shared/components/DataTable'
import ProductStatusBadge from './components/ProductStatusBadge'
import ProductForm from './components/ProductForm'
import ProductEditModal from './components/ProductEditModal'
import ProductDetailModal from './components/ProductDetailModal'
import { Eye, Pencil, Trash2 } from 'lucide-react'

const LIFECYCLE_STATUSES = ['', 'DRAFT', 'REVIEW', 'READY', 'ON_SALE', 'DISCONTINUED']
const TABS = ['상품 목록', '상품 등록']


// ── Main page ──────────────────────────────────────────
export default function ProductManagementPage() {
  const [tab, setTab]               = useState(0)
  const [page, setPage]             = useState(0)
  const [lifecycleFilter, setFilter] = useState('')
  const [selectedId, setSelectedId]  = useState(null)
  const [editingId, setEditingId]    = useState(null)

  const { data, isLoading } = useGetAdminProductsQuery(
    { page, size: 20, lifecycleStatus: lifecycleFilter || undefined },
    { skip: tab !== 0 }
  )
  const [deleteProduct] = useDeleteAdminProductMutation()
  const [createProduct, { isLoading: creating }] = useCreateAdminProductMutation()

  const products = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  const handleDelete = async (productId, e) => {
    e.stopPropagation()
    if (!confirm('정말 삭제하시겠습니까?')) return
    await deleteProduct(productId)
    if (selectedId === productId) setSelectedId(null)
  }

  const handleCreate = async (formData) => {
    await createProduct(formData)
    setTab(0)
  }

  const columns = [
    {
      key: 'productName',
      header: '상품명',
      render: (r) => (
        <div>
          <p className="text-[13px] font-medium text-white">{r.productName}</p>
          <p className="text-[11px] text-slate-400">{r.brandName}</p>
        </div>
      ),
    },
    { key: 'categoryName', header: '카테고리', render: (r) => <span className="text-[12px] text-slate-300">{r.categoryName}</span> },
    { key: 'price', header: '가격', render: (r) => <span className="text-[12px]">{formatPrice(r.price)}</span> },
    { key: 'lifecycleStatus', header: '상태', render: (r) => <ProductStatusBadge status={r.lifecycleStatus} /> },
    { key: 'optionCount', header: '옵션', render: (r) => <span className="text-[12px] text-slate-400">{r.optionCount}개</span> },
    { key: 'createdAt', header: '등록일', render: (r) => <span className="text-[11px] text-slate-400">{formatDate(r.createdAt)}</span> },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedId(r.productId)}
            className="p-1.5 text-slate-400 hover:text-white transition"
            title="상세 보기"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setEditingId(r.productId)}
            className="p-1.5 text-slate-400 hover:text-[#3ea76e] transition"
            title="수정"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => handleDelete(r.productId, e)}
            className="p-1.5 text-slate-400 hover:text-red-400 transition"
            title="삭제"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#0f172a] rounded-xl p-1 w-fit">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition ${
                tab === i ? 'bg-[#3ea76e] text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab 0: 상품 목록 */}
        {tab === 0 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {LIFECYCLE_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => { setFilter(s); setPage(0) }}
                  className={`px-3 py-1 rounded-lg text-[12px] font-medium transition ${
                    lifecycleFilter === s
                      ? 'bg-[#3ea76e] text-white'
                      : 'bg-[#1e293b] text-slate-400 hover:text-white'
                  }`}
                >
                  {s === '' ? '전체' : s === 'DRAFT' ? '임시저장' : s === 'REVIEW' ? '검수중' :
                   s === 'READY' ? '판매대기' : s === 'ON_SALE' ? '판매중' : '판매종료'}
                </button>
              ))}
            </div>

            <DataTable
              columns={columns}
              data={products}
              isLoading={isLoading}
              onRowClick={(r) => setSelectedId(r.productId)}
            />

            {totalPages > 1 && (
              <div className="flex gap-2 justify-center">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 text-[12px] bg-[#1e293b] text-slate-300 rounded disabled:opacity-40"
                >
                  이전
                </button>
                <span className="text-[12px] text-slate-400 self-center">
                  {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 text-[12px] bg-[#1e293b] text-slate-300 rounded disabled:opacity-40"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 1: 상품 등록 */}
        {tab === 1 && (
          <div className="max-w-2xl">
            <ProductForm onSubmit={handleCreate} isLoading={creating} submitLabel="상품 등록" />
          </div>
        )}

      {/* Detail modal */}
      {selectedId && (
        <ProductDetailModal
          productId={selectedId}
          onClose={() => setSelectedId(null)}
          onEdit={() => { setEditingId(selectedId); setSelectedId(null) }}
        />
      )}

      {/* Edit modal */}
      {editingId && (
        <ProductEditModal
          productId={editingId}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  )
}


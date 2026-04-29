import { useState } from 'react'
import {
  useGetAdminProductsQuery,
  useDeleteAdminProductMutation,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useGetAdminProductDetailQuery,
} from '@/api/productApi'
import { formatPrice, formatDate } from '@/shared/utils/formatters'
import DataTable from '@/shared/components/DataTable'
import Spinner from '@/shared/components/Spinner'
import ProductStatusBadge from './components/ProductStatusBadge'
import ProductLifecycleFlow from './components/ProductLifecycleFlow'
import ProductForm from './components/ProductForm'
import BulkUploadPanel from './components/BulkUploadPanel'
import { Eye, Pencil, Trash2, X } from 'lucide-react'

const LIFECYCLE_STATUSES = ['', 'DRAFT', 'REVIEW', 'READY', 'ON_SALE', 'DISCONTINUED']
const TABS = ['상품 목록', '상품 등록', '대량 업로드']

// ── Detail/Edit side panel ─────────────────────────────
function ProductDetailPanel({ productId, onClose }) {
  const { data: product, isLoading } = useGetAdminProductDetailQuery(productId, { skip: !productId })
  const [editMode, setEditMode] = useState(false)
  const [updateProduct, { isLoading: updating }] = useUpdateAdminProductMutation()

  if (isLoading) return <div className="p-6"><Spinner /></div>
  if (!product) return null

  const handleUpdate = async (formData) => {
    await updateProduct({ productId, ...formData })
    setEditMode(false)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div>
          <p className="text-[14px] font-bold text-white">{product.productName}</p>
          <p className="text-[11px] text-slate-400">ID: {product.productId}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditMode((v) => !v)}
            className="p-1.5 text-slate-400 hover:text-white transition"
          >
            <Pencil size={14} />
          </button>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white transition">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Lifecycle flow */}
        <div className="bg-[#1e293b] rounded-xl p-4">
          <p className="text-[12px] text-slate-400 mb-3">상품 상태 흐름</p>
          <ProductLifecycleFlow productId={productId} currentStatus={product.lifecycleStatus} />
        </div>

        {editMode ? (
          <ProductForm
            initialValues={{
              categoryId: product.categoryName,
              productName: product.productName,
              content: product.content,
              price: String(product.price),
              brandName: product.brandName ?? '',
              imageUrl: product.imageUrl ?? '',
              tags: product.tags ?? '',
              keywords: product.keywords ?? '',
              allergens: product.allergens ?? '',
              ingredients: product.ingredients ?? '',
              deliveryFee: String(product.deliveryFee ?? 0),
              deliveryMethod: product.deliveryMethod ?? '일반택배',
              initialStock: '0',
              options: (product.options ?? []).map((o) => ({
                optionName: o.optionName ?? '',
                extraPrice: String(o.extraPrice ?? 0),
              })),
            }}
            onSubmit={handleUpdate}
            isLoading={updating}
            submitLabel="수정 저장"
          />
        ) : (
          <div className="space-y-3">
            <InfoRow label="카테고리"    value={product.categoryName} />
            <InfoRow label="브랜드"      value={product.brandName} />
            <InfoRow label="가격"        value={formatPrice(product.price)} />
            <InfoRow label="배송비"      value={formatPrice(product.deliveryFee)} />
            <InfoRow label="배송방법"    value={product.deliveryMethod} />
            <InfoRow label="알러지"      value={product.allergens} highlight={!product.allergens} />
            <InfoRow label="성분"        value={product.ingredients} />
            <InfoRow label="태그"        value={product.tags} />
            <InfoRow label="등록일"      value={formatDate(product.createdAt)} />
            <InfoRow label="수정일"      value={formatDate(product.updatedAt)} />

            {product.options?.length > 0 && (
              <div>
                <p className="text-[11px] text-slate-500 mb-1">옵션 ({product.options.length}개)</p>
                <div className="space-y-1">
                  {product.options.map((o) => (
                    <div key={o.optionId} className="flex justify-between text-[12px] bg-[#0f172a] rounded px-3 py-1.5">
                      <span className="text-slate-300">{o.optionName ?? '기본'}</span>
                      <span className="text-slate-400">{o.extraPrice > 0 ? `+${formatPrice(o.extraPrice)}` : '기본가'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value, highlight }) {
  if (!value && !highlight) return null
  return (
    <div className="flex gap-3">
      <span className="text-[11px] text-slate-500 w-20 shrink-0">{label}</span>
      <span className={`text-[12px] ${highlight ? 'text-yellow-400 italic' : 'text-slate-300'}`}>
        {value ?? '미입력'}
      </span>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────
export default function ProductManagementPage() {
  const [tab, setTab]               = useState(0)
  const [page, setPage]             = useState(0)
  const [lifecycleFilter, setFilter] = useState('')
  const [selectedId, setSelectedId]  = useState(null)

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
          >
            <Eye size={14} />
          </button>
          <button
            onClick={(e) => handleDelete(r.productId, e)}
            className="p-1.5 text-slate-400 hover:text-red-400 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex gap-4 h-full min-h-0">
      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-5">
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

        {/* Tab 2: 대량 업로드 */}
        {tab === 2 && <BulkUploadPanel />}
      </div>

      {/* Side panel */}
      {selectedId && (
        <div className="w-96 shrink-0 bg-[#1e293b] rounded-2xl border border-slate-700/50 overflow-hidden">
          <ProductDetailPanel productId={selectedId} onClose={() => setSelectedId(null)} />
        </div>
      )}
    </div>
  )
}

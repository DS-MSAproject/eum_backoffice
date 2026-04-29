import { useState, useEffect } from 'react'
import { X, Pencil, Tag, Truck, Star, Package, Calendar, RefreshCw, AlertTriangle } from 'lucide-react'
import { useGetAdminProductDetailQuery } from '@/api/productApi'
import { formatPrice, formatDate } from '@/shared/utils/formatters'
import ProductLifecycleFlow from './ProductLifecycleFlow'
import ProductStatusBadge from './ProductStatusBadge'
import Spinner from '@/shared/components/Spinner'

// ── 이미지 갤러리 ──────────────────────────────────────
function ImageGallery({ images }) {
  const [active, setActive] = useState(() => images.findIndex((i) => i.isMain) ?? 0)
  if (!images?.length) return null

  const idx = Math.min(active, images.length - 1)

  return (
    <div className="space-y-2">
      {/* 메인 이미지 */}
      <div className="w-full rounded-xl overflow-hidden bg-[#0f172a] border border-slate-700/60" style={{ aspectRatio: '4/3' }}>
        <img
          src={images[idx]?.imageUrl}
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
      {/* 썸네일 */}
      {images.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === idx ? 'border-[#3ea76e]' : 'border-slate-700 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 정보 라벨 ──────────────────────────────────────────
function InfoBadge({ icon: Icon, label, value, accent }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-slate-700/40 last:border-0">
      <div className="mt-0.5 shrink-0 text-slate-500">
        <Icon size={13} />
      </div>
      <span className="text-[11px] text-slate-500 w-16 shrink-0 mt-0.5">{label}</span>
      <span className={`text-[12px] leading-relaxed ${accent ? 'text-yellow-400' : 'text-slate-200'}`}>
        {value}
      </span>
    </div>
  )
}

// ── 메인 컴포넌트 ──────────────────────────────────────
export default function ProductDetailModal({ productId, onClose, onEdit }) {
  const { data: product, isLoading } = useGetAdminProductDetailQuery(productId, { skip: !productId })

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!productId) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* 드로어 패널 */}
      <div className="h-full w-full max-w-xl bg-[#0f172a] border-l border-slate-700/80 shadow-2xl flex flex-col overflow-hidden animate-slide-in">

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner size={32} />
          </div>
        ) : !product ? null : (
          <>
            {/* ── 헤더 ── */}
            <div className="shrink-0 px-5 pt-5 pb-4 border-b border-slate-700/60">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* 대표 이미지 썸네일 */}
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <Package size={20} className="text-slate-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[15px] font-black text-white leading-tight truncate">
                      {product.productName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-slate-500">#{product.productId}</span>
                      {product.brandName && (
                        <>
                          <span className="text-slate-700">·</span>
                          <span className="text-[11px] text-slate-400">{product.brandName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3ea76e]/15 text-[#3ea76e] border border-[#3ea76e]/30 rounded-lg text-[12px] font-semibold hover:bg-[#3ea76e]/25 transition-colors"
                  >
                    <Pencil size={12} /> 수정
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* 상태 + 핵심 수치 */}
              <div className="mt-4 flex items-center gap-3">
                <ProductStatusBadge status={product.lifecycleStatus} />
                <div className="flex-1" />
                <div className="text-right">
                  <p className="text-[20px] font-black text-white">{formatPrice(product.price)}</p>
                  {product.deliveryFee > 0 ? (
                    <p className="text-[11px] text-slate-400">배송비 {formatPrice(product.deliveryFee)}</p>
                  ) : (
                    <p className="text-[11px] text-[#3ea76e]">무료배송</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── 스크롤 바디 ── */}
            <div className="flex-1 overflow-y-auto">

              {/* 상태 전환 */}
              <section className="px-5 py-4 border-b border-slate-700/40">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">판매 상태</p>
                <ProductLifecycleFlow productId={productId} currentStatus={product.lifecycleStatus} />
              </section>

              {/* 이미지 갤러리 */}
              {product.images?.length > 0 && (
                <section className="px-5 py-4 border-b border-slate-700/40">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                    상품 이미지 <span className="text-slate-600 normal-case font-normal ml-1">{product.images.length}개</span>
                  </p>
                  <ImageGallery images={product.images} />
                </section>
              )}

              {/* 상세 이미지 */}
              {product.detailImages?.length > 0 && (
                <section className="px-5 py-4 border-b border-slate-700/40">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                    상세 이미지 <span className="text-slate-600 normal-case font-normal ml-1">{product.detailImages.length}개</span>
                  </p>
                  <div className="space-y-2">
                    {product.detailImages.map((di, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-slate-700/60 bg-[#0f172a]">
                        <img src={di.imageUrl} alt="" className="w-full object-contain" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 옵션 */}
              {product.options?.length > 0 && (
                <section className="px-5 py-4 border-b border-slate-700/40">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                    옵션 <span className="text-slate-600 normal-case font-normal ml-1">{product.options.length}개</span>
                  </p>
                  <div className="space-y-1.5">
                    {product.options.map((o, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#3ea76e]/60" />
                          <span className="text-[13px] text-slate-200">{o.optionName ?? '기본'}</span>
                        </div>
                        <span className={`text-[12px] font-semibold ${o.extraPrice > 0 ? 'text-[#3ea76e]' : 'text-slate-500'}`}>
                          {o.extraPrice > 0 ? `+${formatPrice(o.extraPrice)}` : '기본가'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 상품 정보 */}
              <section className="px-5 py-4 border-b border-slate-700/40">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">상품 정보</p>
                <div>
                  <InfoBadge icon={Tag}      label="카테고리"  value={product.categoryName} />
                  <InfoBadge icon={Truck}     label="배송방법"  value={product.deliveryMethod} />
                  <InfoBadge icon={Star}      label="태그"      value={product.tags} />
                  <InfoBadge icon={Package}   label="키워드"    value={product.keywords} />
                  {product.allergens && (
                    <InfoBadge icon={AlertTriangle} label="알러지" value={product.allergens} accent />
                  )}
                  {product.ingredients && (
                    <InfoBadge icon={RefreshCw} label="성분" value={product.ingredients} />
                  )}
                </div>
              </section>

              {/* 상품 설명 */}
              {product.content && (
                <section className="px-5 py-4 border-b border-slate-700/40">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">상품 설명</p>
                  <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-line">{product.content}</p>
                </section>
              )}

              {/* 메타 */}
              <section className="px-5 py-4">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">등록 정보</p>
                <div>
                  <InfoBadge icon={Calendar}  label="등록일" value={formatDate(product.createdAt)} />
                  <InfoBadge icon={RefreshCw} label="수정일" value={formatDate(product.updatedAt)} />
                </div>
              </section>

            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.22s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </div>
  )
}

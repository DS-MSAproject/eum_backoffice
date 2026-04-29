import { useEffect } from 'react'
import { X, Pencil } from 'lucide-react'
import { useGetAdminProductDetailQuery, useUpdateAdminProductMutation } from '@/api/productApi'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { addToast } from '@/features/ui/uiSlice'
import ProductForm from './ProductForm'
import Spinner from '@/shared/components/Spinner'

export default function ProductEditModal({ productId, onClose }) {
  const dispatch = useAppDispatch()
  const { data: product, isLoading } = useGetAdminProductDetailQuery(productId, { skip: !productId })
  const [updateProduct, { isLoading: updating }] = useUpdateAdminProductMutation()

  // ESC 닫기
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = async (formData) => {
    try {
      await updateProduct({ productId, ...formData }).unwrap()
      dispatch(addToast({ type: 'success', message: '상품이 수정되었습니다.' }))
      onClose()
    } catch {
      dispatch(addToast({ type: 'error', message: '수정에 실패했습니다.' }))
    }
  }

  if (!productId) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 sticky top-0 bg-[#0f172a] rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3ea76e]/20 flex items-center justify-center">
              <Pencil size={15} className="text-[#3ea76e]" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white">상품 수정</p>
              {product && (
                <p className="text-[11px] text-slate-400">ID: {product.productId} · {product.productName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner size={32} /></div>
          ) : product ? (
            <ProductForm
              initialValues={{
                categoryId:    product.categoryId,
                productName:   product.productName,
                content:       product.content ?? '',
                price:         String(product.price),
                brandName:     product.brandName ?? '',
                tags:          product.tags ?? '',
                keywords:      product.keywords ?? '',
                allergens:     product.allergens ?? '',
                ingredients:   product.ingredients ?? '',
                deliveryFee:   String(product.deliveryFee ?? 0),
                deliveryMethod: product.deliveryMethod ?? '일반택배',
                initialStock:  '0',
                options: (product.options ?? []).map((o) => ({
                  optionName: o.optionName ?? '',
                  extraPrice: String(o.extraPrice ?? 0),
                })),
                images: (product.images ?? []).map((img) => ({
                  imageUrl: img.imageUrl,
                  imageKey: img.imageKey,
                  isMain:   img.isMain,
                })),
                detailImages: (product.detailImages ?? []).map((di) => ({
                  imageUrl: di.imageUrl,
                  imageKey: di.imageKey,
                })),
              }}
              onSubmit={handleSubmit}
              isLoading={updating}
              submitLabel="수정 저장"
              isEdit
            />
          ) : (
            <p className="text-slate-400 text-center py-20">상품 정보를 불러올 수 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}

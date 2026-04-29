import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useGetCategoriesQuery } from '@/api/productApi'

const DEFAULT_FORM = {
  categoryId: '',
  productName: '',
  content: '',
  price: '',
  brandName: '',
  imageUrl: '',
  tags: '',
  keywords: '',
  allergens: '',
  ingredients: '',
  deliveryFee: '0',
  deliveryMethod: '일반택배',
  initialStock: '0',
  options: [],
}

export default function ProductForm({ initialValues, onSubmit, isLoading, submitLabel = '등록' }) {
  const [form, setForm] = useState({ ...DEFAULT_FORM, ...initialValues })
  const { data: categories } = useGetCategoriesQuery()

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const addOption = () =>
    setForm((prev) => ({ ...prev, options: [...prev.options, { optionName: '', extraPrice: '0' }] }))

  const updateOption = (i, field, value) =>
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((o, idx) => (idx === i ? { ...o, [field]: value } : o)),
    }))

  const removeOption = (i) =>
    setForm((prev) => ({ ...prev, options: prev.options.filter((_, idx) => idx !== i) }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...form,
      categoryId:   Number(form.categoryId),
      price:        Number(form.price),
      deliveryFee:  Number(form.deliveryFee),
      initialStock: Number(form.initialStock),
      options: form.options.map((o) => ({
        optionName: o.optionName,
        extraPrice: Number(o.extraPrice || 0),
      })),
    })
  }

  const field = (label, key, type = 'text', required = false) => (
    <div>
      <label className="block text-[12px] text-slate-400 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        required={required}
        className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#3ea76e]"
      />
    </div>
  )

  const textarea = (label, key, required = false) => (
    <div>
      <label className="block text-[12px] text-slate-400 mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <textarea
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        required={required}
        rows={3}
        className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#3ea76e] resize-none"
      />
    </div>
  )

  const categoryList = Array.isArray(categories)
    ? categories
    : (categories?.categories ?? categories?.content ?? [])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 기본 정보 */}
      <section className="bg-[#1e293b] rounded-xl p-4 space-y-3">
        <h3 className="text-[13px] font-bold text-slate-300 border-b border-slate-700/50 pb-2">기본 정보</h3>
        <div>
          <label className="block text-[12px] text-slate-400 mb-1">카테고리<span className="text-red-400 ml-0.5">*</span></label>
          <select
            value={form.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            required
            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#3ea76e]"
          >
            <option value="">선택하세요</option>
            {categoryList.map((c) => (
              <option key={c.id ?? c.categoryId} value={c.id ?? c.categoryId}>
                {c.categoryName}
              </option>
            ))}
          </select>
        </div>
        {field('상품명', 'productName', 'text', true)}
        {textarea('상품 설명', 'content', true)}
        <div className="grid grid-cols-2 gap-3">
          {field('기본 가격 (원)', 'price', 'number', true)}
          {field('브랜드명', 'brandName')}
        </div>
        {field('대표 이미지 URL', 'imageUrl')}
        <div className="grid grid-cols-2 gap-3">
          {field('태그 (쉼표 구분)', 'tags')}
          {field('검색 키워드', 'keywords')}
        </div>
      </section>

      {/* 배송 */}
      <section className="bg-[#1e293b] rounded-xl p-4 space-y-3">
        <h3 className="text-[13px] font-bold text-slate-300 border-b border-slate-700/50 pb-2">배송</h3>
        <div className="grid grid-cols-2 gap-3">
          {field('배송비 (원)', 'deliveryFee', 'number')}
          {field('배송 방법', 'deliveryMethod')}
        </div>
      </section>

      {/* 애견 식품 정보 */}
      <section className="bg-[#1e293b] rounded-xl p-4 space-y-3">
        <h3 className="text-[13px] font-bold text-slate-300 border-b border-slate-700/50 pb-2">
          반려견 식품 정보
          <span className="ml-2 text-[11px] text-yellow-500 font-normal">식품류는 알러지 정보 필수</span>
        </h3>
        {field('알러지 성분 (쉼표 구분)', 'allergens')}
        {textarea('전체 성분 목록', 'ingredients')}
      </section>

      {/* 초기 재고 */}
      <section className="bg-[#1e293b] rounded-xl p-4 space-y-3">
        <h3 className="text-[13px] font-bold text-slate-300 border-b border-slate-700/50 pb-2">초기 재고</h3>
        {field('초기 재고 수량 (옵션별)', 'initialStock', 'number')}
        <p className="text-[11px] text-slate-500">등록 시 각 옵션별로 설정된 수량으로 재고 서비스에 자동 생성됩니다.</p>
      </section>

      {/* 옵션 */}
      <section className="bg-[#1e293b] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
          <h3 className="text-[13px] font-bold text-slate-300">옵션 관리</h3>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-[#3ea76e] border border-[#3ea76e]/40 rounded hover:bg-[#3ea76e]/10 transition"
          >
            <Plus size={12} /> 옵션 추가
          </button>
        </div>
        {form.options.length === 0 && (
          <p className="text-[12px] text-slate-500">옵션 없음 — 단일 상품으로 등록됩니다.</p>
        )}
        {form.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`옵션명 ${i + 1}`}
              value={opt.optionName}
              onChange={(e) => updateOption(i, 'optionName', e.target.value)}
              className="flex-1 bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#3ea76e]"
            />
            <input
              type="number"
              placeholder="추가금액"
              value={opt.extraPrice}
              onChange={(e) => updateOption(i, 'extraPrice', e.target.value)}
              className="w-28 bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#3ea76e]"
            />
            <button
              type="button"
              onClick={() => removeOption(i)}
              className="p-1.5 text-slate-500 hover:text-red-400 transition"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </section>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 bg-[#3ea76e] text-white font-bold text-[14px] rounded-xl hover:bg-[#35916a] disabled:opacity-50 transition"
      >
        {isLoading ? '처리 중...' : submitLabel}
      </button>
    </form>
  )
}

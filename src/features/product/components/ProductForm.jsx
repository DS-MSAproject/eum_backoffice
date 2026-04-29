import { useState, useRef } from 'react'
import { Plus, X, Upload, ImageIcon, CheckCircle2, Loader2, Star } from 'lucide-react'
import { useGetCategoriesQuery, useUploadProductImageMutation } from '@/api/productApi'

const DEFAULT_FORM = {
  categoryId: '',
  productName: '',
  content: '',
  price: '',
  brandName: '',
  tags: '',
  keywords: '',
  allergens: '',
  ingredients: '',
  deliveryFee: '0',
  deliveryMethod: '일반택배',
  initialStock: '0',
  options: [],
  images: [],       // [{ imageUrl, imageKey, isMain, _uploading }]
  detailImages: [], // [{ imageUrl, imageKey, _uploading }]
}

export default function ProductForm({ initialValues, onSubmit, isLoading, submitLabel = '등록', isEdit = false }) {
  const [form, setForm] = useState(() => {
    const base = { ...DEFAULT_FORM, ...initialValues }
    // normalise images from server response format
    if (initialValues?.images && !base.images?.length) {
      base.images = (initialValues.images || []).map((img) => ({
        imageUrl: img.imageUrl,
        imageKey: img.imageKey,
        isMain: img.isMain,
      }))
    }
    if (initialValues?.detailImages && !base.detailImages?.length) {
      base.detailImages = (initialValues.detailImages || []).map((di) => ({
        imageUrl: di.imageUrl,
        imageKey: di.imageKey,
      }))
    }
    return base
  })

  const { data: categories } = useGetCategoriesQuery()
  const [uploadImage] = useUploadProductImageMutation()

  const productImageInputRef = useRef(null)
  const detailImageInputRef  = useRef(null)

  // ── helpers ──────────────────────────────────────────
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

  // ── product image upload ──────────────────────────────
  const uploadProductImage = async (file) => {
    const placeholder = { imageUrl: '', imageKey: '', isMain: false, _uploading: true }
    setForm((prev) => ({ ...prev, images: [...prev.images, placeholder] }))
    try {
      const result = await uploadImage(file).unwrap()
      setForm((prev) => {
        const imgs = [...prev.images]
        const idx = imgs.findLastIndex((im) => im._uploading)
        if (idx !== -1) {
          const isFirst = prev.images.filter((im) => !im._uploading).length === 0
          imgs[idx] = { imageUrl: result.imageUrl, imageKey: result.imageKey, isMain: isFirst }
        }
        return { ...prev, images: imgs }
      })
    } catch {
      setForm((prev) => ({ ...prev, images: prev.images.filter((im) => !im._uploading) }))
    }
  }

  const handleProductImageFiles = (files) => {
    Array.from(files).forEach((f) => uploadProductImage(f))
  }

  const setMainImage = (idx) =>
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((im, i) => ({ ...im, isMain: i === idx })),
    }))

  const removeProductImage = (idx) =>
    setForm((prev) => {
      const imgs = prev.images.filter((_, i) => i !== idx)
      if (imgs.length > 0 && !imgs.some((im) => im.isMain)) {
        imgs[0] = { ...imgs[0], isMain: true }
      }
      return { ...prev, images: imgs }
    })

  // ── detail image upload ───────────────────────────────
  const uploadDetailImage = async (file) => {
    const placeholder = { imageUrl: '', imageKey: '', _uploading: true }
    setForm((prev) => ({ ...prev, detailImages: [...prev.detailImages, placeholder] }))
    try {
      const result = await uploadImage(file).unwrap()
      setForm((prev) => {
        const imgs = [...prev.detailImages]
        const idx = imgs.findLastIndex((im) => im._uploading)
        if (idx !== -1) imgs[idx] = { imageUrl: result.imageUrl, imageKey: result.imageKey }
        return { ...prev, detailImages: imgs }
      })
    } catch {
      setForm((prev) => ({ ...prev, detailImages: prev.detailImages.filter((im) => !im._uploading) }))
    }
  }

  const handleDetailImageFiles = (files) => {
    Array.from(files).forEach((f) => uploadDetailImage(f))
  }

  const removeDetailImage = (idx) =>
    setForm((prev) => ({ ...prev, detailImages: prev.detailImages.filter((_, i) => i !== idx) }))

  // ── submit ────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    const readyImages      = form.images.filter((im) => !im._uploading && im.imageUrl)
    const readyDetailImages = form.detailImages.filter((di) => !di._uploading && di.imageUrl)

    onSubmit({
      categoryId:   Number(form.categoryId),
      productName:  form.productName,
      content:      form.content,
      price:        Number(form.price),
      brandName:    form.brandName,
      tags:         form.tags,
      keywords:     form.keywords,
      allergens:    form.allergens,
      ingredients:  form.ingredients,
      deliveryFee:  Number(form.deliveryFee),
      deliveryMethod: form.deliveryMethod,
      initialStock: Number(form.initialStock),
      options: form.options.map((o) => ({
        optionName: o.optionName,
        extraPrice: Number(o.extraPrice || 0),
      })),
      images: readyImages.map(({ imageUrl, imageKey, isMain }) => ({ imageUrl, imageKey, isMain })),
      detailImages: readyDetailImages.map(({ imageUrl, imageKey }, i) => ({
        imageUrl, imageKey, displayOrder: i + 1,
      })),
    })
  }

  // ── field renderers ───────────────────────────────────
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

  const anyUploading = form.images.some((im) => im._uploading) || form.detailImages.some((di) => di._uploading)

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
        <div className="grid grid-cols-2 gap-3">
          {field('태그 (쉼표 구분)', 'tags')}
          {field('검색 키워드', 'keywords')}
        </div>
      </section>

      {/* 상품 이미지 */}
      <section className="bg-[#1e293b] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
          <div>
            <h3 className="text-[13px] font-bold text-slate-300">상품 이미지</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">별 아이콘을 클릭해 대표 이미지를 지정하세요</p>
          </div>
          <button
            type="button"
            onClick={() => productImageInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-[#3ea76e] border border-[#3ea76e]/40 rounded-lg hover:bg-[#3ea76e]/10 transition"
          >
            <Plus size={12} /> 이미지 추가
          </button>
        </div>

        <input
          ref={productImageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleProductImageFiles(e.target.files)}
        />

        {form.images.length === 0 ? (
          <div
            onClick={() => productImageInputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-slate-600 bg-[#0f172a] hover:border-slate-400 transition cursor-pointer flex flex-col items-center justify-center gap-2 py-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <ImageIcon size={22} className="text-slate-500" />
            </div>
            <p className="text-[12px] text-slate-400">클릭하여 이미지를 추가하세요</p>
            <p className="text-[11px] text-slate-600">JPG · PNG · GIF · WEBP — 최대 10MB · 복수 선택 가능</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {form.images.map((img, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-[#0f172a]" style={{ aspectRatio: '1/1' }}>
                {img._uploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0f172a]">
                    <Loader2 size={24} className="text-[#3ea76e] animate-spin" />
                  </div>
                ) : (
                  <>
                    <img src={img.imageUrl} alt={`상품 이미지 ${i + 1}`} className="w-full h-full object-cover" />
                    {/* 대표 이미지 뱃지 */}
                    {img.isMain && (
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-amber-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        <Star size={9} fill="currentColor" /> 대표
                      </div>
                    )}
                    {/* 호버 오버레이 */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      {!img.isMain && (
                        <button
                          type="button"
                          onClick={() => setMainImage(i)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/80 hover:bg-amber-500 rounded-lg text-[11px] text-white font-medium transition"
                        >
                          <Star size={11} /> 대표 지정
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeProductImage(i)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/70 hover:bg-red-500/90 rounded-lg text-[11px] text-red-100 font-medium transition"
                      >
                        <X size={11} /> 제거
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {/* 추가 카드 */}
            <div
              onClick={() => productImageInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-slate-600 bg-[#0f172a] hover:border-slate-400 transition cursor-pointer flex flex-col items-center justify-center gap-1"
              style={{ aspectRatio: '1/1' }}
            >
              <Plus size={20} className="text-slate-500" />
              <span className="text-[11px] text-slate-500">추가</span>
            </div>
          </div>
        )}
      </section>

      {/* 상세 이미지 */}
      <section className="bg-[#1e293b] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
          <div>
            <h3 className="text-[13px] font-bold text-slate-300">상세 이미지</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">상품 상세 페이지에 순서대로 표시됩니다</p>
          </div>
          <button
            type="button"
            onClick={() => detailImageInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] text-[#3ea76e] border border-[#3ea76e]/40 rounded-lg hover:bg-[#3ea76e]/10 transition"
          >
            <Plus size={12} /> 이미지 추가
          </button>
        </div>

        <input
          ref={detailImageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleDetailImageFiles(e.target.files)}
        />

        {form.detailImages.length === 0 ? (
          <div
            onClick={() => detailImageInputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-slate-600 bg-[#0f172a] hover:border-slate-400 transition cursor-pointer flex flex-col items-center justify-center gap-2 py-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <ImageIcon size={22} className="text-slate-500" />
            </div>
            <p className="text-[12px] text-slate-400">클릭하여 상세 이미지를 추가하세요</p>
            <p className="text-[11px] text-slate-600">JPG · PNG · GIF · WEBP — 최대 10MB · 복수 선택 가능</p>
          </div>
        ) : (
          <div className="space-y-2">
            {form.detailImages.map((di, i) => (
              <div key={i} className="group relative rounded-xl overflow-hidden border border-slate-700 bg-[#0f172a]">
                {di._uploading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 size={24} className="text-[#3ea76e] animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-slate-900/80 flex items-center justify-center text-[11px] font-bold text-slate-300 border border-slate-600">
                      {i + 1}
                    </div>
                    <img src={di.imageUrl} alt={`상세 이미지 ${i + 1}`} className="w-full object-contain max-h-64" />
                    <button
                      type="button"
                      onClick={() => removeDetailImage(i)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-lg text-slate-300 hover:text-white transition opacity-0 group-hover:opacity-100"
                    >
                      <X size={13} />
                    </button>
                  </>
                )}
              </div>
            ))}
            {/* 추가 버튼 */}
            <div
              onClick={() => detailImageInputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-slate-600 bg-[#0f172a] hover:border-slate-400 transition cursor-pointer flex items-center justify-center gap-2 py-4"
            >
              <Plus size={16} className="text-slate-500" />
              <span className="text-[12px] text-slate-500">이미지 추가</span>
            </div>
          </div>
        )}
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

      {/* 초기 재고 — 신규 등록 시에만 표시 */}
      {!isEdit && (
        <section className="bg-[#1e293b] rounded-xl p-4 space-y-3">
          <h3 className="text-[13px] font-bold text-slate-300 border-b border-slate-700/50 pb-2">초기 재고</h3>
          {field('초기 재고 수량 (옵션별)', 'initialStock', 'number')}
          <p className="text-[11px] text-slate-500">등록 시 각 옵션별로 설정된 수량으로 재고 서비스에 자동 생성됩니다.</p>
        </section>
      )}

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
        disabled={isLoading || anyUploading}
        className="w-full py-2.5 bg-[#3ea76e] text-white font-bold text-[14px] rounded-xl hover:bg-[#35916a] disabled:opacity-50 transition"
      >
        {anyUploading ? '이미지 업로드 중...' : isLoading ? '처리 중...' : submitLabel}
      </button>
    </form>
  )
}

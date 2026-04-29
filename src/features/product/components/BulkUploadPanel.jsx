import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertTriangle, Download } from 'lucide-react'
import { useBulkUploadProductsMutation } from '@/api/productApi'

const CSV_TEMPLATE_HEADER =
  'productName,categoryId,price,brandName,content,tags,allergens,ingredients,deliveryFee,deliveryMethod,optionNames'

const CSV_EXAMPLE =
  `${CSV_TEMPLATE_HEADER}
어글어글 연어마들렌,1,3500,어글어글,동물복지 연어 간식,강아지간식;베이커리,연어;달걀,,0,일반택배,
어글어글 뼈간식 7종,1,3500,어글어글,다양한 맛의 수제 뼈간식,강아지간식;뼈간식,닭;돼지뼈,,0,일반택배,연어 마들렌;비지 에그 타르트;제주 치킨 스윗 치즈번
`

function downloadTemplate() {
  const blob = new Blob([CSV_EXAMPLE], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'product_bulk_upload_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export default function BulkUploadPanel() {
  const [bulkUpload, { isLoading }] = useBulkUploadProductsMutation()
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    const formData = new FormData()
    formData.append('csvFile', file)
    try {
      const res = await bulkUpload(formData).unwrap()
      setResult(res)
    } catch (err) {
      setResult({ totalRows: 0, successCount: 0, failCount: 1, errors: ['업로드 실패: ' + (err?.data?.message ?? '알 수 없는 오류')] })
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="space-y-5">
      {/* Template download */}
      <div className="bg-[#1e293b] rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-slate-200">CSV 템플릿 다운로드</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            템플릿 형식에 맞게 데이터를 입력한 뒤 업로드하세요.
            옵션명은 세미콜론(;)으로 구분합니다.
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-slate-200 text-[12px] font-semibold rounded-lg hover:bg-slate-600 transition"
        >
          <Download size={14} /> 템플릿 다운로드
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
          dragOver ? 'border-[#3ea76e] bg-[#3ea76e]/5' : 'border-slate-700 hover:border-slate-500'
        }`}
      >
        <Upload size={32} className="mx-auto mb-3 text-slate-500" />
        <p className="text-[14px] font-semibold text-slate-300">CSV 파일을 드래그하거나 클릭하여 업로드</p>
        <p className="text-[12px] text-slate-500 mt-1">.csv 파일만 지원합니다</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>

      {isLoading && (
        <div className="bg-[#1e293b] rounded-xl p-4 text-center">
          <p className="text-[13px] text-slate-400">업로드 처리 중...</p>
        </div>
      )}

      {/* Result */}
      {result && !isLoading && (
        <div className="bg-[#1e293b] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            {result.failCount === 0 ? (
              <CheckCircle size={20} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle size={20} className="text-yellow-400 shrink-0" />
            )}
            <div>
              <p className="text-[13px] font-semibold text-slate-200">업로드 완료</p>
              <p className="text-[12px] text-slate-400">
                전체 {result.totalRows}행 · 성공 {result.successCount}건 · 실패 {result.failCount}건
              </p>
            </div>
          </div>
          {result.errors?.length > 0 && (
            <div className="bg-red-950/30 border border-red-800/40 rounded-lg p-3 space-y-1">
              {result.errors.map((err, i) => (
                <p key={i} className="text-[11px] text-red-400 flex items-start gap-1.5">
                  <FileText size={12} className="mt-0.5 shrink-0" />
                  {err}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Format reference */}
      <div className="bg-[#1e293b] rounded-xl p-4">
        <p className="text-[12px] font-semibold text-slate-300 mb-2">CSV 컬럼 설명</p>
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-slate-500 border-b border-slate-700/50">
              <th className="text-left py-1 pr-3 font-medium">컬럼명</th>
              <th className="text-left py-1 font-medium">설명</th>
            </tr>
          </thead>
          <tbody className="text-slate-400 divide-y divide-slate-700/30">
            {[
              ['productName', '상품명 (필수)'],
              ['categoryId',  '카테고리 ID (필수, 숫자)'],
              ['price',       '기본 가격 (필수, 숫자)'],
              ['brandName',   '브랜드명'],
              ['content',     '상품 설명'],
              ['tags',        '태그 (세미콜론 구분)'],
              ['allergens',   '알러지 성분 (식품류 필수)'],
              ['ingredients', '전체 성분 목록'],
              ['deliveryFee', '배송비 (숫자)'],
              ['deliveryMethod', '배송 방법'],
              ['optionNames', '옵션명 (세미콜론 구분, 없으면 비워둠)'],
            ].map(([col, desc]) => (
              <tr key={col}>
                <td className="py-1 pr-3 font-mono text-[#3ea76e]">{col}</td>
                <td className="py-1">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

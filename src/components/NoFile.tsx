export default function NoFile() {
  return (
    <div className="flex flex-col items-center md:grid md:grid-cols-2 gap-8 h-full p-4 justify-center place-items-center w-full">
      <div>
        <div className="text-4xl text-slate-600">歡迎使用 TransPal 編輯器</div>
        <div className="text-2xl text-slate-400 mt-1">目前支援下列檔案類型</div>
        <div className="grid grid-cols-1 gap-3 sm:w-[400px] max-w-full mt-4">
          <div className="bg-slate-50 text-slate-600 p-3 rounded">
            <div className="font-bold">TransPal JSON 檔案</div>
            <p className="text-sm">
              使用本編輯器儲存的檔案，或是透過 TransPal 轉錄後產生的檔案
            </p>
          </div>
          <div className="bg-slate-50 text-slate-600 p-3 rounded">
            <div className="font-bold"> Vocol.ai 匯出的 SRT 檔案 </div>
            <p className="text-sm">
              透過 Vocol.ai 匯出，並帶有說話者標記的 SRT 檔案
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center flex-col">
        <div className="text-4xl text-gray-400">開啟檔案來編輯</div>
      </div>
    </div>
  );
}

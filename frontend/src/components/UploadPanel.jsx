import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'

export default function UploadPanel({ models, onSubmit, isLoading }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [modelId, setModelId] = useState(models[0]?.id ?? '')

  useEffect(() => {
    if (!modelId && models.length > 0) {
      setModelId(models[0].id)
    }
  }, [modelId, models])

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    disabled: isLoading,
  })

  const handleSubmit = () => {
    if (!file || !modelId) return
    onSubmit(file, modelId)
  }

  const handleClear = () => {
    setFile(null)
    setPreview(null)
  }

  return (
    <div className="card p-6 flex flex-col gap-5">
      {/* Drop zone */}
      <div>
        <label className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2 block">
          Upload Image
        </label>
        <div
          {...getRootProps()}
          className={`
            relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
            flex flex-col items-center justify-center text-center p-6 min-h-[180px]
            ${isDragActive
              ? 'border-brand bg-brand/10 glow-brand'
              : 'border-white/10 hover:border-brand/40 hover:bg-white/3'
            }
            ${isLoading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />

          {preview ? (
            <>
              <img
                src={preview}
                alt="preview"
                className="max-h-40 rounded-lg object-contain"
              />
              <p className="mt-2 text-xs text-gray-400 truncate max-w-full px-2">{file.name}</p>
            </>
          ) : (
            <>
              <div className="text-3xl mb-3 opacity-60">🩻</div>
              <p className="text-sm font-medium text-gray-300">
                {isDragActive ? 'Drop it here…' : 'Drag & drop or click to browse'}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, TIFF supported</p>
            </>
          )}
        </div>

        {file && (
          <button onClick={handleClear} className="btn-ghost mt-2 w-full text-center">
            Remove
          </button>
        )}
      </div>

      {/* Model selector */}
      <div>
        <label className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2 block">
          Detection Model
        </label>
        {models.length === 0 ? (
          <p className="text-sm text-red-400 bg-red-400/10 rounded-lg p-3">
            No models found. Check that .keras files are in the project root.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => setModelId(m.id)}
                className={`
                  w-full text-left rounded-xl p-3 border transition-all duration-150
                  ${modelId === m.id
                    ? 'border-brand/50 bg-brand/10 text-brand'
                    : 'border-white/8 hover:border-white/20 text-gray-300'
                  }
                `}
              >
                <p className="font-medium text-sm">{m.name}</p>
                <p className="text-xs opacity-60 mt-0.5">{m.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!file || !modelId || isLoading || models.length === 0}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-surface-900/40 border-t-surface-900 rounded-full animate-spin-slow" />
            Analysing…
          </>
        ) : (
          <>
            <span>⚡</span> Analyse Image
          </>
        )}
      </button>
    </div>
  )
}

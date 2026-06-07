import { useEffect, useState } from 'react'
import axios from 'axios'
import Header from './components/Header'
import UploadPanel from './components/UploadPanel'
import ResultsPanel from './components/ResultsPanel'

const API = '/api'

export default function App() {
  const [models, setModels] = useState([])
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    axios.get(`${API}/models`)
      .then(r => setModels(r.data.models))
      .catch(() => setModels([]))
  }, [])

  const handleSubmit = async (file, modelId) => {
    setIsLoading(true)
    setResult(null)
    setError(null)

    const form = new FormData()
    form.append('file', file)
    form.append('model_id', modelId)

    try {
      const r = await axios.post(`${API}/predict`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(r.data)
    } catch (err) {
      const msg = err.response?.data?.detail ?? err.message ?? 'Inference failed.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid-bg flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="text-gradient">Medical Image</span>{' '}
            <span className="text-white">Segmentation</span>
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            Upload a medical scan. NIDAN AI will detect and segment regions of interest
            using deep learning models trained on clinical datasets.
          </p>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
          <UploadPanel
            models={models}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
          <ResultsPanel result={result} error={error} />
        </div>

        {/* Info strip */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🧠', title: 'Brain Tumor', body: 'U-Net segmentation of tumor regions from MRI scans using Dice + BCE loss.' },
            { icon: '👁', title: 'Retinal Vessels', body: 'Vascular structure segmentation from fundus photographs.' },
            { icon: '📊', title: 'Rich Metrics', body: 'Coverage, confidence, region count — computed automatically per inference.' },
          ].map((c) => (
            <div key={c.title} className="card p-5">
              <div className="text-2xl mb-2">{c.icon}</div>
              <h3 className="font-semibold text-sm text-gray-200 mb-1">{c.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/5 text-center py-6 text-xs text-gray-600">
        NIDAN AI · Medical Image Segmentation · For research use only
      </footer>
    </div>
  )
}

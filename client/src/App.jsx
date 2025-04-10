import { useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [original, setOriginal] = useState("")
  const [short, setShort] = useState(null)

  const handleSubmit = () => {
    axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/shorten`, { originalURL: original })
      .then((res) => {
        console.log("API response", res)
        setShort(res.data.newURL.shortURL)
      })
      .catch((error) => {
        console.log("Failed to generate!!!", error)
      })

    console.log(original)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-4 p-4">
      <input
        type="text"
        name="originalURL"
        placeholder="Enter original URL"
        value={original}
        onChange={(e) => setOriginal(e.target.value)}
        required
        className="px-4 py-2 border border-gray-400 rounded-md w-full max-w-md"
      />
      <button
        className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
        onClick={handleSubmit}
      >
        Generate Short URL
      </button>

      {short && (
        <p className="text-lg font-medium text-green-600">
          Short URL: 
          <a
            href={`${import.meta.env.VITE_BACKEND_URL}/${short}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-500 underline"
          >
            {`${import.meta.env.VITE_BACKEND_URL}/${short}`}
          </a>
        </p>
      )}
    </div>
  )
}

export default App

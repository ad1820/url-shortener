import { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

interface Props {
  onUrlCreated: () => void;
}

export default function UrlShortener({ onUrlCreated }: Props) {
  const [originalURL, setOriginalURL] = useState("");
  const [shortened, setShortened] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalURL.trim()) return;

    try {
      const res = await axios.post(`${API_BASE}/api/shorten`, { originalURL });
      setShortened(res.data.newURL.shortURL);
      onUrlCreated();
      setOriginalURL("");
    } catch (err) {
      console.error("Error shortening URL:", err);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Enter your URL..."
          value={originalURL}
          onChange={(e) => setOriginalURL(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition"
        >
          Shorten
        </button>
      </form>

      {shortened && (
        <p className="mt-4 text-center">
          Short URL:{" "}
          <a
            href={`${API_BASE}/${shortened}`}
            className="text-blue-600 underline"
            target="_blank"
          >
            {`${API_BASE}/${shortened}`}
          </a>
        </p>
      )}
    </div>
  );
}

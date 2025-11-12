import { useState, useEffect } from "react";
import UrlShortener from "./components/UrlShortener.tsx";
import UrlList from "./components/UrlList.tsx";
import axios from "axios";

export interface Url {
  originalURL: string;
  shortURL: string;
  clicks: number;
  createdAt: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
});



function App() {
  const [urls, setUrls] = useState<Url[]>([]);

  const fetchUrls = async () => {
    try {
      const res = await api.get("/api/urls");
      setUrls(res.data.urls);
    } catch (err) {
      console.error("Error fetching URLs:", err);
    }
  };
  useEffect(() => {
    console.log("API base:", import.meta.env.VITE_API_BASE);
  }, []);
  useEffect(() => {
    fetchUrls();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">URL Shortener</h1>
      <UrlShortener onUrlCreated={fetchUrls} />
      <UrlList urls={urls} />
    </div>
  );
}

export default App;

import type { Url } from "../App";

interface Props {
  urls: Url[];
}

export default function UrlList({ urls }: Props) {
  if (!urls.length)
    return <p className="text-gray-500">No URLs yet. Create one above.</p>;

  return (
    <div className="w-full max-w-2xl mt-4">
      <table className="w-full bg-white shadow-sm rounded-xl overflow-hidden">
        <thead className="bg-blue-50">
          <tr>
            <th className="p-2 text-left">Short URL</th>
            <th className="p-2 text-left">Original URL</th>
            <th className="p-2 text-center">Clicks</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((u) => (
            <tr key={u.shortURL} className="border-t hover:bg-gray-50">
              <td className="p-2 text-blue-600 underline">
                <a href={`http://localhost:8000/${u.shortURL}`} target="_blank">
                  {u.shortURL}
                </a>
              </td>
              <td className="p-2 truncate max-w-[250px]">{u.originalURL}</td>
              <td className="p-2 text-center">{u.clicks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

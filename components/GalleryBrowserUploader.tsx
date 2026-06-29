"use client";

import { useRef, useState } from "react";

type UploadResult = {
  filename: string;
  ok: boolean;
  imageId?: string;
  error?: string;
};

type UploadResponse = {
  ok: boolean;
  uploaded: number;
  failed: number;
  results: UploadResult[];
  error?: string;
};

export function GalleryBrowserUploader({ galleryId }: { galleryId: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<UploadResult[]>([]);

  function upload() {
    const files = Array.from(inputRef.current?.files || []);
    setResults([]);
    setMessage("");
    setProgress(0);

    if (!files.length) {
      setMessage("Choose one or more JPEG images first.");
      return;
    }

    const formData = new FormData();
    for (const file of files) formData.append("files", file);

    const request = new XMLHttpRequest();
    request.open("POST", `/api/admin/galleries/${galleryId}/images/upload`);
    request.responseType = "json";
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      const response = request.response as UploadResponse | null;
      setBusy(false);
      setProgress(100);
      setResults(response?.results || []);
      if (request.status >= 200 && request.status < 300 && response?.ok) {
        setMessage(`Uploaded ${response.uploaded} image${response.uploaded === 1 ? "" : "s"}. Refreshing image list...`);
        window.setTimeout(() => window.location.reload(), 900);
        return;
      }
      setMessage(response?.error || `Upload failed with status ${request.status}.`);
    };
    request.onerror = () => {
      setBusy(false);
      setMessage("Upload failed before the server could respond.");
    };
    request.onloadend = () => setBusy(false);
    setBusy(true);
    request.send(formData);
  }

  return (
    <section className="rounded-sm border border-[var(--border)] bg-[var(--card)] p-5">
      <h2 className="text-2xl font-black">Browser upload</h2>
      <p className="muted-copy mt-2 text-sm">Upload multiple JPEGs directly to private R2 storage. Originals, previews, thumbnails, and database rows are created server-side.</p>
      <input ref={inputRef} type="file" accept="image/jpeg,.jpg,.jpeg" multiple className="mt-4 w-full rounded-sm border border-[var(--border)] px-3 py-3 text-sm" />
      <div className="mt-4 h-3 overflow-hidden rounded-sm bg-[var(--background)]">
        <div className="h-full bg-[var(--gold)] transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={upload} disabled={busy} className="gold-button rounded-sm px-4 py-3 text-sm font-black disabled:opacity-50">
          {busy ? "Uploading..." : "Upload JPEGs"}
        </button>
        {message ? <p className="text-sm font-semibold text-[var(--muted)]">{message}</p> : null}
      </div>
      {results.length ? (
        <div className="mt-4 rounded-sm border border-[var(--border)] p-4">
          <p className="text-sm font-bold text-[var(--foreground)]">Results</p>
          <ul className="mt-2 grid gap-2 text-sm">
            {results.map((result) => (
              <li key={result.filename} className={result.ok ? "text-[var(--muted)]" : "text-red-300"}>
                {result.ok ? "Uploaded" : "Failed"}: {result.filename}{result.error ? ` - ${result.error}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

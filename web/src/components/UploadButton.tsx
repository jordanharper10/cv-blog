import { useRef, useState } from 'react';
import { uploadFile } from '../api';

export default function UploadButton({
  onUploaded,
  label = 'Upload file',
  accept = 'image/*',
  className = ''
}: {
  onUploaded: (url: string, file: File) => void;
  label?: string;
  accept?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function handleFiles(files: FileList | null) {
    if (!files || !files[0]) return;
    setBusy(true); setErr('');
    try {
      const f = files[0];
      const { url } = await uploadFile(f);
      onUploaded(url, f);
    } catch (e: any) {
      setErr('Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault(); e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={onDrop}
      className={`border rounded-xl px-3 py-2 inline-flex items-center gap-2 cursor-pointer hover:bg-gray-50 ${className}`}
      onClick={() => inputRef.current?.click()}
      title="Click or drop a file"
    >
      <span>{busy ? 'Uploading…' : label}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      {err && <span className="text-red-600 text-xs ml-2">{err}</span>}
    </div>
  );
}


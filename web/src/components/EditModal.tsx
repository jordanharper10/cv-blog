import { useEffect } from 'react';

export default function EditModal({
  open, title, children, onClose, onSave, saveLabel = 'Save'
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  saveLabel?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[min(720px,95vw)] max-h-[85vh] overflow-auto">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button className="text-sm underline" onClick={onClose}>Close</button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
        <div className="px-5 py-3 border-t flex gap-2 justify-end">
          <button className="px-3 py-2 rounded-xl border" onClick={onClose}>Cancel</button>
          <button className="px-3 py-2 rounded-xl border" onClick={onSave}>{saveLabel}</button>
        </div>
      </div>
    </div>
  );
}


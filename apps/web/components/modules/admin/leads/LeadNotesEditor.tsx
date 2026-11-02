"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

interface Props {
  initialNotes: string;
  onSave: (notes: string) => Promise<void>;
}

export const LeadNotesEditor: React.FC<Props> = ({ initialNotes, onSave }) => {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(notes);
    setSaving(false);
  };

  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Ghi chú điều phối (vd: Đã gửi email báo giá...)"
        className="flex-1 rounded border border-white/10 bg-white/4 px-2.5 py-1 text-xs text-white"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded border border-white/10 px-2 py-1 text-xs text-white/80 hover:border-(--accent-bronze) disabled:opacity-50"
      >
        <Check className="h-3 w-3" />
      </button>
    </div>
  );
};

export default LeadNotesEditor;

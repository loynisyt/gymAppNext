import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function MarkdownEditor({ value, onChange, label }) {
  const [isUsed, setIsUsed] = useState(false);

  useEffect(() => {
    if (value && value.trim() !== "") {
      setIsUsed(true);
    } else {
      setIsUsed(false);
    }
  }, [value]);

  return (
    <div className={`field ${isUsed ? "markdown-editor-highlight" : ""}`}>
      {label && <label className="label">{label}</label>}
      <MDEditor
        value={value}
        onChange={onChange}
        height={200}
        preview="edit"
      />
    </div>
  );
}

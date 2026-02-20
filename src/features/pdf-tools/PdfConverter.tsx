"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { FileUp, Download, Trash2, FilePlus } from "lucide-react";

export default function PdfConverter() {
  const [images, setImages] = useState<string[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (en) => {
        setImages((prev) => [...prev, en.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const generatePdf = () => {
    if (images.length === 0) return;
    
    const pdf = new jsPDF();
    images.forEach((img, index) => {
      // Logic: Add a new page for every image after the first one
      if (index > 0) pdf.addPage();
      
      const imgProps = pdf.getImageProperties(img);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(img, "JPEG", 0, 0, pdfWidth, pdfHeight);
    });
    
    pdf.save("compiled-document.pdf");
  };

  return (
    <div className="space-y-6">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 transition">
        <div className="flex flex-col items-center gap-2">
          <FilePlus className="text-zinc-400" />
          <span className="text-sm font-medium text-zinc-500">Upload Images (JPG/PNG)</span>
        </div>
        <input type="file" multiple className="hidden" accept="image/*" onChange={handleUpload} />
      </label>

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative group aspect-square">
                <img src={img} className="w-full h-full object-cover rounded-lg border" />
                <button 
                  onClick={() => removeImage(i)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={generatePdf}
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 text-white py-3 rounded-xl font-bold hover:opacity-90 transition"
          >
            <Download size={18} /> Download {images.length} Page PDF
          </button>
        </div>
      )}
    </div>
  );
}
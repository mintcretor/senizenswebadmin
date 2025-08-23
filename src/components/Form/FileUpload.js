import React, { useState, useRef } from 'react';
import { Upload, Image } from 'lucide-react';

const FileUpload = () => {
 const [file, setFile] = useState(null);
 const [previewUrl, setPreviewUrl] = useState('');
 const fileInputRef = useRef(null);

 const handleFileChange = (event) => {
 const selectedFile = event.target.files && event.target.files.length > 0 ? event.target.files : null;
 if (selectedFile) {
 setFile(selectedFile?.[0]);
 const reader = new FileReader();
 reader.onloadend = () => {
 setPreviewUrl(reader.result);
 };
 reader.readAsDataURL(selectedFile?.[0]);
 } else {
 setFile(null);
 setPreviewUrl('');
 }
 };

 const handleDivClick = () => {
 fileInputRef.current?.click();
 };

 const handleDragOver = (event) => {
 event.preventDefault();
 };

 const handleDrop = (event) => {
 event.preventDefault();
 const droppedFile = event.dataTransfer.files && event.dataTransfer.files.length > 0 ? event.dataTransfer.files : null;
 if (droppedFile) {
 setFile(droppedFile?.[0]);
 const reader = new FileReader();
 reader.onloadend = () => {
 setPreviewUrl(reader.result);
 };
 reader.readAsDataURL(droppedFile?.[0]);
 } else {
 setFile(null);
 setPreviewUrl('');
 }
 };

 return (
 <div
 className="relative w-48 h-48 p-4 border-2 border-dashed border-gray-400 rounded-xl flex flex-col items-center justify-center text-center text-sm text-gray-500 cursor-pointer hover:border-blue-500 transition duration-200"
 onClick={handleDivClick}
 onDragOver={handleDragOver}
 onDrop={handleDrop}
 >
 <input
 type="file"
 ref={fileInputRef}
 className="hidden"
 onChange={handleFileChange}
 accept="image/*"
 />
 {previewUrl ? (
 <div className="absolute inset-0 rounded-xl overflow-hidden">
 <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
 </div>
 ) : (
 <>
 <Upload size={32} className="text-gray-400 mb-2" />
 <p className="mb-1">คลิกเพื่ออัปโหลด</p>
 <p className="text-xs">หรือลากและวางที่นี่</p>
 </>
 )}
 </div>
 );
};

export default FileUpload;
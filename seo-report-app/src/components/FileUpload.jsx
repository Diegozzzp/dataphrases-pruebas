import React, { useRef } from 'react';

const FileUpload = ({ onFileUpload, label }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div>
      <label htmlFor="file-upload">{label}</label>
      <input
        id="file-upload"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'block', margin: '10px 0' }}
      />
    </div>
  );
};

export default FileUpload;
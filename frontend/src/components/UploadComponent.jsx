import { useState } from 'react';
import { uploadDocument } from '../services/documentApi.js';

export default function UploadComponent({ userId, onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [inputKey, setInputKey] = useState(0);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file) {
      setError('Selecione um arquivo para enviar.');
      return;
    }

    setIsUploading(true);
    setError('');
    try {
      const document = await uploadDocument(file, userId);
      setFile(null);
      // Recria o input para limpar o arquivo selecionado
      setInputKey((key) => key + 1);
      onUploaded?.(document);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        key={inputKey}
        type="file"
        onChange={(event) => setFile(event.target.files[0] ?? null)}
        disabled={isUploading}
      />
      <button type="submit" disabled={!file || isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar'}
      </button>
      {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
    </form>
  );
}

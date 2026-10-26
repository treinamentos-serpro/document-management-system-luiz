import { useCallback, useEffect, useState } from 'react';
import UploadComponent from '../components/UploadComponent.jsx';
import DocumentList from '../components/DocumentList.jsx';
import { listDocuments } from '../services/documentApi.js';

export default function DocumentsPage() {
  const [userId, setUserId] = useState('usuario-demo');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const trimmedUserId = userId.trim();

  const loadDocuments = useCallback(async () => {
    if (!trimmedUserId) {
      setDocuments([]);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      setDocuments(await listDocuments(trimmedUserId));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [trimmedUserId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <>
      <section>
        <label>
          Usuário:{' '}
          <input value={userId} onChange={(event) => setUserId(event.target.value)} />
        </label>
      </section>

      {trimmedUserId ? (
        <>
          <section>
            <h2>Enviar documento</h2>
            <UploadComponent userId={trimmedUserId} onUploaded={loadDocuments} />
          </section>

          <section>
            <h2>Meus documentos</h2>
            {error && <p role="alert" style={{ color: 'crimson' }}>{error}</p>}
            {isLoading ? <p>Carregando...</p> : <DocumentList documents={documents} userId={trimmedUserId} />}
          </section>
        </>
      ) : (
        <p>Informe um usuário para gerenciar seus documentos.</p>
      )}
    </>
  );
}

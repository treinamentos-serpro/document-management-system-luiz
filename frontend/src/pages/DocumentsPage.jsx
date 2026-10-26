import { useState } from 'react';
import UploadComponent from '../components/UploadComponent.jsx';
import DocumentList from '../components/DocumentList.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import useDocuments from '../hooks/useDocuments.js';

export default function DocumentsPage() {
  const [userId, setUserId] = useState('usuario-demo');
  const trimmedUserId = userId.trim();
  const { documents, isLoading, error, refresh } = useDocuments(trimmedUserId);

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
            <UploadComponent key={trimmedUserId} userId={trimmedUserId} onUploaded={refresh} />
          </section>

          <section>
            <h2>Meus documentos</h2>
            <ErrorMessage message={error} />
            {isLoading ? <p>Carregando...</p> : <DocumentList documents={documents} userId={trimmedUserId} />}
          </section>
        </>
      ) : (
        <p>Informe um usuário para gerenciar seus documentos.</p>
      )}
    </>
  );
}

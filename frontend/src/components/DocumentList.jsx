import DownloadButton from './DownloadButton.jsx';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ documents, userId }) {
  if (documents.length === 0) {
    return <p>Nenhum documento enviado.</p>;
  }

  return (
    <table cellPadding="6">
      <thead>
        <tr>
          <th align="left">Nome</th>
          <th align="right">Tamanho</th>
          <th align="left">Enviado em</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => (
          <tr key={doc.id}>
            <td>{doc.originalName}</td>
            <td align="right">{formatSize(doc.size)}</td>
            <td>{new Date(doc.uploadedAt).toLocaleString('pt-BR')}</td>
            <td>
              <DownloadButton document={doc} userId={userId} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { listDocuments } from '../services/documentApi.js';

export default function useDocuments(userId) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({
    userId: null, documents: [], error: '', isLoading: false,
  });
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const controller = new AbortController();
    setResult({ userId, documents: [], error: '', isLoading: true });

    async function loadDocuments() {
      try {
        const documents = await listDocuments(userId, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setResult({ userId, documents, error: '', isLoading: false });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({ userId, documents: [], error: error.message, isLoading: false });
        }
      }
    }

    loadDocuments();
    return () => controller.abort();
  }, [userId, revision]);

  if (!userId || result.userId !== userId) {
    return { documents: [], error: '', isLoading: Boolean(userId), refresh };
  }

  return { ...result, refresh };
}

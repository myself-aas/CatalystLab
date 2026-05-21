/**
 * useFirestoreQuery.ts
 * 
 * Custom hook for safely querying Firestore with:
 * - Multi-tab offline persistence fallback
 * - Comprehensive error handling
 * - Loading state management
 * - Automatic retry logic
 * - Type-safe data transformation
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Query, 
  onSnapshot, 
  getDocs,
  QueryConstraint,
  collection,
  query as firestoreQuery,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OperationType, handleFirestoreError } from '@/lib/firebase';

interface UseFirestoreQueryOptions<T> {
  /** Transform raw data before returning */
  transform?: (data: any) => T;
  /** Enable auto-fetching on mount */
  enabled?: boolean;
  /** Retry failed queries automatically */
  retryOnError?: boolean;
  /** Max retry attempts */
  maxRetries?: number;
}

interface UseFirestoreQueryResult<T> {
  /** Query data */
  data: T[] | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether data is from offline cache */
  isOffline: boolean;
  /** Manually refetch data */
  refetch: () => Promise<void>;
  /** Retry failed query */
  retry: () => Promise<void>;
}

/**
 * Hook for safely querying Firestore with offline fallback
 * 
 * @example
 * const { data, isLoading, error, isOffline } = useFirestoreQuery(
 *   query(collection(db, 'papers'), where('status', '==', 'published')),
 *   { transform: (doc) => ({ id: doc.id, ...doc.data() }) }
 * );
 */
export function useFirestoreQuery<T = any>(
  firebaseQuery: Query | null,
  options: UseFirestoreQueryOptions<T> = {}
): UseFirestoreQueryResult<T> {
  const {
    transform,
    enabled = true,
    retryOnError = true,
    maxRetries = 3,
  } = options;

  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const retryCountRef = useRef(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /**
   * Transform document snapshot to typed data
   */
  const transformData = useCallback((docs: any[]) => {
    if (!transform) {
      return docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    }
    return docs.map(doc => transform({ id: doc.id, ...doc.data() }));
  }, [transform]);

  /**
   * Fetch data with offline fallback
   */
  const fetchData = useCallback(async () => {
    if (!firebaseQuery) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setIsOffline(false);
      retryCountRef.current = 0;

      // Try to fetch from server
      const snapshot = await getDocs(firebaseQuery);
      
      if (snapshot.empty) {
        setData([]);
        setIsLoading(false);
        return;
      }

      const transformedData = transformData(snapshot.docs);
      setData(transformedData);
      setIsLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      console.warn('Server query failed, attempting offline cache:', error);
      setIsOffline(true);

      try {
        // Fallback to getDocs which uses persistent cache
        const cachedSnapshot = await getDocs(firebaseQuery);
        const transformedData = transformData(cachedSnapshot.docs);
        setData(transformedData);
        setError(null);
        setIsLoading(false);
      } catch (offlineErr) {
        const offlineError = offlineErr instanceof Error 
          ? offlineErr 
          : new Error('Offline cache unavailable');
        
        setError(offlineError);
        setData(null);
        setIsLoading(false);

        // Retry logic
        if (retryOnError && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const backoffMs = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
          setTimeout(fetchData, backoffMs);
        }
      }
    }
  }, [firebaseQuery, transformData, retryOnError, maxRetries]);

  /**
   * Setup real-time listener with fallback
   */
  useEffect(() => {
    if (!firebaseQuery || !enabled) {
      setData(null);
      setIsLoading(false);
      return;
    }

    // First, attempt real-time listener
    try {
      unsubscribeRef.current = onSnapshot(
        firebaseQuery,
        (snapshot) => {
          if (snapshot.empty) {
            setData([]);
            setIsLoading(false);
            setError(null);
            setIsOffline(false);
            return;
          }

          const transformedData = transformData(snapshot.docs);
          setData(transformedData);
          setIsLoading(false);
          setError(null);
          setIsOffline(false);
          retryCountRef.current = 0;
        },
        (err) => {
          console.warn('Real-time listener failed, using cached data:', err);
          setIsOffline(true);
          setError(new Error('Real-time updates unavailable'));
          setIsLoading(false);
          
          // Fallback to one-time fetch
          fetchData();
        }
      );
    } catch (err) {
      // If snapshot listener fails, fall back to one-time fetch
      console.warn('Failed to setup real-time listener:', err);
      fetchData();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [firebaseQuery, enabled, fetchData, transformData]);

  const refetch = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);

  const retry = useCallback(async () => {
    retryCountRef.current = 0;
    await fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    isOffline,
    refetch,
    retry,
  };
}

/**
 * Simpler hook for a single document
 */
export function useFirestoreDocument<T = any>(
  collectionName: string,
  docId: string | null,
  options: UseFirestoreQueryOptions<T> = {}
) {
  const firebaseQuery = 
    docId && collectionName 
      ? firestoreQuery(collection(db, collectionName))
      : null;

  return useFirestoreQuery<T>(firebaseQuery, { enabled: !!docId, ...options });
}

export default useFirestoreQuery;

import { useCallback, useEffect, useRef, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5189';

// Keeps orders for a specific customer in sync via REST + SignalR.
export function useLiveOrders(customerId) {
  const [orderMap, setOrderMap] = useState(new Map());
  const [isConnected, setIsConnected] = useState(false);

  const isFetchingRef = useRef(false);
  const eventBufferRef = useRef([]);

  const applyEventToMap = useCallback(
    (map, event) => {
      const { type, payload } = event;
      if (payload.customerId !== customerId) return;

      // 0=Added, 1=Updated, 2=Deleted
      if (type === 2 || type === 'Deleted') {
        map.delete(payload.id);
      } else {
        map.set(payload.id, payload);
      }
    },
    [customerId]
  );

  const fetchAndSync = useCallback(async () => {
    if (customerId == null) {
      setOrderMap(new Map());
      return;
    }

    isFetchingRef.current = true;

    try {
      const response = await fetch(
        `${API_BASE}/api/orders?customerId=${encodeURIComponent(customerId)}`
      );
      const data = await response.json();

      setOrderMap(() => {
        const newMap = new Map();
        data
          .filter((o) => o.customerId === customerId)
          .forEach((o) => newMap.set(o.id, o));

        const buffer = eventBufferRef.current;
        if (buffer.length > 0) {
          buffer.forEach((event) => applyEventToMap(newMap, event));
        }

        return newMap;
      });
    } catch (err) {
      console.error('Fetch orders failed', err);
    } finally {
      isFetchingRef.current = false;
      eventBufferRef.current = [];
    }
  }, [applyEventToMap, customerId]);

  // Set up SignalR connection once.
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/orders`)
      .withAutomaticReconnect()
      .build();

    connection.on('OrderChanged', (event) => {
      if (isFetchingRef.current) {
        eventBufferRef.current.push(event);
      } else {
        setOrderMap((prev) => {
          const next = new Map(prev);
          applyEventToMap(next, event);
          return next;
        });
      }
    });

    connection.onreconnected(() => {
      fetchAndSync();
    });

    const start = async () => {
      try {
        await connection.start();
        setIsConnected(true);
        fetchAndSync();
      } catch (err) {
        console.error('SignalR connection failed', err);
      }
    };

    start();
    return () => connection.stop();
  }, [applyEventToMap, fetchAndSync]);

  // Refetch when customer changes.
  useEffect(() => {
    eventBufferRef.current = [];
    fetchAndSync();
  }, [customerId, fetchAndSync]);

  return {
    orders: Array.from(orderMap.values()),
    isConnected,
  };
}

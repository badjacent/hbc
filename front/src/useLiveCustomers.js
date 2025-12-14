import { useCallback, useEffect, useRef, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5189';

// this code keeps the customer list in sync with the backend.
// it handles initial state by starting the listener, pulling the state from the
// backend, and then applying events after the initial state is received. after
// initial processing, it applies events as they come in. on reconnect, it 
// re-fetches state.
export function useLiveCustomers() {
    const [customerMap, setCustomerMap] = useState(new Map());
    const [isConnected, setIsConnected] = useState(false);
    
    const isFetchingRef = useRef(false);
    const eventBufferRef = useRef([]); 

    const applyEventToMap = useCallback((map, event) => {
        const { type, payload } = event;
        // Assuming Enum: 0=Added, 1=Updated, 2=Deleted
        if (type === 2 || type === "Deleted") {
            map.delete(payload.id);
        } else {
            map.set(payload.id, payload);
        }
    }, []);

    const fetchAndSync = useCallback(async () => {
        isFetchingRef.current = true;
        console.log("Fetching latest customer list...");

        try {
            const response = await fetch(`${API_BASE}/api/customers`);
            const data = await response.json();

            setCustomerMap(() => {
                // apply initial state
                const newMap = new Map();
                data.forEach(c => newMap.set(c.id, c));

                // apply events that came in while fetching initial state
                const buffer = eventBufferRef.current;
                if (buffer.length > 0) {
                    console.log(`Applying ${buffer.length} buffered events.`);
                    buffer.forEach(event => applyEventToMap(newMap, event));
                }

                return newMap;
            });
        } catch (err) {
            console.error("Fetch failed", err);
        } finally {
            // Stop buffering, we are now live!
            isFetchingRef.current = false;
            eventBufferRef.current = [];
        }
    }, [applyEventToMap]);

    // 3. HELPER: How to apply a single event
    // 4. SETUP CONNECTION (Run once)
    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl(`${API_BASE}/hubs/orders`)
            .withAutomaticReconnect() 
            .build();

        // A. Handle Incoming Events
        connection.on("CustomerChanged", (event) => {
            if (isFetchingRef.current) {
                // If we are currently loading REST data, queue this up
                console.log("Buffering event during fetch...");
                eventBufferRef.current.push(event);
            } else {
                // Otherwise apply immediately
                setCustomerMap(prev => {
                    const next = new Map(prev);
                    applyEventToMap(next, event);
                    return next;
                });
            }
        });

        // B. Handle Reconnects (The "Self-Healing" Logic)
        connection.onreconnected(() => {
            console.log("Connection restored! Re-fetching to ensure data integrity.");
            fetchAndSync();
        });

        // C. Start the connection
        const start = async () => {
            try {
                await connection.start();
                setIsConnected(true);
                // D. Trigger Initial Load ONLY after socket is ready
                // This ensures we don't miss events during startup
                fetchAndSync(); 
            } catch (err) {
                console.error("SignalR Connection Failed", err);
            }
        };

        start();

        return () => connection.stop();
    }, [applyEventToMap, fetchAndSync]);

    // Return the list for the UI to render
    return {
        customers: Array.from(customerMap.values()),
        isConnected
    };
}

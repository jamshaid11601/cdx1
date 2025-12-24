import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function Diagnostic() {
    const [status, setStatus] = useState<any>({
        url: import.meta.env.VITE_SUPABASE_URL ? 'PRESENT' : 'MISSING',
        key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'PRESENT' : 'MISSING',
        connection: 'IDLE',
        error: null,
        data: null
    });

    useEffect(() => {
        async function check() {
            setStatus(prev => ({ ...prev, connection: 'CHECKING' }));
            try {
                const { data, error } = await supabase.from('services').select('count', { count: 'exact', head: true });
                if (error) {
                    setStatus(prev => ({ ...prev, connection: 'FAILED', error: error.message }));
                } else {
                    setStatus(prev => ({ ...prev, connection: 'SUCCESS', data: data }));
                }
            } catch (err: any) {
                setStatus(prev => ({ ...prev, connection: 'ERROR', error: err.message }));
            }
        }
        check();
    }, []);

    return (
        <div style={{ padding: '20px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '8px', position: 'fixed', top: '20px', left: '20px', zIndex: 9999 }}>
            <h3>Supabase Diagnostic</h3>
            <pre>{JSON.stringify(status, null, 2)}</pre>
        </div>
    );
}

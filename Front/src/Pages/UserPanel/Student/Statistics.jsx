import React from 'react';

export default function Statistics() {
    return (
        <div className=" w-full h-full bg-transparent">
            {/* Full-size overlay container */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-45deg)',
                        // Responsive font size: min 48px, preferred 8vmax, max 160px
                        fontSize: 'clamp(48px, 8vmax, 160px)',
                        fontWeight: 800,
                        color: 'rgba(0,0,0,0.07)',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}
                >
                    En desarrollo
                </span>
            </div>
        </div>
    );
}
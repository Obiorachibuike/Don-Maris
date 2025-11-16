
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SplashContextType {
    isSplashFinished: boolean;
}

const SplashContext = createContext<SplashContextType>({ isSplashFinished: false });

export const SplashProvider = ({ children }: { children: ReactNode }) => {
    const [isSplashFinished, setIsSplashFinished] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSplashFinished(true);
        }, 1500); // This duration should match the splash screen animation

        return () => clearTimeout(timer);
    }, []);


    return (
        <SplashContext.Provider value={{ isSplashFinished }}>
            {children}
        </SplashContext.Provider>
    );
};

export const useSplash = () => {
    const context = useContext(SplashContext);
    if (context === undefined) {
        throw new Error('useSplash must be used within a SplashProvider');
    }
    return context;
};

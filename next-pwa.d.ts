declare module 'next-pwa' {
    import { NextConfig } from 'next';
    
    interface PWAConfig {
        dest?: string;
        disable?: boolean;
        register?: true;
        scope?: string;
        sw?: string;
        skipWaiting?: boolean;
        runtimeCaching?: any[];
        publicExcludes?: string[];
        buildExcludes?: any[];
        cacheOnFrontEndNav?: boolean;
        reloadOnOnline?: boolean;
        addDirectoryIndex?: boolean;
        dynamicStartUrl?: boolean;
        dynamicStartUrlRedirect?: string;
        fallbacks?: any;
        cacheStartUrl?: boolean;
    }

    function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
    export default withPWA;
}
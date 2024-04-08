import type { UserConfig, ResolvedConfig, HmrContext } from "vite";
export declare abstract class VitePlugin {
    abstract name: string;
    vite: ResolvedConfig;
    config?: (vite: UserConfig) => UserConfig;
    init?: (vite: ResolvedConfig) => void;
    handleHotUpdate?: (ctx: HmrContext) => void;
    register(): {
        name: string;
        config: ((vite: UserConfig) => UserConfig) | undefined;
        configResolved: (vite: ResolvedConfig) => void;
        handleHotUpdate: ((ctx: HmrContext) => void) | undefined;
    };
}

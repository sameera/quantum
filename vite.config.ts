/// <reference types='vitest' />
import react from "@vitejs/plugin-react-swc";
import * as path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { glob } from "glob";

export default defineConfig({
    root: __dirname,
    cacheDir: "./node_modules/.vite",
    plugins: [
        react(),
        dts({
            entryRoot: "src",
            tsconfigPath: path.join(__dirname, "tsconfig.lib.json"),
        }),
    ],

    build: {
        outDir: "./dist",
        emptyOutDir: true,
        reportCompressedSize: true,
        sourcemap: true,
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        lib: {
            entry: glob
                .sync("src/**/*.{ts,tsx}", {
                    ignore: [
                        "src/**/*.test.tsx",
                        "src/**/*.test.ts",
                        "src/**/*.spec.tsx",
                        "src/**/*.spec.ts",
                    ],
                })
                .reduce((acc: Record<string, string>, file: string) => {
                    const name = path
                        .relative("src", file)
                        .replace(/\.(ts|tsx)$/, "");
                    acc[name] = file;
                    return acc;
                }, {} as Record<string, string>),
            formats: ["es"],
        },
        rollupOptions: {
            external: ["react", "react-dom", "react/jsx-runtime"],
            output: {
                entryFileNames: "[name].mjs",
                chunkFileNames: "chunks/[name]-[hash].mjs",
                assetFileNames: "assets/[name]-[hash][extname]",
            },
        },
    },
    test: {
        watch: false,
        globals: true,
        environment: "jsdom",
        include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        reporters: ["default"],
        coverage: {
            reportsDirectory: "./coverage",
            provider: "v8",
        },
    },
});

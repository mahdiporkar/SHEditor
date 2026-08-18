import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({root:fileURLToPath(new URL('.',import.meta.url)),resolve:{alias:{'@sheditor/core':fileURLToPath(new URL('../../packages/core/src/index.ts',import.meta.url)),'@sheditor/ui':fileURLToPath(new URL('../../packages/ui/src/index.ts',import.meta.url))}},build:{outDir:'../../dist/playground',emptyOutDir:true}});

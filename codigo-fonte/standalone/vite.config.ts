import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import path from 'node:path';
export default defineConfig({root:path.resolve('standalone'),plugins:[react()],publicDir:path.resolve('public'),css:{postcss:{plugins:[tailwindcss()]}},build:{outDir:'public',emptyOutDir:true}});

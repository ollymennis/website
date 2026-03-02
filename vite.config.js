import { defineConfig } from 'vite';
import { exec } from 'child_process';

export default defineConfig({
  plugins: [{
    name: 'icon-manifest',
    handleHotUpdate({ file }) {
      if (file.includes('/icons/svg/')) {
        exec('node icons/build.js');
      }
    }
  }]
});

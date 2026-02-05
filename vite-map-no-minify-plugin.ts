import type { Plugin } from 'vite';
import * as esbuild from 'esbuild';

const MAP_CHUNK_NAME = 'map';

export function viteMapNoMinifyPlugin(): Plugin {
  return {
    name: 'vite-map-no-minify',
    enforce: 'post',
    apply: 'build',
    config(config) {
      return {
        build: {
          minify: false,
        },
      };
    },
    renderChunk(code, chunk) {
      const isMapChunk =
        chunk.name === MAP_CHUNK_NAME || chunk.fileName.includes(MAP_CHUNK_NAME);
      if (isMapChunk) {
        return null;
      }
      const result = esbuild.transformSync(code, {
        minify: true,
        target: 'esnext',
      });
      return { code: result.code };
    },
  };
}

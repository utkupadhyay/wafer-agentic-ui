import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/ollama/index.ts", "src/groq/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true
});

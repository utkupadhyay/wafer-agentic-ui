import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "adapters/ollama": "src/adapters/ollama.ts",
    "adapters/groq": "src/adapters/groq.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "@wafer/core", "@wafer/react", "@wafer/ui", "@wafer/adapters"]
});

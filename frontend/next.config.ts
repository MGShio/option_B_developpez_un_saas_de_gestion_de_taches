import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Resout le warning "multiple lockfiles" avec chemin absolu
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Desactive l'optimisation des images
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

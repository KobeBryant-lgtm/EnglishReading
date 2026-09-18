import type { StaticImageData } from "next/image";
import architectureCover from "../../public/covers/editorial-architecture.webp";
import coastCover from "../../public/covers/editorial-coast.webp";
import cultureCover from "../../public/covers/editorial-culture.webp";
import educationCover from "../../public/covers/editorial-education.webp";
import interiorCover from "../../public/covers/editorial-interior.webp";
import scienceCover from "../../public/covers/editorial-science.webp";
import societyCover from "../../public/covers/editorial-society.webp";
import sparklerCover from "../../public/covers/editorial-sparkler.webp";
import technologyCover from "../../public/covers/editorial-technology.webp";
import transitCover from "../../public/covers/editorial-transit.webp";
import wildlifeCover from "../../public/covers/editorial-wildlife.webp";
import worldCover from "../../public/covers/editorial-world.webp";

const PHOTO_COVERS: StaticImageData[] = [
  interiorCover,
  wildlifeCover,
  scienceCover,
  sparklerCover,
  technologyCover,
  architectureCover,
  worldCover,
  coastCover,
  societyCover,
  cultureCover,
  transitCover,
  educationCover,
];

function generateSeed(title: string, source: string): number {
  let hash = 2166136261;
  const value = `${title}-${source}`;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getFallbackCoverImage(
  title: string,
  source: string,
  variant?: number
): StaticImageData {
  const index =
    variant === undefined
      ? generateSeed(title, source) % PHOTO_COVERS.length
      : Math.abs(variant) % PHOTO_COVERS.length;
  return PHOTO_COVERS[index];
}

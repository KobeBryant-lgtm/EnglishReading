import Image from "next/image";
import { getFallbackCoverImage } from "@/lib/coverGenerator";

interface ArticleCoverProps {
  title: string;
  source: string;
  sizes: string;
  variant?: number;
  preload?: boolean;
  className?: string;
}

export default function ArticleCover({
  title,
  source,
  sizes,
  variant,
  preload = false,
  className = "",
}: ArticleCoverProps) {
  return (
    <Image
      src={getFallbackCoverImage(title, source, variant)}
      alt=""
      fill
      sizes={sizes}
      placeholder="blur"
      preload={preload}
      className={["object-cover", className].filter(Boolean).join(" ")}
    />
  );
}

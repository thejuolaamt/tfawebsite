import Image from "next/image";

type Props = {
  /** Path in /public, e.g. "/images/story/founder.jpg". Leave empty to show the placeholder. */
  src?: string;
  alt: string;
  /** Text shown inside the placeholder, e.g. "Photo: artist painting" */
  label?: string;
  tone?: "light" | "dark";
  sizes?: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export default function Photo({
  src,
  alt,
  label,
  tone = "light",
  sizes = "(min-width: 768px) 40vw, 90vw",
  className = "",
  loading = "lazy",
}: Props) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          loading={loading}
        />
      </div>
    );
  }

  const toneClass =
    tone === "dark"
      ? "bg-paper/10 text-cream border-paper/40"
      : "bg-line text-ink border-crimson/40";

  return (
    <div
      role="img"
      aria-label={alt}
      className={`flex items-center justify-center overflow-hidden border-[1.5px] border-dashed p-3 text-center ${toneClass} ${className}`}
    >
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-[0.1em]">
          {label}
        </span>
      )}
    </div>
  );
}

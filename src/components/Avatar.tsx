type Props = {
  src?: string | null;
  name?: string | null;
  /** Set the size here, e.g. "size-10". The shape is always a perfect circle. */
  className?: string;
};

// A member photo that is ALWAYS a perfect circle, whatever the picture's shape.
export default function Avatar({ src, name, className = "size-10" }: Props) {
  const initial = (name ?? "").trim().charAt(0).toUpperCase() || "?";

  return (
    <span
      className={`inline-flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-full bg-paper font-bold text-crimson ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name ? `${name} profile photo` : "Member photo"}
          className="size-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </span>
  );
}

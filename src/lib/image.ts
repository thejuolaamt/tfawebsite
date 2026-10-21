// Shrinks a photo in the browser so uploads stay small and load fast.
// square = true crops to a centred square. Otherwise the shape is kept.
export async function resizeImage(
  file: File,
  maxSide = 1400,
  square = false
): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  let sx = 0;
  let sy = 0;
  let sw = bitmap.width;
  let sh = bitmap.height;

  if (square) {
    const min = Math.min(sw, sh);
    sx = (sw - min) / 2;
    sy = (sh - min) / 2;
    sw = min;
    sh = min;
  }

  const scale = Math.min(1, maxSide / Math.max(sw, sh));
  const w = Math.round(sw * scale);
  const h = Math.round(sh * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, w, h);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not process image"))),
      "image/jpeg",
      0.85
    )
  );
}

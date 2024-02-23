import sharp from "sharp";

export async function resizeImage(buffer: Buffer, width = 200, height = 200) {
  const compressedImageData = await sharp(buffer)
    .resize({ width, height })
    .jpeg({ quality: 60 })
    .toBuffer();
  const compressedImageBase64 = compressedImageData.toString("base64");

  return compressedImageBase64;
}

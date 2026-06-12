import { getPlaiceholder, GetPlaiceholderSrc } from "plaiceholder";

export async function getBase64(imagePath: GetPlaiceholderSrc) {
  try {
    const { base64 } = await getPlaiceholder(imagePath);
    return base64;
  } catch (err) {
    console.error(`Failed to generate base64 for image: ${imagePath}`, err);
    return null;
  }
}
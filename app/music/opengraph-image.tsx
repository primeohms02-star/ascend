import { createMusicSocialImage } from "./MusicSocialImage";
import { MUSIC_SOCIAL_IMAGE_ALT } from "./musicSeo";

export const alt =
  MUSIC_SOCIAL_IMAGE_ALT;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType =
  "image/png";

export const runtime =
  "nodejs";

export default function OpenGraphImage() {
  return createMusicSocialImage();
}

import { File } from "expo-file-system";
import type { ImagePickerAsset } from "expo-image-picker";

function guessMimeType(uri: string, mimeType?: string | null): string {
  if (mimeType) {
    return mimeType;
  }

  const extension = uri.split(".").pop()?.toLowerCase();

  if (extension === "png") {
    return "image/png";
  }

  if (extension === "webp") {
    return "image/webp";
  }

  if (extension === "gif") {
    return "image/gif";
  }

  return "image/jpeg";
}

function toDataUri(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`;
}

async function fileUriToDataUri(uri: string, mimeType?: string | null): Promise<string> {
  const base64 = await new File(uri).base64();
  return toDataUri(base64, guessMimeType(uri, mimeType));
}

export async function imagePickerAssetToDataUri(asset: ImagePickerAsset): Promise<string | null> {
  if (asset.base64) {
    return toDataUri(asset.base64, guessMimeType(asset.uri, asset.mimeType));
  }

  if (asset.uri) {
    return fileUriToDataUri(asset.uri, asset.mimeType);
  }

  return null;
}

export function getStoredImageUri(stored: string | null | undefined): string | null {
  if (!stored) {
    return null;
  }

  return stored;
}

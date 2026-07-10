/**
 * Qurilma media ruxsatlari (kamera/mikrofon) bilan ishlash uchun yagona helper.
 * Galereya ruxsati brauzer API'sida yo'q — rasm/video tanlanganda OS o'zi
 * so'raydi (iOS photo library, Android media picker); shuning uchun bu yerda
 * faqat kamera va mikrofon boshqariladi.
 */

export type MediaPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

/** Permissions API orqali holatni o'qish (so'ramasdan). Eski Safari'larda
 *  camera/microphone nomi tanilmaydi — 'unsupported' qaytadi. */
export async function queryMediaPermission(
  name: 'camera' | 'microphone',
): Promise<MediaPermissionState> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return 'unsupported';
  }
  try {
    const status = await navigator.permissions.query({
      name: name as PermissionName,
    });
    return status.state;
  } catch {
    return 'unsupported';
  }
}

/** Brauzer ruxsat oynasini ochish: getUserMedia → treklar darhol to'xtatiladi
 *  (bizga oqim emas, faqat ruxsatning o'zi kerak). */
export async function requestMediaAccess(video: boolean, audio: boolean): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return false;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

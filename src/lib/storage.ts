// Storage abstraction - works with Supabase Storage or localStorage dummy
import { DATA_MODE, getSupabase } from './supabase/client';

const BUCKET = 'wedding-media';

export async function uploadFile(file: File, invitationId: string, role: string): Promise<{ url: string; path: string } | null> {
  if (DATA_MODE === 'local') {
    // Dummy: simulate upload with data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result as string, path: `invitations/${invitationId}/${role}/${Date.now()}-${file.name}` });
      reader.readAsDataURL(file);
    });
  }

  const supabase = getSupabase();
  if (!supabase) return null;

  const path = `invitations/${invitationId}/${role}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) { console.error('Upload error:', error); return null; }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: urlData.publicUrl, path };
}

export async function deleteFile(path: string): Promise<boolean> {
  if (DATA_MODE === 'local') return true;

  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return !error;
}

export function validateFile(file: File, maxSizeMB = 5): string | null {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedAudioTypes = ['audio/mpeg', 'audio/mp3'];

  if (allowedImageTypes.includes(file.type) && file.size > maxSizeMB * 1024 * 1024) {
    return `File gambar tidak boleh lebih dari ${maxSizeMB}MB`;
  }
  if (allowedAudioTypes.includes(file.type) && file.size > 10 * 1024 * 1024) {
    return 'File musik tidak boleh lebih dari 10MB';
  }
  if (![...allowedImageTypes, ...allowedAudioTypes].includes(file.type)) {
    return 'Format file tidak didukung (JPG, PNG, WebP, MP3)';
  }
  return null;
}

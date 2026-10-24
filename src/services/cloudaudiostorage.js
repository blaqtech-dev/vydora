
import { supabase } from '../lib/supabase';

const BUCKET = 'vydora-audio';

const sanitizeFileName = (name) =>
  name
    .replace(/[\/\\]/g, '-')
    .replace(/[^\w.\- ()]/g, '_')
    .trim()
    .slice(0, 180) || 'audio.mp3';

export async function uploadCloudAudio({ name, blob, type }) {
  if (!(blob instanceof Blob)) {
    throw new Error('The audio file is invalid.');
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error('Please log in before saving audio online.');
  }

  const id = crypto.randomUUID();
  const safeName = sanitizeFileName(name);
  const storagePath = `${user.id}/${id}/${safeName}`;
  const mimeType = type || blob.type || 'audio/mpeg';

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, blob, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from('audio_files')
    .insert({
      id,
      user_id: user.id,
      name: safeName,
      storage_path: storagePath,
      type: mimeType,
      size: blob.size,
    })
    .select()
    .single();

  if (insertError) {
    // Prevent an orphaned storage object if metadata creation fails.
    const { error: cleanupError } = await supabase.storage
      .from(BUCKET)
      .remove([storagePath]);

    if (cleanupError) {
      console.error('Could not clean up uploaded audio:', cleanupError);
    }

    throw insertError;
  }

  return {
    id: data.id,
    name: data.name,
    type: data.type,
    size: data.size,
    storagePath: data.storage_path,
    createdAt: data.created_at,
    blob,
  };
}

export async function getCloudAudioFiles() {
  const { data: userData, error: userError } =
    await supabase.auth.getUser();

  if (userError) throw userError;
  if (!userData.user) {
    throw new Error('Please log in to access your audio library.');
  }

  const { data, error } = await supabase
    .from('audio_files')
    .select('id, name, storage_path, type, size, created_at')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((file) => ({
    id: file.id,
    name: file.name,
    storagePath: file.storage_path,
    type: file.type,
    size: file.size,
    createdAt: file.created_at,
  }));
}

export async function downloadCloudAudio(storagePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(storagePath);

  if (error) throw error;

  return data;
}

export async function deleteCloudAudio(file) {
  // Remove the storage object first, so a failed storage deletion
  // doesn't leave a database record pointing to a missing file.
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([file.storagePath]);

  if (storageError) throw storageError;

  const { error: rowError } = await supabase
    .from('audio_files')
    .delete()
    .eq('id', file.id);

  if (rowError) {
    throw new Error(
      `The audio file was removed from storage, but its database record could not be deleted: ${rowError.message}`,
    );
  }
}



export async function getCloudAudioUrl(storagePath) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 3600);

  if (error) throw error;

  return data.signedUrl;
}

export async function renameCloudAudio(id, name) {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error('Please enter a valid file name.');
  }

  const { data, error } = await supabase
    .from('audio_files')
    .update({ name: cleanName })
    .eq('id', id)
    .select('id, name')
    .single();

  if (error) throw error;

  return data;
}

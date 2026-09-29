import { supabase } from '@/lib/supabaseClient';
import type { SiteRow, ObservationRow } from '@/types';

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export async function fetchSites(): Promise<SiteRow[]> {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export interface ObservationInput {
  site_id: string;
  water_appearance: string;
  odour: string;
  water_flow: string;
  visible_pollution: string;
  vegetation_condition: string;
  wildlife_observed: string;
  notes: string;
}

export interface SubmitResult {
  observation: ObservationRow;
  photoUploaded: boolean;
  photoError: string | null;
}

export async function submitObservation(
  input: ObservationInput,
  photoFile: File | null,
): Promise<SubmitResult> {
  const { data: obsData, error: obsError } = await supabase
    .from('observations')
    .insert({
      site_id: input.site_id,
      water_appearance: input.water_appearance || null,
      odour: input.odour || null,
      water_flow: input.water_flow || null,
      visible_pollution: input.visible_pollution || null,
      vegetation_condition: input.vegetation_condition || null,
      wildlife_observed: input.wildlife_observed || null,
      notes: input.notes || null,
      source: 'citizen',
      is_demo: false,
    })
    .select()
    .single();

  if (obsError) throw obsError;
  if (!obsData) throw new Error('Observation was not created.');

  if (!photoFile) {
    return { observation: obsData, photoUploaded: false, photoError: null };
  }

  const filePath = `${obsData.id}/${Date.now()}-${photoFile.name}`;

  const { error: uploadError } = await supabase.storage
    .from('observation-evidence')
    .upload(filePath, photoFile, {
      contentType: photoFile.type,
      upsert: false,
    });

  if (uploadError) {
    return {
      observation: obsData,
      photoUploaded: false,
      photoError: 'Your observation was saved, but the photo could not be uploaded.',
    };
  }

  const { error: photoRecordError } = await supabase
    .from('observation_photos')
    .insert({
      observation_id: obsData.id,
      storage_path: filePath,
    });

  if (photoRecordError) {
    await supabase.storage.from('observation-evidence').remove([filePath]);

    return {
      observation: obsData,
      photoUploaded: false,
      photoError: 'Your observation was saved, but the photo could not be linked.',
    };
  }

  return { observation: obsData, photoUploaded: true, photoError: null };
}

export function validatePhoto(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please choose an image file (JPG, PNG, or WebP).';
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return 'Please choose an image under 5 MB.';
  }
  return null;
}

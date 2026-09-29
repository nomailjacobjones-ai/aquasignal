import { supabase } from '@/lib/supabaseClient';
import type { SiteRow, ObservationRow, ObservationPhotoRow } from '@/types';

export interface ObservationWithSite extends ObservationRow {
  sites: Pick<SiteRow, 'id' | 'name' | 'region' | 'city' | 'latitude' | 'longitude'> | null;
}

export interface ObservationWithPhotos extends ObservationWithSite {
  photos: ObservationPhotoRow[];
}

export async function fetchRecentObservations(limit = 50): Promise<ObservationWithSite[]> {
  const { data, error } = await supabase
    .from('observations')
    .select(`
      *,
      sites:id_site (
        id, name, region, city, latitude, longitude
      )
    `)
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as ObservationWithSite[];
}

export async function fetchObservationById(id: string): Promise<ObservationWithPhotos | null> {
  const { data, error } = await supabase
    .from('observations')
    .select(`
      *,
      sites:id_site (
        id, name, region, city, latitude, longitude
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  if (!data) return null;

  const { data: photos, error: photoError } = await supabase
    .from('observation_photos')
    .select('*')
    .eq('observation_id', id)
    .order('created_at', { ascending: true });

  if (photoError) throw photoError;

  return {
    ...(data as unknown as ObservationWithSite),
    photos: photos ?? [],
  };
}

export async function fetchObservationsBySite(siteId: string, limit = 20): Promise<ObservationWithSite[]> {
  const { data, error } = await supabase
    .from('observations')
    .select(`
      *,
      sites:id_site (
        id, name, region, city, latitude, longitude
      )
    `)
    .eq('site_id', siteId)
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as ObservationWithSite[];
}

export interface DashboardMetricsData {
  totalObservations: number;
  sitesMonitored: number;
  observationsToday: number;
  awaitingAnalysis: number;
}

export async function fetchDashboardMetrics(): Promise<DashboardMetricsData> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayIso = startOfDay.toISOString();

  const [obsCount, sitesCount, todayCount] = await Promise.all([
    supabase.from('observations').select('id', { count: 'exact', head: true }),
    supabase.from('sites').select('id', { count: 'exact', head: true }),
    supabase.from('observations').select('id', { count: 'exact', head: true }).gte('submitted_at', todayIso),
  ]);

  if (obsCount.error) throw obsCount.error;
  if (sitesCount.error) throw sitesCount.error;
  if (todayCount.error) throw todayCount.error;

  return {
    totalObservations: obsCount.count ?? 0,
    sitesMonitored: sitesCount.count ?? 0,
    observationsToday: todayCount.count ?? 0,
    awaitingAnalysis: 0,
  };
}

export interface SiteWithObservationCount extends SiteRow {
  observation_count: number;
}

export async function fetchSitesWithCounts(): Promise<SiteWithObservationCount[]> {
  const { data: sites, error } = await supabase
    .from('sites')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  if (!sites || sites.length === 0) return [];

  const siteIds = sites.map((s) => s.id);
  const { data: counts, error: countError } = await supabase
    .from('observations')
    .select('site_id')
    .in('site_id', siteIds);

  if (countError) throw countError;

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    const sid = (row as { site_id: string }).site_id;
    countMap.set(sid, (countMap.get(sid) ?? 0) + 1);
  }

  return sites.map((site) => ({
    ...site,
    observation_count: countMap.get(site.id) ?? 0,
  }));
}

export function getPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage.from('observation-evidence').getPublicUrl(storagePath);
  return data.publicUrl;
}

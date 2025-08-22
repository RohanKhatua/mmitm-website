
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CacheStats } from '@/lib/types';

export default function CacheStatsPage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCacheStats() {
      try {
        const response = await fetch('/api/cache');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCacheStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Cache Statistics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Autocomplete Cache</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Place Details Cache</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Geocoding Cache</CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        <h1 className="text-3xl font-bold mb-6">Cache Statistics</h1>
        <p>Error fetching cache statistics: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Cache Statistics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Autocomplete Cache</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Size:</strong> {stats?.autocomplete.size ?? 'N/A'}</p>
            <p><strong>Max Size:</strong> {stats?.autocomplete.maxSize ?? 'N/A'}</p>
            <p><strong>TTL:</strong> {stats?.autocomplete.ttl ? `${stats.autocomplete.ttl / 1000 / 60} minutes` : 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Place Details Cache</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Size:</strong> {stats?.placeDetails.size ?? 'N/A'}</p>
            <p><strong>Max Size:</strong> {stats?.placeDetails.maxSize ?? 'N/A'}</p>
            <p><strong>TTL:</strong> {stats?.placeDetails.ttl ? `${stats.placeDetails.ttl / 1000 / 60} minutes` : 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Geocoding Cache</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Size:</strong> {stats?.geocoding.size ?? 'N/A'}</p>
            <p><strong>Max Size:</strong> {stats?.geocoding.maxSize ?? 'N/A'}</p>
            <p><strong>TTL:</strong> {stats?.geocoding.ttl ? `${stats.geocoding.ttl / 1000 / 60} minutes` : 'N/A'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

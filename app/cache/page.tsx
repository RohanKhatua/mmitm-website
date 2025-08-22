
'use client';

import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CacheStats } from '@/lib/types';

export default function CacheStatsPage() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCacheStats = async () => {
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
  };

  const handleClearCache = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cache', {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchCacheStats(); // Refetch stats after clearing
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
          <Card>
            <CardHeader>
              <CardTitle>Recommendations Cache</CardTitle>
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Cache Statistics</h1>
        <Button onClick={handleClearCache} variant="destructive">
          Clear All Caches
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Autocomplete Cache</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Size:</strong> {stats?.autocomplete.size ?? 'N/A'}</p>
            <p><strong>Max Size:</strong> {stats?.autocomplete.maxSize ?? 'N/A'}</p>
            <p><strong>TTL:</strong> {stats?.autocomplete.ttl ? `${stats.autocomplete.ttl / 1000 / 60} minutes` : 'N/A'}</p>
            {stats?.autocomplete.contents && stats.autocomplete.contents.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Contents:</h3>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="list-disc pl-5">
                    {stats.autocomplete.contents.map(([key]) => (
                      <li key={key} className="text-sm">{key}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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
            {stats?.placeDetails.contents && stats.placeDetails.contents.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Contents:</h3>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="list-disc pl-5">
                    {stats.placeDetails.contents.map(([key]) => (
                      <li key={key} className="text-sm">{key}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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
            {stats?.geocoding.contents && stats.geocoding.contents.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Contents:</h3>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="list-disc pl-5">
                    {stats.geocoding.contents.map(([key]) => (
                      <li key={key} className="text-sm">{key}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recommendations Cache</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Size:</strong> {stats?.recommendations.size ?? 'N/A'}</p>
            <p><strong>Max Size:</strong> {stats?.recommendations.maxSize ?? 'N/A'}</p>
            <p><strong>TTL:</strong> {stats?.recommendations.ttl ? `${stats.recommendations.ttl / 1000 / 60} minutes` : 'N/A'}</p>
            {stats?.recommendations.contents && stats.recommendations.contents.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Contents:</h3>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="list-disc pl-5">
                    {stats.recommendations.contents.map(([key]) => (
                      <li key={key} className="text-sm">{key}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



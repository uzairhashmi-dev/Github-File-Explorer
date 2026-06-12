// All requests: GET /api/github?endpoint=/users/torvalds

import { NextRequest, NextResponse } from 'next/server';

const GITHUB_BASE = 'https://api.github.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: 'endpoint param required' }, { status: 400 });
  }

  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Optional: add token from env to increase rate limit 60 → 5000/hr
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(`${GITHUB_BASE}${endpoint}`, {
    headers,
    next: { revalidate: 300 }, // cache 5 minutes — saves rate limit
  });

  const data = await res.json();

  // Pass GitHub status code through — store handles 404, 403 etc.
  return NextResponse.json(data, { status: res.status });
}
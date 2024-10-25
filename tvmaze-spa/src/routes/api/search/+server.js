import { json } from '@sveltejs/kit';

export async function GET({ url }) {
  const query = url.searchParams.get('q');
  
  if (!query) {
    return json({ error: 'Missing query parameter' }, { status: 400 });
  }

  const response = await fetch(`https://api.tvmaze.com/search/shows?q=${query}`);
  
  if (!response.ok) {
    return json({ error: 'Failed to fetch data' }, { status: 500 });
  }

  const data = await response.json();
  return json(data);
}

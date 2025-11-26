import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { mockSearchResponse } from './mocks/fixtures';

export const SEARCH_API_URL = 'https://scoopsearch.search.windows.net/indexes/apps/docs';

const defaultHandlers = [
  http.post(`${SEARCH_API_URL}/search`, async ({ request }) => {
    const body = (await request.json()) as {
      search?: string;
    };

    if (body.search === 'error') {
      return HttpResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return HttpResponse.json(mockSearchResponse);
  }),
];

export const server = setupServer(...defaultHandlers);

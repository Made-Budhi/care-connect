// src/mocks/newsHandlers.ts
import {http, HttpResponse, type HttpHandler} from 'msw';

// Helper to validate bearer token
const validateBearerToken = (request: Request): { userId: string | number, token: string } | null => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    return { userId: 'mock-admin-user', token };
};

// Helper function to format a Date object into SQL DATETIME string 'YYYY-MM-DD HH:MM:SS'
const toSqlDateTime = (date: Date): string => {
    const pad = (num: number) => (num < 10 ? '0' : '') + num;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// Interface for the News entity
interface News {
    uuid: string;
    title: string;
    dateCreated: string; // SQL DATETIME format
    picture: string; // URL or path to the main image
    description: string; // A short summary or the full article content
}

// In-memory "database" for our mock news articles
// Current date: June 17, 2025
let newsDB: News[] = [
    {
        uuid: 'news-uuid-001',
        title: 'Annual Charity Gala Raises Record Funds for Education',
        dateCreated: '2025-06-15 10:00:00',
        picture: 'https://images.unsplash.com/photo-1542037104-924825a12735?w=500',
        description: 'Last night\'s annual charity gala was a tremendous success, raising over Rp 500 million to support educational programs for underprivileged children across the archipelago. The event was attended by community leaders, sponsors, and volunteers.'
    },
    {
        uuid: 'news-uuid-002',
        title: 'New "Sponsor a School" Program Launched in West Java',
        dateCreated: '2025-06-10 11:30:00',
        picture: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500',
        description: 'In partnership with local businesses, we are thrilled to announce the launch of our "Sponsor a School" program, starting with five schools in the greater Bandung area. This program aims to provide essential learning materials and facility upgrades.'
    },
    {
        uuid: 'news-uuid-003',
        title: 'Volunteer Spotlight: Ibu Siti\'s Dedication to Literacy',
        dateCreated: '2025-05-28 09:00:00',
        picture: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500',
        description: 'This month, we celebrate Ibu Siti, a volunteer who has dedicated over five years to running a mobile library for children in remote villages. Her passion and hard work have brought the joy of reading to hundreds of children.'
    }
];

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Define handlers for the News API
export const newsHandlers: HttpHandler[] = [
    /**
     * GET /v1/news
     * Get all news articles.
     */
    http.get(`${baseUrl}/v1/news`, async () => {
        // This endpoint can be public, but we can still check for a token
        // for potential future admin-specific views.
        // const authResult = validateBearerToken(request);
        // if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        // Sorting by date descending to show the newest first
        const sortedNews = [...newsDB].sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());

        return HttpResponse.json(sortedNews);
    }),

    /**
     * POST /v1/news
     * Add a new news article. Requires admin privileges.
     */
    http.post(`${baseUrl}/v1/news`, async ({ request }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const newNewsData = await request.json() as Omit<News, 'uuid' | 'dateCreated'>;
        if (!newNewsData.title || !newNewsData.description || !newNewsData.picture) {
            return HttpResponse.json({ message: 'title, description, and picture are required.' }, { status: 400 });
        }

        const newNews: News = {
            uuid: `news-${crypto.randomUUID()}`,
            dateCreated: toSqlDateTime(new Date()),
            ...newNewsData,
        };
        newsDB.push(newNews);
        return HttpResponse.json(newNews, { status: 201 });
    }),

    /**
     * PUT /v1/news/:uuid
     * Edit an existing news article by its UUID.
     */
    http.put(`${baseUrl}/v1/news/:uuid`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { uuid } = params;
        const updatedData = await request.json() as Partial<Omit<News, 'uuid' | 'dateCreated'>>;
        const newsIndex = newsDB.findIndex(n => n.uuid === uuid);

        if (newsIndex === -1) {
            return new HttpResponse(JSON.stringify({ message: 'News article not found' }), { status: 404 });
        }

        newsDB[newsIndex] = { ...newsDB[newsIndex], ...updatedData };
        return HttpResponse.json(newsDB[newsIndex]);
    }),

    /**
     * DELETE /v1/news/:uuid
     * Delete a news article by its UUID.
     */
    http.delete(`${baseUrl}/v1/news/:uuid`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { uuid } = params;
        const initialLength = newsDB.length;
        newsDB = newsDB.filter(n => n.uuid !== uuid);

        if (newsDB.length < initialLength) {
            return new Response(null, { status: 204 }); // Standard for successful DELETE
        } else {
            return new HttpResponse(JSON.stringify({ message: 'News article not found' }), { status: 404 });
        }
    }),
];

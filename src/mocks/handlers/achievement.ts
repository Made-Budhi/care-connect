// src/mocks/achievementHandlers.ts
import {http, HttpResponse, type HttpHandler} from 'msw';

// Helper to validate bearer token
// (This would typically be in a shared authentication utility file)
const validateBearerToken = (request: Request): { userId: string | number, token:string } | null => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return null;
    }
    // For mock purposes, any non-empty token is valid.
    return { userId: 'mock-user-123', token };
};

// Interface for the Achievement entity
interface Achievement {
    uuid: string;
    childrenUuid: string; // To link the achievement to a specific child
    title: string;
    description: string;
    achievementType: 'academic' | 'non-academic';
    image: string; // Path to the image file
    date: string;  // Date the achievement was received, in 'YYYY-MM-DD' format
}

// In-memory "database" for our mock achievements
// Using dates before our current time of June 2025.
let achievementsDB: Achievement[] = [
    {
        uuid: 'ach-uuid-001',
        childrenUuid: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', // Emma Johnson
        title: 'First Place in Regional Spelling Bee',
        description: 'Competed against 50 other students from various schools and won first place.',
        achievementType: 'academic',
        image: '/images/achievements/spelling-bee-winner.jpg',
        date: '2025-05-20',
    },
    {
        uuid: 'ach-uuid-002',
        childrenUuid: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', // Noah Williams
        title: 'Soccer Tournament MVP',
        description: 'Awarded Most Valuable Player for scoring 5 goals in the inter-school soccer tournament.',
        achievementType: 'non-academic',
        image: '/images/achievements/soccer-mvp.jpg',
        date: '2025-04-15',
    },
    {
        uuid: 'ach-uuid-003',
        childrenUuid: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', // Emma Johnson
        title: 'Art Exhibition Feature',
        description: 'Her painting "Sunset over the Hills" was featured in the local community art exhibition.',
        achievementType: 'non-academic',
        image: '/images/achievements/art-exhibition.jpg',
        date: '2025-03-10',
    },
];

// Ensure VITE_API_URL is available, otherwise provide a fallback
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'; // Fallback URL

// Define handlers for the Achievement API
export const achievementHandlers: HttpHandler[] = [
    /**
     * GET /v1/achievements/:uuid
     * Get a specific achievement by its UUID.
     */
    http.get(`${baseUrl}/v1/achievements/:uuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        const {uuid} = params;
        const achievement = achievementsDB.find(ach => ach.uuid === uuid);

        if (!achievement) {
            return new HttpResponse(
                JSON.stringify({message: 'Achievement not found'}),
                {status: 404, headers: { 'Content-Type': 'application/json' }}
            );
        }

        return HttpResponse.json(achievement);
    }),

    /**
     * GET /v1/achievements/children/:childrenUuid
     * Get all achievements for a specific child.
     */
    http.get(`${baseUrl}/v1/achievements/children/:childrenUuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        const {childrenUuid} = params;
        const childAchievements = achievementsDB.filter(ach => ach.childrenUuid === childrenUuid);

        // It's fine to return an empty array if a child has no achievements.
        return HttpResponse.json(childAchievements);
    }),

    /**
     * POST /v1/achievements
     * Add a new achievement for a child.
     */
    http.post(`${baseUrl}/v1/achievements`, async ({request}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        // The body should contain all necessary fields except the UUID.
        const newAchievementData = await request.json() as Omit<Achievement, 'uuid'>;

        // Basic validation
        if (!newAchievementData.title || !newAchievementData.childrenUuid || !newAchievementData.date) {
            return HttpResponse.json({
                message: 'Invalid request body. Required fields: title, childrenUuid, date.'
            }, { status: 400 });
        }

        const newAchievement: Achievement = {
            uuid: `ach-${crypto.randomUUID()}`, // Generate a unique UUID
            ...newAchievementData,
        };

        achievementsDB.push(newAchievement);

        return HttpResponse.json({
            message: 'Achievement added successfully',
            achievement: newAchievement
        }, {status: 201});
    }),

    /**
     * PUT /v1/achievements/:uuid
     * Edit an existing achievement by its UUID.
     */
    http.put(`${baseUrl}/v1/achievements/:uuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        const {uuid} = params;
        const updatedData = await request.json() as Partial<Omit<Achievement, 'uuid'>>;
        const achievementIndex = achievementsDB.findIndex(ach => ach.uuid === uuid);

        if (achievementIndex === -1) {
            return new HttpResponse(
                JSON.stringify({message: 'Achievement not found'}),
                {status: 404, headers: { 'Content-Type': 'application/json' }}
            );
        }

        // Update the achievement data.
        achievementsDB[achievementIndex] = {
            ...achievementsDB[achievementIndex],
            ...updatedData,
        };

        return HttpResponse.json({
            message: 'Achievement updated successfully',
            achievement: achievementsDB[achievementIndex]
        });
    }),

    /**
     * DELETE /v1/achievements/:uuid
     * Delete an achievement by its UUID.
     */
    http.delete(`${baseUrl}/v1/achievements/:uuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        const {uuid} = params;
        const initialLength = achievementsDB.length;
        achievementsDB = achievementsDB.filter(ach => ach.uuid !== uuid);

        if (achievementsDB.length < initialLength) {
            // Standard practice is to return 204 No Content on successful deletion.
            return new Response(null, { status: 204 });
        } else {
            return new HttpResponse(
                JSON.stringify({message: 'Achievement not found'}),
                {status: 404, headers: { 'Content-Type': 'application/json' }}
            );
        }
    }),
];

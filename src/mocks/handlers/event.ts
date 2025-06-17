// src/mocks/eventHandlers.ts
import {http, HttpResponse, type HttpHandler} from 'msw';

// Helper to validate bearer token
const validateBearerToken = (request: Request): { userId: string | number, token: string } | null => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    // For mock purposes, any non-empty token is valid.
    return { userId: 'mock-admin-789', token };
};

// --- INTERFACES ---

type EventStatus = 'pending' | 'approved' | 'rejected';

interface ItemDonation {
    name: string;
    quantity: number;
}

interface EventSubmission {
    uuid: string;
    sponsorUuid: string;
    schoolId: string;
    childUuid: string;
    title: string;
    detail?: string;
    location: string;
    status: EventStatus;
    dateSubmitted: string; // SQL DATETIME format
    eventStart: string; // SQL DATETIME format
    eventEnd: string;   // SQL DATETIME format
    rejectionNote?: string;
    itemDonations: ItemDonation[];
}

// --- MOCK DATABASES ---
// A small mock Children DB for name lookups, mimicking a database relation
const childrenDB = [
    { uuid: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', name: 'Emma Johnson' },
    { uuid: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', name: 'Noah Williams' },
];

const sponsorsDB = [
    { uuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k', name: 'Jonathan Johnson' },
    { uuid: '3x4w5v6u-7t8s-9r0q-1p2o-3n4m5l6k7j8i', name: 'Grace Abigail' },
];

const schoolsDB = [
    { uuid: '1q2w3e4r-5t6y-7u8i-9o0p-1a2s3d4f5g6h', name: 'Sunshine Elementary School' },
    { uuid: 'school-B-2', name: 'Oakridge School' },
];

const eventSubmissionsDB: EventSubmission[] = [
    {
        uuid: 'evt-sub-001',
        sponsorUuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k',
        schoolId: '1q2w3e4r-5t6y-7u8i-9o0p-1a2s3d4f5g6h',
        childUuid: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', // Linked to Emma
        title: 'End of Year Book Fair',
        detail: 'A charity book fair to provide free books for all elementary students.',
        location: 'Sunshine Elementary School Hall',
        status: 'approved',
        dateSubmitted: '2025-06-19 12:00:00',
        eventStart: '2025-06-20 09:00:00',
        eventEnd: '2025-06-21 15:00:00',
        itemDonations: [ { name: 'Children\'s Story Books', quantity: 100 } ]
    },
    {
        uuid: 'evt-sub-002',
        sponsorUuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k',
        schoolId: '1q2w3e4r-5t6y-7u8i-9o0p-1a2s3d4f5g6h',
        childUuid: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', // Linked to Noah
        title: 'Coding Workshop for Teens',
        detail: 'A weekend workshop to introduce basic web development.',
        location: 'Oakridge School Computer Lab',
        status: 'pending',
        dateSubmitted: '2025-07-11 12:00:00',
        eventStart: '2025-07-12 10:00:00',
        eventEnd: '2025-07-13 16:00:00',
        itemDonations: [ { name: 'Notebooks', quantity: 30 } ]
    },
    {
        uuid: 'evt-sub-003',
        sponsorUuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k',
        schoolId: 'q2w3e4r-5t6y-7u8i-9o0p-1a2s3d4f5g6h',
        childUuid: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', // Linked to Emma
        title: 'School Painting Competition',
        detail: 'A competition to re-paint the school walls with educational murals.',
        location: 'Sunshine Elementary School Yard',
        status: 'rejected',
        dateSubmitted: '2025-08-01 08:00:00',
        eventStart: '2025-08-01 08:00:00',
        eventEnd: '2025-08-01 14:00:00',
        rejectionNote: 'Event timing conflicts with scheduled school maintenance.',
        itemDonations: [ { name: 'Paint (Various Colors)', quantity: 20 } ]
    }
];

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// --- HANDLERS ---

const eventSubmissionHandlers: HttpHandler[] = [
    /**
     * GET /v1/event-submissions
     * Get all event submissions (typically for an admin view).
     */
    http.get(`${baseUrl}/v1/event-submissions`, async ({ request }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const responseData = eventSubmissionsDB.map(submission => {
            const sponsor = sponsorsDB.find(s => s.uuid === submission.sponsorUuid);
            const child = childrenDB.find(c => c.uuid === submission.childUuid);
            return {
                uuid: submission.uuid,
                title: submission.title,
                status: submission.status,
                dateSubmitted: submission.eventStart, // Using eventStart as submission date for example
                sponsorName: sponsor?.name || 'Unknown Sponsor',
                childName: child?.name || 'Unknown Child',
            };
        });
        return HttpResponse.json(responseData);
    }),

    /**
     * GET /v1/event-submissions/:uuid
     * Get a single event submission by its UUID.
     */
    http.get(`${baseUrl}/v1/event-submissions/:uuid`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { uuid } = params;
        const submission = eventSubmissionsDB.find(s => s.uuid === uuid);
        if (!submission) return new HttpResponse(JSON.stringify({ message: 'Not Found' }), { status: 404 });

        return HttpResponse.json(submission);
    }),

    /**
     * GET /v1/event-submissions/sponsor/:sponsorUuid
     * Get all event submissions by a specific sponsor.
     */
    http.get(`${baseUrl}/v1/event-submissions/sponsor/:sponsorUuid`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { sponsorUuid } = params;
        const submissions = eventSubmissionsDB.filter(s => s.sponsorUuid === sponsorUuid);

        // This simulates a database JOIN to add the child's name to the response
        const responseData = submissions.map(submission => {
            const child = childrenDB.find(c => c.uuid === submission.childUuid);
            const school = schoolsDB.find(s => s.uuid === submission.schoolId);
            const sponsor = sponsorsDB.find(s => s.uuid === submission.sponsorUuid);

            return {
                uuid: submission.uuid,
                title: submission.title,
                status: submission.status,
                eventStart: submission.eventStart,
                eventEnd: submission.eventEnd,
                childName: child ? child.name : 'Unknown Child',
                sponsorName: sponsor?.name || 'Unknown Sponsor',
                schoolName: school?.name || 'Unknown School',
            };
        });

        return HttpResponse.json(responseData);
    }),

    /**
     * GET /v1/event-submissions/school/:schoolId
     * Get all event submissions for a specific school.
     */
    http.get(`${baseUrl}/v1/event-submissions/school/:schoolId`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { schoolId } = params;
        const submissions = eventSubmissionsDB.filter(s => s.schoolId === schoolId);

        // Simulate a JOIN to include names in the response
        const responseData = submissions.map(submission => {
            const child = childrenDB.find(c => c.uuid === submission.childUuid);
            const sponsor = sponsorsDB.find(s => s.uuid === submission.sponsorUuid);
            return {
                uuid: submission.uuid,
                title: submission.title,
                status: submission.status,
                eventStart: submission.eventStart,
                eventEnd: submission.eventEnd,
                dateSubmitted: submission.dateSubmitted,
                childName: child?.name || 'Unknown Child',
                sponsorName: sponsor?.name || 'Unknown Sponsor',
            };
        });

        return HttpResponse.json(responseData);
    }),

    /**
     * POST /v1/event-submissions
     * Add a new event submission.
     */
    http.post(`${baseUrl}/v1/event-submissions`, async ({ request }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const body = await request.json() as Omit<EventSubmission, 'uuid' | 'status'>;
        if (!body.title || !body.detail || !body.sponsorUuid) {
            return HttpResponse.json({ message: 'title, detail, and sponsorUuid are required' }, { status: 400 });
        }

        const newSubmission: EventSubmission = {
            uuid: `evt-sub-${crypto.randomUUID()}`,
            status: 'pending',
            rejectionNote: undefined,
            ...body
        };
        eventSubmissionsDB.push(newSubmission);
        return HttpResponse.json(newSubmission, { status: 201 });
    }),

    /**
     * PATCH /v1/event-submissions/:uuid/approve
     * Approve an event submission.
     */
    http.patch(`${baseUrl}/v1/event-submissions/:uuid/approve`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { uuid } = params;
        const submissionIndex = eventSubmissionsDB.findIndex(s => s.uuid === uuid);
        if (submissionIndex === -1) return new HttpResponse(JSON.stringify({ message: 'Not Found' }), { status: 404 });

        eventSubmissionsDB[submissionIndex].status = 'approved';
        eventSubmissionsDB[submissionIndex].rejectionNote = undefined; // Clear any previous rejection note
        return HttpResponse.json(eventSubmissionsDB[submissionIndex]);
    }),

    /**
     * PATCH /v1/event-submissions/:uuid/reject
     * Reject an event submission.
     */
    http.patch(`${baseUrl}/v1/event-submissions/:uuid/reject`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { uuid } = params;
        const body = await request.json() as { rejectionNote?: string };
        const submissionIndex = eventSubmissionsDB.findIndex(s => s.uuid === uuid);
        if (submissionIndex === -1) return new HttpResponse(JSON.stringify({ message: 'Not Found' }), { status: 404 });

        eventSubmissionsDB[submissionIndex].status = 'rejected';
        eventSubmissionsDB[submissionIndex].rejectionNote = body.rejectionNote || 'No reason provided.';
        return HttpResponse.json(eventSubmissionsDB[submissionIndex]);
    }),
];

const eventHandlers: HttpHandler[] = [
    /**
     * GET /v1/events
     * Get all publicly visible events (i.e., approved submissions).
     */
    http.get(`${baseUrl}/v1/events`, async ({ request }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const approvedEvents = eventSubmissionsDB.filter(s => s.status === 'approved');
        return HttpResponse.json(approvedEvents);
    }),

    /**
     * GET /v1/events/:uuid
     * Get a single publicly visible event.
     */
    http.get(`${baseUrl}/v1/events/:uuid`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { uuid } = params;
        const event = eventSubmissionsDB.find(s => s.uuid === uuid && s.status === 'approved');
        if (!event) return new HttpResponse(JSON.stringify({ message: 'Event not found or is not approved' }), { status: 404 });

        return HttpResponse.json(event);
    }),

    /**
     * GET /v1/events/school/:schoolId
     * Get all approved events for a specific school.
     */
    http.get(`${baseUrl}/v1/events/school/:schoolId`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { schoolId } = params;
        const schoolEvents = eventSubmissionsDB.filter(s => s.status === 'approved' && s.schoolId === schoolId);
        return HttpResponse.json(schoolEvents);
    }),

    /**
     * GET /v1/events/sponsor/:sponsorUuid
     * Get all approved events submitted by a specific sponsor.
     */
    http.get(`${baseUrl}/v1/events/sponsor/:sponsorUuid`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { sponsorUuid } = params;
        const sponsorEvents = eventSubmissionsDB.filter(s => s.status === 'approved' && s.sponsorUuid === sponsorUuid);
        return HttpResponse.json(sponsorEvents);
    }),
];

// Export a combined array of all handlers for MSW setup
export const eventAndSubmissionHandlers = [
    ...eventSubmissionHandlers,
    ...eventHandlers,
];

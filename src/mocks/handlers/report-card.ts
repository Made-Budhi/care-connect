// src/mocks/reportCardHandlers.ts
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

// Interface for the Report Card entity
interface ReportCard {
    uuid: string;
    childrenUuid: string; // To link the report card to a specific child
    academicYear: string; // e.g., "2024/2025"
    grade: string;        // e.g., "3rd"
    semester: 'odd' | 'even';
    semesterDateStart: string; // Date in 'YYYY-MM-DD' format
    semesterDateEnd: string;   // Date in 'YYYY-MM-DD' format
    reportCardFile: string;    // Path to the PDF file
    final_grade: string;       // The final grade for the semester, e.g., "A", "B+", "85"
}

// In-memory "database" for our mock report cards
// Mock data reflects a plausible Indonesian academic calendar.
// Current date: June 11, 2025.
let reportCardsDB: ReportCard[] = [
    {
        uuid: 'rc-uuid-001',
        childrenUuid: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', // Emma Johnson
        academicYear: '2024/2025',
        grade: '4th',
        semester: 'odd',
        semesterDateStart: '2024-07-15',
        semesterDateEnd: '2024-12-20',
        reportCardFile: '/files/report-cards/emma-johnson-2024-2025-odd.pdf',
        final_grade: 'A-',
    },
    {
        uuid: 'rc-uuid-002',
        childrenUuid: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', // Emma Johnson
        academicYear: '2024/2025',
        grade: '4th',
        semester: 'even',
        semesterDateStart: '2025-01-13',
        semesterDateEnd: '2025-06-10', // Just finished
        reportCardFile: '/files/report-cards/emma-johnson-2024-2025-even.pdf',
        final_grade: 'A',
    },
    {
        uuid: 'rc-uuid-003',
        childrenUuid: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', // Noah Williams
        academicYear: '2024/2025',
        grade: '5th',
        semester: 'odd',
        semesterDateStart: '2024-07-15',
        semesterDateEnd: '2024-12-20',
        reportCardFile: '/files/report-cards/noah-williams-2024-2025-odd.pdf',
        final_grade: 'B+',
    },
];

// Ensure VITE_API_URL is available, otherwise provide a fallback
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'; // Fallback URL

// Define handlers for the Report Card API
export const reportCardHandlers: HttpHandler[] = [
    /**
     * GET /v1/report-cards/:uuid
     * Get a specific report card by its UUID.
     */
    http.get(`${baseUrl}/v1/report-cards/:uuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        const {uuid} = params;
        const reportCard = reportCardsDB.find(rc => rc.uuid === uuid);

        if (!reportCard) {
            return new HttpResponse(
                JSON.stringify({message: 'Report card not found'}),
                {status: 404, headers: { 'Content-Type': 'application/json' }}
            );
        }

        return HttpResponse.json(reportCard);
    }),

    /**
     * GET /v1/report-cards/children/:childrenUuid
     * Get all report cards for a specific child.
     */
    http.get(`${baseUrl}/v1/report-cards/children/:childrenUuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        const {childrenUuid} = params;
        const childReportCards = reportCardsDB.filter(rc => rc.childrenUuid === childrenUuid);

        // Returning an empty array is the correct behavior if a child has no report cards.
        return HttpResponse.json(childReportCards);
    }),

    /**
     * POST /v1/report-cards
     * Add a new report card for a child.
     */
    http.post(`${baseUrl}/v1/report-cards`, async ({request}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        // The body should contain all necessary fields except the UUID.
        const newReportCardData = await request.json() as Omit<ReportCard, 'uuid'>;

        // Basic validation
        if (!newReportCardData.childrenUuid || !newReportCardData.academicYear || !newReportCardData.reportCardFile || !newReportCardData.final_grade) {
            return HttpResponse.json({
                message: 'Invalid request body. Required fields: childrenUuid, academicYear, reportCardFile, final_grade.'
            }, { status: 400 });
        }

        const newReportCard: ReportCard = {
            uuid: `rc-${crypto.randomUUID()}`, // Generate a unique UUID
            ...newReportCardData,
        };

        reportCardsDB.push(newReportCard);

        return HttpResponse.json({
            message: 'Report card added successfully',
            reportCard: newReportCard
        }, {status: 201});
    }),

    /**
     * PUT /v1/report-cards/:uuid
     * Edit an existing report card by its UUID.
     */
    http.put(`${baseUrl}/v1/report-cards/:uuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        const {uuid} = params;
        const updatedData = await request.json() as Partial<Omit<ReportCard, 'uuid'>>;
        const reportCardIndex = reportCardsDB.findIndex(rc => rc.uuid === uuid);

        if (reportCardIndex === -1) {
            return new HttpResponse(
                JSON.stringify({message: 'Report card not found'}),
                {status: 404, headers: { 'Content-Type': 'application/json' }}
            );
        }

        // Update the report card data.
        reportCardsDB[reportCardIndex] = {
            ...reportCardsDB[reportCardIndex],
            ...updatedData,
        };

        return HttpResponse.json({
            message: 'Report card updated successfully',
            reportCard: reportCardsDB[reportCardIndex]
        });
    }),

    /**
     * DELETE /v1/report-cards/:uuid
     * Delete a report card by its UUID.
     */
    http.delete(`${baseUrl}/v1/report-cards/:uuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        const {uuid} = params;
        const initialLength = reportCardsDB.length;
        reportCardsDB = reportCardsDB.filter(rc => rc.uuid !== uuid);

        if (reportCardsDB.length < initialLength) {
            // Standard practice is to return 204 No Content on successful deletion.
            return new Response(null, { status: 204 });
        } else {
            return new HttpResponse(
                JSON.stringify({message: 'Report card not found'}),
                {status: 404, headers: { 'Content-Type': 'application/json' }}
            );
        }
    }),
];

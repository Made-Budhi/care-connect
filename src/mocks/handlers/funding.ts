// src/mocks/fundingSubmissionHandlers.ts
import {http, HttpResponse, type HttpHandler, delay} from 'msw';

// Helper to validate bearer token
// (This would typically be in a shared authentication utility file)
const validateBearerToken = (request: Request): { userId: string | number, token: string } | null => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null; // No token or incorrect scheme
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return null; // Token is empty
    }
    // For mock purposes, any non-empty token is considered valid.
    // In a real scenario, you'd decode and verify the JWT.
    return { userId: 'mock-sponsor-789', token }; // Example mock user ID for a sponsor
};

// Interface for the criteria used to match children for funding
interface ChildrenCriteria {
    grade?: string; // e.g., "Grade 5", "10th Grade"
    age?: number;
    name?: string; // To match a specific child's name (if known)
    school?: string; // Name of the school the child attends
}

// Possible statuses for a funding submission
type FundingStatus = 'pending' | 'rejected' | 'approved';

// Data structure for the list view of funding submissions
// sponsorUuid is removed as per user request for this specific list item view
interface FundingSubmissionListItem {
    uuid: string;
    status: FundingStatus;
    date_requested: string; // ISO date string, e.g., "2024-07-15T10:30:00Z"
    period: number; // Funding period in years
}

// Data structure for the detailed view of a funding submission
// This interface still contains sponsorUuid as it's for the detailed view
interface FundingSubmissionDetail extends FundingSubmissionListItem {
    sponsorUuid: string;
    childrenCriteria: ChildrenCriteria;
    notes?: string; // Optional notes from the sponsor about this submission
    rejectionReason?: string; // Optional, populated if status is 'rejected'
    approvalDate?: string; // Optional, populated if status is 'approved' (ISO date string)
}

// In-memory "database" for our mock funding submissions
let fundingSubmissionsDB: FundingSubmissionDetail[] = [
    {
        uuid: 'fs-alpha-001',
        sponsorUuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k',
        status: 'pending',
        date_requested: '2025-02-12 16:02:00',
        period: 1,
        childrenCriteria: {
            age: 7,
            grade: 'Grade 2',
            school: 'Northwood Elementary',
        },
        notes: 'Request for Northwood Elementary 2nd grader.',
    },
    {
        uuid: 'fs-beta-002',
        sponsorUuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k',
        status: 'approved',
        date_requested: '2025-06-03 23:02:00',
        period: 3,
        childrenCriteria: {
            name: 'Daniel Armstrong', // Example if sponsoring a known child
            grade: '10th Grade',
            school: 'Central High School',
        },
        notes: 'Approved for 3-year scholarship for a specific student.',
        approvalDate: '2024-05-20T11:00:00Z',
    },
    {
        uuid: 'fs-gamma-003',
        sponsorUuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k',
        status: 'rejected',
        date_requested: '2024-06-08 13:02:00',
        period: 2,
        childrenCriteria: {
            age: 15,
            school: 'Southside Vocational',
        },
        rejectionReason: 'Budget constraints for the current cycle.',
        notes: 'Request for vocational training support at Southside.',
    },
];

const sponsors = [
    {
        uuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k',
        submissions: ['fs-gamma-003', 'fs-beta-002', 'fs-alpha-001']
    },
    {
        uuid: '3x4w5v6u-7t8s-9r0q-1p2o-3n4m5l6k7j8i',
        submissions: []
    }
];

const customDelay = 1000

const baseUrl = import.meta.env.VITE_API_URL;

// Define handlers for the Funding Submission API
export const fundingSubmissionHandlers: HttpHandler[] = [
    /**
     * GET /v1/funding-submissions
     * Get all funding submissions (summary list view).
     * Returns items matching FundingSubmissionListItem (without sponsorUuid).
     */
    http.get(`${baseUrl}/v1/funding-submissions`, async ({request}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        const listItems: FundingSubmissionListItem[] = fundingSubmissionsDB.map(fs => ({
            uuid: fs.uuid,
            // sponsorUuid: fs.sponsorUuid, // Removed as per new FundingSubmissionListItem
            status: fs.status,
            date_requested: fs.date_requested,
            period: fs.period,
        }));

        return HttpResponse.json(listItems);
    }),

    /**
     * GET /v1/funding-submissions/sponsor/:sponsorUuid
     * Get funding submissions made by a specific sponsor (summary list view).
     * Returns items matching FundingSubmissionListItem (without sponsorUuid).
     */
    http.get(`${baseUrl}/v1/funding-submissions/sponsor/:uuid`, async ({request, params}) => {
        await delay(customDelay)

        const authResult = validateBearerToken(request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        const {uuid} = params;
        const sponsor = sponsors.find(sponsor => sponsor.uuid === uuid);

        if (!sponsor) {
            return new HttpResponse(
                JSON.stringify({message: 'Sponsor not found'}),
                {status: 404}
            );
        }

        const fundingSubmissions = fundingSubmissionsDB.filter(fundingSubmission =>
            sponsor.submissions.includes(fundingSubmission.uuid)
        );

        // Return basic information for sponsored children
        const basicFundingSubmissionsInfo = fundingSubmissions.map(fundingSubmission => ({
            uuid: fundingSubmission.uuid,
            status: fundingSubmission.status,
            date_requested: fundingSubmission.date_requested,
            period: fundingSubmission.period
        }));

        return HttpResponse.json(basicFundingSubmissionsInfo)
    }),

    /**
     * GET /v1/funding-submissions/:submissionUuid
     * Get a specific funding submission by its UUID (detailed version).
     * Returns FundingSubmissionDetail which includes sponsorUuid.
     */
    http.get(`${baseUrl}/v1/funding-submissions/:submissionUuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        const {submissionUuid} = params;
        const submission = fundingSubmissionsDB.find(fs => fs.uuid === submissionUuid);

        if (!submission) {
            return new HttpResponse(
                JSON.stringify({message: 'Funding submission not found'}),
                {status: 404, headers: { 'Content-Type': 'application/json' }}
            );
        }

        return HttpResponse.json(submission); // Returns the full FundingSubmissionDetail
    }),

    /**
     * POST /v1/funding-submissions
     * Add a new funding submission.
     * Expects: sponsorUuid, period, childrenCriteria in the request body. Notes are optional.
     */
    http.post(`${baseUrl}/v1/funding-submissions`, async ({request}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        let submissionData: {
            sponsorUuid: string;
            period: number;
            childrenCriteria: ChildrenCriteria;
            notes?: string;
        };

        try {
            submissionData = await request.json() as typeof submissionData;
        } catch (e) {
            console.error(e)
            return HttpResponse.json({ message: 'Invalid JSON body' }, { status: 400, headers: { 'Content-Type': 'application/json' }});
        }

        // Basic validation
        if (!submissionData.sponsorUuid || typeof submissionData.period !== 'number' || !submissionData.childrenCriteria || typeof submissionData.childrenCriteria !== 'object') {
            return HttpResponse.json({
                message: 'Invalid request body. Required fields: sponsorUuid (string), period (number), childrenCriteria (object).'
            }, { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const newSubmission: FundingSubmissionDetail = {
            uuid: `fs-${crypto.randomUUID()}`, // Generate a unique UUID
            sponsorUuid: submissionData.sponsorUuid,
            status: 'pending',
            date_requested: new Date().toISOString(),
            period: submissionData.period,
            childrenCriteria: submissionData.childrenCriteria,
            notes: submissionData.notes,
        };

        fundingSubmissionsDB.push(newSubmission);

        // The POST response typically returns the created resource in its detailed form
        return HttpResponse.json({
            message: 'Funding submission added successfully',
            submission: newSubmission // Returns FundingSubmissionDetail
        }, {status: 201, headers: { 'Content-Type': 'application/json' }});
    }),

    /**
     * DELETE /v1/funding-submissions/:submissionUuid
     * Delete a funding submission by its UUID.
     */
    http.delete(`${baseUrl}/v1/funding-submissions/:submissionUuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized: Bearer token is missing or invalid.'}),
                {status: 401, headers: { 'Content-Type': 'application/json' }}
            );
        }

        const {submissionUuid} = params;
        const initialLength = fundingSubmissionsDB.length;
        fundingSubmissionsDB = fundingSubmissionsDB.filter(fs => fs.uuid !== submissionUuid);

        if (fundingSubmissionsDB.length < initialLength) {
            return new Response(null, { status: 204 });
        } else {
            return new HttpResponse(
                JSON.stringify({message: 'Funding submission not found'}),
                {status: 404, headers: { 'Content-Type': 'application/json' }}
            );
        }
    }),
];

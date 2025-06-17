// src/mocks/fundingAndPaymentHandlers.ts
import {http, HttpResponse, type HttpHandler} from 'msw';

// Helper to validate bearer token
const validateBearerToken = (request: Request): { userId: string | number, token: string } | null => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    return { userId: 'mock-admin-789', token };
};

// Helper function to format a Date object into SQL DATETIME string 'YYYY-MM-DD HH:MM:SS'
const toSqlDateTime = (date: Date): string => {
    const pad = (num: number) => (num < 10 ? '0' : '') + num;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// --- INTERFACES ---

interface ChildrenCriteria {
    grade?: string; age?: number; name?: string; school?: string;
}

type FundingStatus = 'pending' | 'rejected' | 'approved';
type PaymentStatus = 'pending' | 'rejected' | 'approved';

interface FundingSubmissionListItem {
    uuid: string;
    status: FundingStatus;
    date_requested: string;
    period: number;
}

interface FundingSubmissionDetail extends FundingSubmissionListItem {
    sponsorUuid: string;
    childrenCriteria: ChildrenCriteria;
    foster_child_uuid?: string;
    notes?: string;
    rejectionReason?: string;
    approvalDate?: string;
    approved_by?: string;

    payment_link?: string;
}

interface PaymentProof {
    uuid: string;
    submissionUuid: string;
    imagePath: string;
    dateUploaded: string;
    status: PaymentStatus;
}

// --- MOCK DATABASES ---

const sponsorsDB = [
    { uuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k', name: 'Jonathan Johnson' },
];

let fundingSubmissionsDB: FundingSubmissionDetail[] = [
    {
        uuid: 'fs-alpha-001',
        sponsorUuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k',
        status: 'pending',
        date_requested: '2025-05-12 16:02:00',
        period: 1,
        childrenCriteria: { age: 7, grade: 'Grade 2', school: 'Northwood Elementary' },
        notes: 'Request for Northwood Elementary 2nd grader.',
    },
    {
        uuid: 'fs-beta-002',
        sponsorUuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k',
        status: 'approved',
        date_requested: '2025-04-03 23:02:00',
        period: 3,
        childrenCriteria: { name: 'Emma Johnson' },
        foster_child_uuid: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', // MATCHED CHILD
        notes: 'Approved for 3-year scholarship for Emma.',
        approvalDate: '2025-04-20 11:00:00',
        approved_by: 'admin-user-001',
        payment_link: 'https://mock-payment-gateway.com/pay/fs-beta-002',
    },
    { // Approved, but no payment proof yet
        uuid: 'fs-delta-004',
        sponsorUuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k',
        status: 'approved',
        date_requested: '2025-06-01 10:00:00',
        period: 1,
        childrenCriteria: { grade: '5th Grade' },
        foster_child_uuid: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', // Noah Williams
        notes: 'Approved, pending payment proof.',
        approvalDate: '2025-06-05 14:00:00',
        approved_by: 'admin-user-002',
        payment_link: 'https://mock-payment-gateway.com/pay/fs-delta-004',
    },
    {
        uuid: 'fs-gamma-003',
        sponsorUuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k',
        status: 'rejected',
        date_requested: '2025-02-08 13:02:00',
        period: 2,
        childrenCriteria: { age: 15, school: 'Southside Vocational' },
        rejectionReason: 'Budget constraints for the current cycle.',
        notes: 'Request for vocational training support at Southside.',
    },
];

const paymentProofsDB: PaymentProof[] = [
    {
        uuid: 'pp-uuid-001',
        submissionUuid: 'fs-beta-002', // Linked to the approved submission
        imagePath: '/files/proofs/payment-proof-fs-beta-002.jpg',
        dateUploaded: '2025-04-22 09:30:00',
        status: 'pending',
    }
];

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// --- HANDLERS ---

const fundingSubmissionHandlers: HttpHandler[] = [
    /**
     * GET /v1/funding-submissions
     * Get all funding submissions (summary list view).
     */
    http.get(`${baseUrl}/v1/funding-submissions`, async ({ request }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const listItems: FundingSubmissionListItem[] = fundingSubmissionsDB.map(fs => {
            const sponsor = sponsorsDB.find(s => s.uuid === fs.sponsorUuid);
            return {
                uuid: fs.uuid,
                sponsorName: sponsor ? sponsor.name : 'Unknown Sponsor',
                status: fs.status,
                date_requested: fs.date_requested,
                period: fs.period,
            };
        });
        return HttpResponse.json(listItems);
    }),

    /**
     * GET /v1/funding-submissions/sponsor/:uuid
     * Get funding submissions made by a specific sponsor.
     */
    http.get(`${baseUrl}/v1/funding-submissions/sponsor/:uuid`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { uuid: sponsorUuid } = params;

        const submissions = fundingSubmissionsDB.filter(fs => fs.sponsorUuid === sponsorUuid);

        const listItems: FundingSubmissionListItem[] = submissions.map(fs => ({
            uuid: fs.uuid,
            status: fs.status,
            date_requested: fs.date_requested,
            period: fs.period,
        }));

        return HttpResponse.json(listItems);
    }),

    /**
     * GET /v1/funding-submissions/:uuid
     * Get a specific funding submission by its UUID (detailed version).
     */
    http.get(`${baseUrl}/v1/funding-submissions/:uuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { uuid } = params;
        const submission = fundingSubmissionsDB.find(fs => fs.uuid === uuid);

        if (!submission) return new HttpResponse(JSON.stringify({message: 'Not Found'}), {status: 404});

        return HttpResponse.json(submission);
    }),

    /**
     * POST /v1/funding-submissions
     * Add a new funding submission.
     */
    http.post(`${baseUrl}/v1/funding-submissions`, async ({ request }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const submissionData = await request.json() as Omit<FundingSubmissionDetail, 'uuid' | 'status' | 'date_requested'>;

        if (!submissionData.sponsorUuid || !submissionData.period || !submissionData.childrenCriteria) {
            return HttpResponse.json({ message: 'sponsorUuid, period, and childrenCriteria are required.'}, { status: 400 });
        }

        const newSubmission: FundingSubmissionDetail = {
            uuid: `fs-${crypto.randomUUID()}`,
            status: 'pending',
            date_requested: toSqlDateTime(new Date()),
            ...submissionData
        };
        fundingSubmissionsDB.push(newSubmission);

        return HttpResponse.json({ message: 'Submission created successfully', submission: newSubmission }, { status: 201 });
    }),

    /**
     * PATCH /v1/funding-submissions/:uuid/approve
     * Approve a funding submission, requiring a payment link AND a matched child UUID.
     */
    http.patch(`${baseUrl}/v1/funding-submissions/:uuid/approve`, async ({request, params}) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { uuid } = params;
        const body = await request.json() as { payment_link: string; foster_child_uuid: string };

        if (!body.payment_link || !body.foster_child_uuid) {
            return HttpResponse.json({ message: 'payment_link and foster_child_uuid are required for approval.' }, { status: 400 });
        }

        const submissionIndex = fundingSubmissionsDB.findIndex(fs => fs.uuid === uuid);
        if (submissionIndex === -1) return new HttpResponse(JSON.stringify({message: 'Not Found'}), {status: 404});

        const submission = fundingSubmissionsDB[submissionIndex];
        submission.status = 'approved';
        submission.payment_link = body.payment_link;
        submission.foster_child_uuid = body.foster_child_uuid;
        submission.approved_by = authResult.userId.toString();
        submission.approvalDate = toSqlDateTime(new Date());
        submission.rejectionReason = undefined;

        return HttpResponse.json(submission);
    }),

    /**
     * PATCH /v1/funding-submissions/:uuid/reject
     * Reject a funding submission.
     */
    http.patch(`${baseUrl}/v1/funding-submissions/:uuid/reject`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { uuid } = params;
        const body = await request.json() as { rejectionReason?: string };
        const submissionIndex = fundingSubmissionsDB.findIndex(fs => fs.uuid === uuid);
        if (submissionIndex === -1) return new HttpResponse(JSON.stringify({message: 'Not Found'}), {status: 404});

        const submission = fundingSubmissionsDB[submissionIndex];
        submission.status = 'rejected';
        submission.rejectionReason = body.rejectionReason || 'No reason provided.';
        submission.foster_child_uuid = undefined;
        submission.payment_link = undefined;
        submission.approved_by = undefined;
        submission.approvalDate = undefined;

        return HttpResponse.json(submission);
    }),

    /**
     * DELETE /v1/funding-submissions/:uuid
     * Delete a funding submission.
     */
    http.delete(`${baseUrl}/v1/funding-submissions/:uuid`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { uuid } = params;
        const initialLength = fundingSubmissionsDB.length;
        fundingSubmissionsDB = fundingSubmissionsDB.filter(fs => fs.uuid !== uuid);

        if (fundingSubmissionsDB.length < initialLength) {
            return new Response(null, { status: 204 }); // Success, no content
        }
        return new HttpResponse(JSON.stringify({ message: 'Not Found' }), { status: 404 });
    }),
];

const paymentProofHandlers: HttpHandler[] = [
    /**
     * GET /v1/payment-proofs
     * Get a list of all payment proofs with combined information.
     */
    http.get(`${baseUrl}/v1/payment-proofs`, async ({ request }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const paymentProofList = paymentProofsDB.map(proof => {
            const submission = fundingSubmissionsDB.find(fs => fs.uuid === proof.submissionUuid);
            return {
                paymentProofUuid: proof.uuid, // Pass the proof's own UUID for actions
                childrenUuid: submission?.foster_child_uuid || null, // Get child UUID from submission
                submissionUuid: proof.submissionUuid,
                paymentStatus: proof.status,
                dateUploaded: proof.dateUploaded,
            };
        });

        return HttpResponse.json(paymentProofList);
    }),

    /**
     * NEW ENDPOINT
     * GET /v1/payment-proofs/submission/:submissionUuid
     * Get the payment proof for a single submission. Returns 404 if not found.
     */
    http.get(`${baseUrl}/v1/payment-proofs/submission/:submissionUuid`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { submissionUuid } = params;
        const proof = paymentProofsDB.find(p => p.submissionUuid === submissionUuid);

        if (proof) {
            return HttpResponse.json(proof);
        } else {
            // A 404 is the correct response to signal that the proof doesn't exist yet.
            return new HttpResponse(JSON.stringify({ message: 'Payment proof not found' }), { status: 404 });
        }
    }),

    /**
     * POST /v1/payment-proofs
     * Upload a new payment proof for a submission.
     */
    http.post(`${baseUrl}/v1/payment-proofs`, async ({ request }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const body = await request.json() as { submissionUuid: string; imagePath: string };

        if (!body.submissionUuid || !body.imagePath) {
            return HttpResponse.json({ message: 'submissionUuid and imagePath are required.' }, { status: 400 });
        }

        const submission = fundingSubmissionsDB.find(fs => fs.uuid === body.submissionUuid);
        if (!submission || submission.status !== 'approved') {
            return HttpResponse.json({ message: 'Payment proof can only be uploaded for approved submissions.' }, { status: 403 });
        }

        // Prevent duplicate proofs in mock DB
        const existingProofIndex = paymentProofsDB.findIndex(p => p.submissionUuid === body.submissionUuid);
        if(existingProofIndex > -1) {
            paymentProofsDB.splice(existingProofIndex, 1);
        }

        const newProof: PaymentProof = {
            uuid: `pp-${crypto.randomUUID()}`,
            submissionUuid: body.submissionUuid,
            imagePath: body.imagePath,
            dateUploaded: toSqlDateTime(new Date()),
            status: 'pending',
        };

        paymentProofsDB.push(newProof);

        return HttpResponse.json({
            message: 'Payment proof uploaded successfully.',
            paymentProof: newProof,
        }, { status: 201 });
    }),
];


// Export a combined array of all handlers for MSW setup
export const fundingAndPaymentHandlers = [
    ...fundingSubmissionHandlers,
    ...paymentProofHandlers,
];

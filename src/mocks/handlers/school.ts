// src/mocks/schoolHandlers.ts
import {http, HttpResponse, type HttpHandler} from 'msw';

// Helper to validate bearer token
// (This would typically be in a shared authentication utility file)
const validateBearerToken = (request: Request): { userId: string | number, token:string } | null => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    return { userId: 'mock-school-admin-1', token };
};

interface School {
    uuid: string;
    userUuid: string; // The user who manages this school
    name: string;
    region: string;
    address: string;
    latitude: number;
    longitude: number;
}

// In-memory "database" for our mock schools
// Using realistic Indonesian locations
let schoolsDB: School[] = [
    {
        uuid: '1q2w3e4r-5t6y-7u8i-9o0p-1a2s3d4f5g6h',
        userUuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5a5g',
        name: 'Sunshine Elementary School',
        region: 'DKI Jakarta',
        address: 'Jl. Besuki No.4, RT.4/RW.5, Menteng, Kec. Menteng',
        latitude: -6.1954,
        longitude: 106.8272,
    },
    {
        uuid: 'sch-uuid-002',
        userUuid: 'user-school-admin-B',
        name: 'SMP Negeri 5 Bandung',
        region: 'Jawa Barat',
        address: 'Jl. Sumatera No.40, Merdeka, Kec. Sumur Bandung, Kota Bandung',
        latitude: -6.9103,
        longitude: 107.6112,
    },
    {
        uuid: 'sch-uuid-003',
        userUuid: 'user-school-admin-C',
        name: 'SMA Negeri 1 Denpasar',
        region: 'Bali',
        address: 'Jl. Kamboja No.4, Dangin Puri Kangin, Kec. Denpasar Utara',
        latitude: -8.6534,
        longitude: 115.2217,
    },
];

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Define handlers for the School API
export const schoolHandlers: HttpHandler[] = [
    /**
     * GET /v1/schools/user/:userUuid
     * Get the school managed by a specific user.
     */
    http.get(`${baseUrl}/v1/schools/user/:userUuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});
        }

        const {userUuid} = params;
        const school = schoolsDB.find(s => s.userUuid === userUuid);

        if (!school) {
            return new HttpResponse(JSON.stringify({message: 'No school associated with this user account'}), {status: 404});
        }
        return HttpResponse.json(school);
    }),

    /**
     * GET /v1/schools
     * Get all schools.
     */
    http.get(`${baseUrl}/v1/schools`, async ({request}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});
        }
        return HttpResponse.json(schoolsDB);
    }),

    /**
     * GET /v1/schools/:uuid
     * Get a specific school by its UUID.
     */
    http.get(`${baseUrl}/v1/schools/:uuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});
        }

        const {uuid} = params;
        const school = schoolsDB.find(s => s.uuid === uuid);

        if (!school) {
            return new HttpResponse(JSON.stringify({message: 'School not found'}), {status: 404});
        }
        return HttpResponse.json(school);
    }),

    /**
     * GET /v1/schools/filter
     * Filter schools based on query parameters (e.g., name, region).
     */
    http.get(`${baseUrl}/v1/schools/filter`, async ({request}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});
        }

        const url = new URL(request.url);
        const nameQuery = url.searchParams.get('name');
        const regionQuery = url.searchParams.get('region');

        let filteredSchools = [...schoolsDB];

        if (nameQuery) {
            filteredSchools = filteredSchools.filter(s =>
                s.name.toLowerCase().includes(nameQuery.toLowerCase())
            );
        }
        if (regionQuery) {
            filteredSchools = filteredSchools.filter(s =>
                s.region.toLowerCase().includes(regionQuery.toLowerCase())
            );
        }

        return HttpResponse.json(filteredSchools);
    }),

    /**
     * POST /v1/schools
     * Add a new school.
     */
    http.post(`${baseUrl}/v1/schools`, async ({request}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});
        }

        const newSchoolData = await request.json() as Omit<School, 'uuid'>;
        if (!newSchoolData.name || !newSchoolData.userUuid || !newSchoolData.address) {
            return HttpResponse.json({message: 'name, userUuid, and address are required.'}, {status: 400});
        }

        const newSchool: School = {
            uuid: `sch-${crypto.randomUUID()}`,
            ...newSchoolData,
        };
        schoolsDB.push(newSchool);

        return HttpResponse.json({message: 'School added successfully', school: newSchool}, {status: 201});
    }),

    /**
     * PUT /v1/schools/:uuid
     * Edit an existing school by its UUID.
     */
    http.put(`${baseUrl}/v1/schools/:uuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});
        }

        const {uuid} = params;
        const updatedData = await request.json() as Partial<Omit<School, 'uuid'>>;
        const schoolIndex = schoolsDB.findIndex(s => s.uuid === uuid);

        if (schoolIndex === -1) {
            return new HttpResponse(JSON.stringify({message: 'School not found'}), {status: 404});
        }

        schoolsDB[schoolIndex] = { ...schoolsDB[schoolIndex], ...updatedData };
        return HttpResponse.json({message: 'School updated successfully', school: schoolsDB[schoolIndex]});
    }),

    /**
     * DELETE /v1/schools/:uuid
     * Delete a school by its UUID.
     */
    http.delete(`${baseUrl}/v1/schools/:uuid`, async ({request, params}) => {
        const authResult = validateBearerToken(request as unknown as Request);
        if (!authResult) {
            return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});
        }

        const {uuid} = params;
        const initialLength = schoolsDB.length;
        schoolsDB = schoolsDB.filter(s => s.uuid !== uuid);

        if (schoolsDB.length < initialLength) {
            return new Response(null, { status: 204 }); // Standard for successful DELETE
        } else {
            return new HttpResponse(JSON.stringify({message: 'School not found'}), {status: 404});
        }
    }),
];

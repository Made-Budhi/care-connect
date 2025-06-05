import {http, HttpResponse} from 'msw';

// Helper to validate bearer token (imported from authentication.ts)
const validateBearerToken = (request: Request) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];

    // In a real implementation, this would validate the token against activeTokens
    // For mock purposes, we'll just return a mock user ID
    return { userId: 1, token };
};

interface School {
    uuid: string;
    name: string;
    region: string;
    address: string;
    latitude: number;
    longitude: number;
}

// Mock data for schools
const schools = [
    {
        uuid: '1q2w3e4r-5t6y-7u8i-9o0p-1a2s3d4f5g6h',
        name: 'Sunshine Elementary',
        region: 'East',
        address: '123 Sunshine Ave, Sunnyville, CA 90210',
        latitude: 34.0522,
        longitude: -118.2437
    },
    {
        uuid: '2w3e4r5t-6y7u-8i9o-0p1a-2s3d4f5g6h7j',
        name: 'Oakridge School',
        region: 'West',
        address: '456 Oak St, Oakville, CA 90211',
        latitude: 34.0633,
        longitude: -118.4413
    },
    {
        uuid: '3e4r5t6y-7u8i-9o0p-1a2s-3d4f5g6h7j8k',
        name: 'Pinecrest Academy',
        region: 'North',
        address: '789 Pine Rd, Pineville, CA 90212',
        latitude: 34.1478,
        longitude: -118.1445
    },
    {
        uuid: '4r5t6y7u-8i9o-0p1a-2s3d-4f5g6h7j8k9l',
        name: 'Maple Grove Elementary',
        region: 'South',
        address: '101 Maple Dr, Maplewood, CA 90213',
        latitude: 33.9866,
        longitude: -118.3417
    },
    {
        uuid: '5t6y7u8i-9o0p-1a2s-3d4f-5g6h7j8k9l0m',
        name: 'Cedar Heights School',
        region: 'Central',
        address: '202 Cedar Blvd, Cedarville, CA 90214',
        latitude: 34.0211,
        longitude: -118.4912
    }
];

const baseUrl = import.meta.env.VITE_API_URL;

// Define handlers for school API
export const schoolHandlers = [
    // GET all schools
    http.get(`${baseUrl}/v1/schools`, async ({request}) => {
        // Validate bearer token
        const auth = validateBearerToken(request);
        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        return HttpResponse.json(schools);
    }),

    // GET a specific school by UUID
    http.get(`${baseUrl}/v1/schools/:uuid`, async ({request, params}) => {
        // Validate bearer token
        const auth = validateBearerToken(request);
        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        const {uuid} = params;
        const school = schools.find(school => school.uuid === uuid);

        if (!school) {
            return new HttpResponse(
                JSON.stringify({message: 'School not found'}),
                {status: 404}
            );
        }

        return HttpResponse.json(school);
    }),

    // Filter schools
    http.get(`${baseUrl}/v1/schools/filter`, async ({request}) => {
        // Validate bearer token
        const auth = validateBearerToken(request);
        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        const url = new URL(request.url);
        const name = url.searchParams.get('name');
        const region = url.searchParams.get('region');

        let filteredSchools = [...schools];

        if (name) {
            filteredSchools = filteredSchools.filter(school => 
                school.name.toLowerCase().includes(name.toLowerCase())
            );
        }

        if (region) {
            filteredSchools = filteredSchools.filter(school => 
                school.region.toLowerCase() === region.toLowerCase()
            );
        }

        return HttpResponse.json(filteredSchools);
    }),

    // POST add a new school
    http.post(`${baseUrl}/v1/schools`, async ({request}) => {
        // Validate bearer token
        const auth = validateBearerToken(request);
        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        const newSchool = await request.json() as School;

        if (!newSchool) {
            return HttpResponse.json({
                message: 'Invalid request body'
            }, { status: 400 });
        }

        // Generate a UUID for the new school
        newSchool.uuid = crypto.randomUUID();
        
        // Add the new school to the schools array
        schools.push(newSchool);

        return HttpResponse.json({
            message: 'School added successfully',
            uuid: newSchool.uuid
        }, {status: 201});
    }),

    // PUT edit a school by UUID
    http.put(`${baseUrl}/v1/schools/:uuid`, async ({request, params}) => {
        // Validate bearer token
        const auth = validateBearerToken(request);
        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        const {uuid} = params;
        const updatedSchoolData = await request.json() as School;
        
        const schoolIndex = schools.findIndex(school => school.uuid === uuid);
        
        if (schoolIndex === -1) {
            return new HttpResponse(
                JSON.stringify({message: 'School not found'}),
                {status: 404}
            );
        }
        
        // Update the school data
        schools[schoolIndex] = {
            ...schools[schoolIndex],
            ...updatedSchoolData,
        };

        return HttpResponse.json({
            message: 'School updated successfully',
            school: schools[schoolIndex]
        });
    }),

    // DELETE a school by UUID
    http.delete(`${baseUrl}/v1/schools/:uuid`, async ({request, params}) => {
        // Validate bearer token
        const auth = validateBearerToken(request);
        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        const {uuid} = params;
        const schoolIndex = schools.findIndex(school => school.uuid === uuid);
        
        if (schoolIndex === -1) {
            return new HttpResponse(
                JSON.stringify({message: 'School not found'}),
                {status: 404}
            );
        }
        
        // Remove the school from the array
        schools.splice(schoolIndex, 1);

        return HttpResponse.json({
            message: 'School deleted successfully'
        });
    }),
];
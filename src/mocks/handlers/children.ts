import {delay, http, HttpResponse} from 'msw';

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

interface Child {
    uuid: string;
    name: string;
    schoolName: string;
    dateOfBirth: string;
    gender: string;
    grade: string;
    semester: string;
    shoesSize: string;
    shirtSize: string;
    fatherName: string;
    fatherJob: string;
    motherName: string;
    siblings: { name: string, gender: string, dateOfBirth: string }[];
    favoriteSubjects: string[];
    hobbies: string[];
    dreams: string;
    picture: string;
}

// Mock data for children
const children = [
    {
        uuid: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
        name: 'Emma Johnson',
        schoolName: 'Sunshine Elementary',
        dateOfBirth: '2015-05-12',
        gender: 'Female',
        grade: '3rd',
        semester: 'Fall 2023',
        shoesSize: '5',
        shirtSize: 'M',
        fatherName: 'Michael Johnson',
        fatherJob: 'Engineer',
        motherName: 'Sarah Johnson',
        siblings: [
            { name: 'Jack Johnson', gender: "Male", dateOfBirth: '2013-02-18' },
            { name: 'Lily Johnson', gender: "Female", dateOfBirth: '2017-09-30' }
        ],
        favoriteSubjects: ['Math', 'Art'],
        hobbies: ['Drawing', 'Swimming'],
        dreams: 'Become an artist',
        picture: '/images/children/emma.jpg'
    },
    {
        uuid: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
        name: 'Noah Williams',
        schoolName: 'Oakridge School',
        dateOfBirth: '2014-08-23',
        gender: 'Male',
        grade: '4th',
        semester: 'Fall 2023',
        shoesSize: '6',
        shirtSize: 'L',
        fatherName: 'David Williams',
        fatherJob: 'Doctor',
        motherName: 'Emily Williams',
        siblings: [
            { name: 'Sophia Williams', gender: "Female", dateOfBirth: '2016-11-05' }
        ],
        favoriteSubjects: ['Science', 'Physical Education'],
        hobbies: ['Soccer', 'Reading'],
        dreams: 'Become a scientist',
        picture: '/images/children/noah.jpg'
    },
    {
        uuid: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
        name: 'Olivia Brown',
        schoolName: 'Sunshine Elementary',
        dateOfBirth: '2016-03-17',
        gender: 'Female',
        grade: '2nd',
        semester: 'Fall 2023',
        shoesSize: '4',
        shirtSize: 'S',
        fatherName: 'James Brown',
        fatherJob: 'Teacher',
        motherName: 'Jennifer Brown',
        siblings: [],
        favoriteSubjects: ['English', 'Music'],
        hobbies: ['Singing', 'Dancing'],
        dreams: 'Become a singer',
        picture: '/images/children/olivia.jpg'
    },
    {
        uuid: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
        name: 'Liam Davis',
        schoolName: 'Oakridge School',
        dateOfBirth: '2015-11-30',
        gender: 'Male',
        grade: '3rd',
        semester: 'Fall 2023',
        shoesSize: '5',
        shirtSize: 'M',
        fatherName: 'Robert Davis',
        fatherJob: 'Architect',
        motherName: 'Lisa Davis',
        siblings: [
            { name: 'Ethan Davis', gender: "Male", dateOfBirth: '2013-07-14' },
            { name: 'Ava Davis', gender: "Female", dateOfBirth: '2018-01-22' }
        ],
        favoriteSubjects: ['Math', 'Science'],
        hobbies: ['Building models', 'Chess'],
        dreams: 'Become an architect like dad',
        picture: '/images/children/liam.jpg'
    },
    {
        uuid: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
        name: 'Ava Miller',
        schoolName: 'Pinecrest Academy',
        dateOfBirth: '2014-04-05',
        gender: 'Female',
        grade: '4th',
        semester: 'Fall 2023',
        shoesSize: '6',
        shirtSize: 'M',
        fatherName: 'William Miller',
        fatherJob: 'Business Owner',
        motherName: 'Olivia Miller',
        siblings: [
            { name: 'Mason Miller', gender: "Male", dateOfBirth: '2012-09-18' }
        ],
        favoriteSubjects: ['History', 'Art'],
        hobbies: ['Painting', 'Gardening'],
        dreams: 'Own a flower shop',
        picture: '/images/children/ava.jpg'
    }
];

// Mock data for sponsors
const sponsors = [
    {
        uuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k',
        children: ['1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r', '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s', '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q']
    },
    {
        uuid: '3x4w5v6u-7t8s-9r0q-1p2o-3n4m5l6k7j8i',
        children: []
    }
];

// Mock data for schools
const schools = [
    {
        uuid: '1q2w3e4r-5t6y-7u8i-9o0p-1a2s3d4f5g6h',
        name: 'Sunshine Elementary',
        children: ['1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r']
    },
    {
        uuid: '2w3e4r5t-6y7u-8i9o-0p1a-2s3d4f5g6h7j',
        name: 'Oakridge School',
        children: ['2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s']
    },
    {
        uuid: '3e4r5t6y-7u8i-9o0p-1a2s-3d4f5g6h7j8k',
        name: 'Pinecrest Academy',
        children: ['5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t']
    }
];

const customDelay = 1000;
const baseUrl = import.meta.env.VITE_API_URL;

// Define handlers for children API
export const childrenHandlers = [
    // GET all children
    http.get(`${baseUrl}/v1/children`, async ({request}) => {
        // Validate bearer token
        const auth = validateBearerToken(request);
        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        // Return basic information for all children
        const basicChildrenInfo = children.map((child) => ({
            uuid: child.uuid,
            name: child.name,
            schoolName: child.schoolName,
            dateOfBirth: child.dateOfBirth,
            gender: child.gender,
            grade: child.grade
        }));

        return HttpResponse.json(basicChildrenInfo);
    }),

    // GET a specific child by UUID
    http.get(`${baseUrl}/v1/children/:uuid`, async ({request, params}) => {
        await delay(customDelay)

        // Validate bearer token
        const auth = validateBearerToken(request);
        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        const {uuid} = params;
        const child = children.find(child => child.uuid === uuid);

        if (!child) {
            return new HttpResponse(
                JSON.stringify({message: 'Child not found'}),
                {status: 404}
            );
        }

        return HttpResponse.json(child);
    }),

    // Filter children
    http.get(`${baseUrl}/v1/children/filter`, async ({request}) => {
        // Validate bearer token
        const auth = validateBearerToken(request);
        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        const url = new URL(request.url);
        const schoolName = url.searchParams.get('schoolName');
        const grade = url.searchParams.get('grade');
        const gender = url.searchParams.get('gender');

        let filteredChildren = [...children];

        if (schoolName) {
            filteredChildren = filteredChildren.filter(child =>
                child.schoolName.toLowerCase().includes(schoolName.toLowerCase())
            );
        }

        if (grade) {
            filteredChildren = filteredChildren.filter(child =>
                child.grade.toLowerCase() === grade.toLowerCase()
            );
        }

        if (gender) {
            filteredChildren = filteredChildren.filter(child =>
                child.gender.toLowerCase() === gender.toLowerCase()
            );
        }

        // Return basic information for filtered children
        const basicChildrenInfo = filteredChildren.map(child => ({
            uuid: child.uuid,
            name: child.name,
            schoolName: child.schoolName,
            dateOfBirth: child.dateOfBirth,
            gender: child.gender,
            grade: child.grade
        }));

        return HttpResponse.json(basicChildrenInfo);
    }),

    // GET children by sponsor UUID
    http.get(`${baseUrl}/v1/sponsor/:uuid/children`, async ({request, params}) => {
        await delay(customDelay);

        // Validate bearer token
        const auth = validateBearerToken(request);
        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
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

        const sponsoredChildren = children.filter(child =>
            sponsor.children.includes(child.uuid)
        );

        // Return basic information for sponsored children
        const basicChildrenInfo = sponsoredChildren.map(child => ({
            uuid: child.uuid,
            name: child.name,
            schoolName: child.schoolName,
            dateOfBirth: child.dateOfBirth,
            gender: child.gender,
            grade: child.grade
        }));

        return HttpResponse.json(basicChildrenInfo);
    }),

    // POST add a new child
    http.post(`${baseUrl}/v1/children`, async ({request}) => {
        // Validate bearer token
        const auth = validateBearerToken(request);
        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        const newChild = await request.json() as Child;

        if (!newChild) {
            return HttpResponse.json({
                message: 'Invalid request body'
            }, { status: 400 });
        }

        // Generate a UUID for the new child
        newChild.uuid = crypto.randomUUID();

        // Add the new child to the children array
        children.push(newChild);

        return HttpResponse.json({
            message: 'Child added successfully',
            uuid: newChild.uuid
        }, {status: 201});
    }),

    // PUT edit a child by UUID
    http.put(`${baseUrl}/v1/children/:uuid`, async ({request, params}) => {
        // Validate bearer token
        const auth = validateBearerToken(request);
        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        const {uuid} = params;
        const updatedChildData = await request.json() as Child;

        const childIndex = children.findIndex(child => child.uuid === uuid);

        if (childIndex === -1) {
            return new HttpResponse(
                JSON.stringify({message: 'Child not found'}),
                {status: 404}
            );
        }

        // Update the child data
        children[childIndex] = {
            ...children[childIndex],
            ...updatedChildData,
        };

        return HttpResponse.json({
            message: 'Child updated successfully',
            child: children[childIndex]
        });
    }),

    // DELETE a child by UUID
    http.delete(`${baseUrl}/v1/children/:uuid`, async ({request, params}) => {
        // Validate bearer token
        const auth = validateBearerToken(request);
        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        const {uuid} = params;
        const childIndex = children.findIndex(child => child.uuid === uuid);

        if (childIndex === -1) {
            return new HttpResponse(
                JSON.stringify({message: 'Child not found'}),
                {status: 404}
            );
        }

        // Remove the child from the array
        children.splice(childIndex, 1);

        return HttpResponse.json({
            message: 'Child deleted successfully'
        });
    }),

    // GET children by school UUID
    http.get(`${baseUrl}/v1/schools/:uuid/children`, async ({request, params}) => {
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

        const schoolChildren = children.filter(child =>
            school.children.includes(child.uuid)
        );

        // Return basic information for school children
        const basicChildrenInfo = schoolChildren.map(child => ({
            uuid: child.uuid,
            name: child.name,
            schoolName: child.schoolName,
            dateOfBirth: child.dateOfBirth,
            gender: child.gender,
            grade: child.grade
        }));

        return HttpResponse.json(basicChildrenInfo);
    }),
];

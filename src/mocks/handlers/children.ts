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

// REFACTORED: Child interface with status
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
    status: 'funded' | 'not_funded' | 'pending_approval'; // ADDED: status attribute
}

// REFACTORED: Mock data for children with status
const children: Child[] = [
    {
        uuid: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
        name: 'Emma Johnson',
        schoolName: 'Sunshine Elementary',
        dateOfBirth: '2015-05-12',
        gender: 'Female',
        grade: '3rd',
        semester: 'Odd',
        shoesSize: '5',
        shirtSize: 'M',
        fatherName: 'Michael Johnson',
        fatherJob: 'Engineer',
        motherName: 'Sarah Johnson',
        siblings: [ { name: 'Jack Johnson', gender: "Male", dateOfBirth: '2013-02-18' } ],
        favoriteSubjects: ['Math', 'Art'],
        hobbies: ['Drawing', 'Swimming'],
        dreams: 'Become an artist',
        picture: '/images/children/emma.jpg',
        status: 'funded',
    },
    {
        uuid: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
        name: 'Noah Williams',
        schoolName: 'Oakridge School',
        dateOfBirth: '2014-08-23',
        gender: 'Male',
        grade: '4th',
        semester: 'Odd',
        shoesSize: '6',
        shirtSize: 'L',
        fatherName: 'David Williams',
        fatherJob: 'Doctor',
        motherName: 'Emily Williams',
        siblings: [ { name: 'Sophia Williams', gender: "Female", dateOfBirth: '2016-11-05' } ],
        favoriteSubjects: ['Science', 'Physical Education'],
        hobbies: ['Soccer', 'Reading'],
        dreams: 'Become a scientist',
        picture: '/images/children/noah.jpg',
        status: 'funded',
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
        picture: '/images/children/olivia.jpg',
        status: 'pending_approval',
    },
    {
        uuid: '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s',
        name: 'Liam Davis',
        schoolName: 'Oakridge School',
        dateOfBirth: '2015-11-30',
        gender: 'Male',
        grade: '3rd',
        semester: 'Odd',
        shoesSize: '5',
        shirtSize: 'M',
        fatherName: 'Robert Davis',
        fatherJob: 'Architect',
        motherName: 'Lisa Davis',
        siblings: [],
        favoriteSubjects: ['Math', 'Science'],
        hobbies: ['Building models', 'Chess'],
        dreams: 'Become an architect like dad',
        picture: '/images/children/liam.jpg',
        status: 'funded',
    },
    {
        uuid: '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t',
        name: 'Ava Miller',
        schoolName: 'Pinecrest Academy',
        dateOfBirth: '2014-04-05',
        gender: 'Female',
        grade: '4th',
        semester: 'Odd',
        shoesSize: '6',
        shirtSize: 'M',
        fatherName: 'William Miller',
        fatherJob: 'Business Owner',
        motherName: 'Olivia Miller',
        siblings: [],
        favoriteSubjects: ['History', 'Art'],
        hobbies: ['Painting', 'Gardening'],
        dreams: 'Own a flower shop',
        picture: '/images/children/ava.jpg',
        status: 'not_funded',
    },
    {
        uuid: '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u',
        name: 'James Wilson',
        schoolName: 'Pinecrest Academy',
        dateOfBirth: '2017-01-10',
        gender: 'Male',
        grade: '1st',
        semester: 'Odd',
        shoesSize: '3',
        shirtSize: 'S',
        fatherName: 'Chris Wilson',
        fatherJob: 'Mechanic',
        motherName: 'Linda Wilson',
        siblings: [],
        favoriteSubjects: ['Story time'],
        hobbies: ['Playing with cars'],
        dreams: 'Become a race car driver',
        picture: '/images/children/james.jpg',
        status: 'not_funded',
    }
];

// Mock data for sponsors
const sponsors = [
    {
        uuid: '1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k',
        children: ['1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r', '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q']
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
        children: ['5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t', '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u']
    }
];

const customDelay = 1000;
const baseUrl = import.meta.env.VITE_API_URL;

// Define handlers for children API
export const childrenHandlers = [
    // REFACTORED: GET all children to now return status
    http.get(`${baseUrl}/v1/children`, async ({request}) => {
        const auth = validateBearerToken(request);
        if (!auth) return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});

        const basicChildrenInfo = children.map((child) => ({
            uuid: child.uuid,
            name: child.name,
            schoolName: child.schoolName,
            dateOfBirth: child.dateOfBirth,
            gender: child.gender,
            grade: child.grade,
            status: child.status, // ADDED
        }));
        return HttpResponse.json(basicChildrenInfo);
    }),

    // GET a specific child by UUID (no changes needed, returns full object)
    http.get(`${baseUrl}/v1/children/:uuid`, async ({request, params}) => {
        const auth = validateBearerToken(request);
        if (!auth) return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});

        const {uuid} = params;
        const child = children.find(child => child.uuid === uuid);
        if (!child) return new HttpResponse(JSON.stringify({message: 'Child not found'}), {status: 404});

        return HttpResponse.json(child);
    }),

    // REFACTORED: Filter children now returns status
    http.get(`${baseUrl}/v1/children/filter`, async ({request}) => {
        const auth = validateBearerToken(request);
        if (!auth) return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});

        const url = new URL(request.url);
        const schoolName = url.searchParams.get('schoolName');
        const grade = url.searchParams.get('grade');
        const gender = url.searchParams.get('gender');
        let filteredChildren = [...children];

        if (schoolName) filteredChildren = filteredChildren.filter(child => child.schoolName.toLowerCase().includes(schoolName.toLowerCase()));
        if (grade) filteredChildren = filteredChildren.filter(child => child.grade.toLowerCase() === grade.toLowerCase());
        if (gender) filteredChildren = filteredChildren.filter(child => child.gender.toLowerCase() === gender.toLowerCase());

        const basicChildrenInfo = filteredChildren.map(child => ({
            uuid: child.uuid,
            name: child.name,
            schoolName: child.schoolName,
            dateOfBirth: child.dateOfBirth,
            gender: child.gender,
            grade: child.grade,
            status: child.status, // ADDED
        }));
        return HttpResponse.json(basicChildrenInfo);
    }),

    // REFACTORED: GET children by sponsor UUID now returns status
    http.get(`${baseUrl}/v1/sponsor/:uuid/children`, async ({request, params}) => {
        await delay(customDelay);
        const auth = validateBearerToken(request);
        if (!auth) return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});

        const {uuid} = params;
        const sponsor = sponsors.find(sponsor => sponsor.uuid === uuid);
        if (!sponsor) return new HttpResponse(JSON.stringify({message: 'Sponsor not found'}), {status: 404});

        const sponsoredChildren = children.filter(child => sponsor.children.includes(child.uuid));
        const basicChildrenInfo = sponsoredChildren.map(child => ({
            uuid: child.uuid,
            name: child.name,
            schoolName: child.schoolName,
            dateOfBirth: child.dateOfBirth,
            gender: child.gender,
            grade: child.grade,
            status: child.status, // ADDED
        }));
        return HttpResponse.json(basicChildrenInfo);
    }),

    // REFACTORED: POST add a new child defaults status to "not_funded"
    http.post(`${baseUrl}/v1/children`, async ({request}) => {
        const auth = validateBearerToken(request);
        if (!auth) return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});

        const newChildData = await request.json() as Omit<Child, 'uuid' | 'status'>;
        if (!newChildData) return HttpResponse.json({message: 'Invalid request body'}, { status: 400 });

        const newChild: Child = {
            ...newChildData,
            uuid: crypto.randomUUID(),
            status: 'not_funded', // Default status for new children
        };
        children.push(newChild);

        return HttpResponse.json({message: 'Child added successfully', uuid: newChild.uuid}, {status: 201});
    }),

    // PUT edit a child by UUID (no changes needed, status can be passed in body)
    http.put(`${baseUrl}/v1/children/:uuid`, async ({request, params}) => {
        const auth = validateBearerToken(request);
        if (!auth) return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});

        const {uuid} = params;
        const updatedChildData = await request.json() as Partial<Child>;
        const childIndex = children.findIndex(child => child.uuid === uuid);
        if (childIndex === -1) return new HttpResponse(JSON.stringify({message: 'Child not found'}), {status: 404});

        children[childIndex] = { ...children[childIndex], ...updatedChildData };
        return HttpResponse.json({message: 'Child updated successfully', child: children[childIndex]});
    }),

    // DELETE a child by UUID (no changes needed)
    http.delete(`${baseUrl}/v1/children/:uuid`, async ({request, params}) => {
        const auth = validateBearerToken(request);
        if (!auth) return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});

        const {uuid} = params;
        const childIndex = children.findIndex(child => child.uuid === uuid);
        if (childIndex === -1) return new HttpResponse(JSON.stringify({message: 'Child not found'}), {status: 404});

        children.splice(childIndex, 1);
        return HttpResponse.json({message: 'Child deleted successfully'});
    }),

    // REFACTORED: GET children by school UUID now returns status
    http.get(`${baseUrl}/v1/schools/:uuid/children`, async ({request, params}) => {
        const auth = validateBearerToken(request);
        if (!auth) return new HttpResponse(JSON.stringify({message: 'Unauthorized'}), {status: 401});

        const {uuid} = params;
        const school = schools.find(school => school.uuid === uuid);
        if (!school) return new HttpResponse(JSON.stringify({message: 'School not found'}), {status: 404});

        const schoolChildren = children.filter(child => school.children.includes(child.uuid));
        const basicChildrenInfo = schoolChildren.map(child => ({
            uuid: child.uuid,
            name: child.name,
            schoolName: child.schoolName,
            dateOfBirth: child.dateOfBirth,
            gender: child.gender,
            grade: child.grade,
            status: child.status, // ADDED
        }));
        return HttpResponse.json(basicChildrenInfo);
    }),
];

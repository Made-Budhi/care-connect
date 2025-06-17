import {delay, http, HttpResponse} from 'msw';
import useAuth from "@/hooks/useAuth.tsx";

// Interface for the User entity
interface User {
    uuid: string;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'school' | 'sponsor' | 'stuart';
    isVerified: boolean;
}

// Mock data for users
let users = [
    // Sponsor
    {
        uuid: "1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l6k",
        email: 'sponsor@sponsor.com',
        password: 'sponsor123',
        name: 'Jonathan Johnson',
        role: 'sponsor',
        isVerified: true
    },
    {
        uuid: "3x4w5v6u-7t8s-9r0q-1p2o-3n4m5l6k7j8i",
        email: 'sponsor2@sponsor.com',
        password: 'sponsor123',
        name: 'Grace Abigail',
        role: 'sponsor',
        isVerified: true
    },
    // Admin
    {
        uuid: "1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5l9i",
        email: "admin@admin.com",
        password: 'admin123',
        name: 'Christoper Johnson',
        role: 'admin',
        isVerified: true
    },
    // School
    {
        uuid: "1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5a5g",
        email: "school@school.com",
        password: 'school123',
        name: 'Christoper Johnson',
        role: 'school',
        isVerified: true
    },
    // Stuart
    {
        uuid: "1z2y3x4w-5v6u-7t8s-9r0q-1p2o3n4m5u7d",
        email: "stuart@stuart.com",
        password: 'stuart123',
        name: 'Stuart Johnson',
        role: 'stuart',
        isVerified: true
    }
];

// Store for verification tokens
const verificationTokens = new Map();
const passwordResetTokens = new Map();
// Store for active authentication tokens
const activeTokens = new Map();
// Custom delay for authentication endpoints
const customDelay = 1000;

// Helper to generate a 6-digit verification token
const generateVerificationToken = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper to generate a JWT-like token
const generateJwtToken = (userId: string) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
        sub: userId,
        iat: Date.now(),
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    }));
    const signature = btoa(`secret-${userId}-${Date.now()}`);

    return `${header}.${payload}.${signature}`;
};

// Helper to validate bearer token
// (This would typically be in a shared authentication utility file)
const validateBearerToken = (request: Request): { userId: string | number, token:string } | null => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    return { userId: 'mock-school-admin-1', token };
};

// Base Url from .env
const baseUrl = import.meta.env.VITE_API_URL;

type loginRequest = {
    email: string;
    password: string;
}

type registerRequest = {
    email: string;
    password: string;
    name: string;
}

type verifyEmailRequest = {
    email: string;
    token: string;
}

type forgotPasswordRequest = {
    email: string;
}

type resetPasswordRequest = {
    email: string;
    token: string;
    newPassword: string;
}

// Define handlers for authentications API
export const authHandlers = [
    // Login endpoint - public endpoint, no authentication required
    http.post<
        never,
        loginRequest
    >(`${baseUrl}/auth/v1/login`, async ({request}) => {
        // Simulate a delay
        await delay(customDelay);

        const {email, password} = await request.json();

        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return new HttpResponse(
                JSON.stringify({message: 'Invalid credentials'}),
                {status: 401}
            );
        }

        // Generate JWT token
        const token = generateJwtToken(user.uuid);

        // Store token in activeTokens
        activeTokens.set(user.uuid, token);

        return HttpResponse.json({
            status: 200,
            uuid: user.uuid,
            email: user.email,
            name: user.name,
            role: user.role,
            accessToken: token
        });
    }),

    // Register endpoint - public endpoint, no authentication required
    http.post<
        never,
        registerRequest
    >(`${baseUrl}/auth/v1/register`, async ({request}) => {
        const {email, password, name} = await request.json();

        // Check if a user already exists
        if (users.some(u => u.email === email)) {
            return new HttpResponse(
                JSON.stringify({message: 'User already exists'}),
                {status: 409}
            );
        }

        // Create a new user
        const newUser = {
            uuid: crypto.randomUUID(),
            email,
            password,
            name,
            role: 'sponsor',
            isVerified: false
        };

        users.push(newUser);

        // Generate verification token
        const token = generateVerificationToken();
        verificationTokens.set(email, token);

        console.log(`Verification token for ${email}: ${token}`);

        return HttpResponse.json({
            message: 'User registered successfully. Please verify your email.',
            userId: newUser.uuid
        });
    }),

    // Verify email endpoint
    http.post<
        never,
        verifyEmailRequest
    >(`${baseUrl}/auth/v1/verify-email`, async ({request}) => {
        // Validate bearer token
        const auth = validateBearerToken(request);

        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        const {email, token} = await request.json();

        // Check if the token is valid
        if (verificationTokens.get(email) !== token) {
            return new HttpResponse(
                JSON.stringify({message: 'Invalid or expired token'}),
                {status: 400}
            );
        }

        // Find and update user
        const user = users.find(u => u.email === email);
        if (user) {
            // Ensure the authenticated user is the same as the one being verified
            if (user.uuid !== auth.userId) {
                return new HttpResponse(
                    JSON.stringify({message: 'Forbidden'}),
                    {status: 403}
                );
            }

            user.isVerified = true;
            verificationTokens.delete(email);

            return HttpResponse.json({
                message: 'Email verified successfully'
            });
        }

        return new HttpResponse(
            JSON.stringify({message: 'User not found'}),
            {status: 404}
        );
    }),

    // Forgot password endpoint - public endpoint, no authentication required
    http.post<
        never,
        forgotPasswordRequest
    >(`${baseUrl}/auth/v1/forgot-password`, async ({request}) => {
        const {email} = await request.json();

        const user = users.find(u => u.email === email);

        if (!user) {
            // For security reasons, don't reveal if the email exists or not
            return HttpResponse.json({
                message: 'If your email is registered, you will receive a password reset token'
            });
        }

        // Generate password reset token
        const token = generateVerificationToken();
        passwordResetTokens.set(email, token);

        console.log(`Password reset token for ${email}: ${token}`);

        return HttpResponse.json({
            message: 'If your email is registered, you will receive a password reset token'
        });
    }),

    // Reset password endpoint
    http.post<
        never,
        resetPasswordRequest
    >(`${baseUrl}/auth/v1/reset-password`, async ({request}) => {
        // Validate bearer token
        const auth = validateBearerToken(request);

        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        const {email, token, newPassword} = await request.json();

        // Check if the token is valid
        if (passwordResetTokens.get(email) !== token) {
            return new HttpResponse(
                JSON.stringify({message: 'Invalid or expired token'}),
                {status: 400}
            );
        }

        // Find and update user
        const user = users.find(u => u.email === email);
        if (user) {
            // Ensure the authenticated user is the same as the one being updated
            if (user.uuid !== auth.userId) {
                return new HttpResponse(
                    JSON.stringify({message: 'Forbidden'}),
                    {status: 403}
                );
            }

            user.password = newPassword;
            passwordResetTokens.delete(email);

            // Generate a new token after password reset
            const newToken = generateJwtToken(user.uuid);
            activeTokens.set(user.uuid.toString(), newToken);

            return HttpResponse.json({
                message: 'Password reset successfully',
                token: newToken
            });
        }

        return new HttpResponse(
            JSON.stringify({message: 'User not found'}),
            {status: 404}
        );
    }),

    // Logout endpoint
    http.post<
        never,
        never
    >(`${baseUrl}/auth/v1/logout`, async ({request}) => {
        // Extract token from the Authorization header
        const auth = validateBearerToken(request);

        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        // Remove token from activeTokens
        activeTokens.delete(auth.userId.toString());

        return HttpResponse.json({
            message: 'Logged out successfully'
        });
    }),

    // Refresh token endpoint (at /auth/v1/refresh-token path)
    http.get<
        never,
        never
    >(`${baseUrl}/auth/v1/refresh-token`, async ({request}) => {
        // Simulate a delay
        await delay(customDelay + 5000);

        // Extract token from the Authorization header
        const auth = validateBearerToken(request);

        if (!auth) {
            return new HttpResponse(
                JSON.stringify({message: 'Unauthorized'}),
                {status: 401}
            );
        }

        // Find the user
        const user = users.find(u => u.uuid === auth.userId);

        if (!user) {
            return new HttpResponse(
                JSON.stringify({message: 'User not found'}),
                {status: 404}
            );
        }

        // Generate a new token
        const newToken = generateJwtToken(user.uuid);

        // Update the token in activeTokens
        activeTokens.set(user.uuid.toString(), newToken);

        return HttpResponse.json({
            status: 200,
            uuid: user.uuid,
            email: user.email,
            name: user.name,
            role: user.role,
            accessToken: newToken
        });
    }),

    /**
     * GET /v1/users
     * Get users, with an option to filter by role.
     */
    http.get(`${baseUrl}/v1/users`, async ({ request }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const url = new URL(request.url);
        const role = url.searchParams.get('role');

        let user;

        if (role) {
            user = users.filter(user => user.role === role);
        }

        return HttpResponse.json(user);
    }),

    /**
     * POST /v1/users
     * Add a new user. For this example, we'll assume it's for creating Stuarts.
     */
    http.post(`${baseUrl}/v1/users`, async ({ request }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const newUserData = await request.json() as Omit<User, 'uuid' | 'role'> & { password?: string };

        // Basic validation
        if (!newUserData.name || !newUserData.email || !newUserData.password) {
            return HttpResponse.json({ message: 'Name, email, and password are required.' }, { status: 400 });
        }

        // Check if email already exists
        if (users.some(user => user.email === newUserData.email)) {
            return HttpResponse.json({ message: 'An account with this email already exists.' }, { status: 409 }); // 409 Conflict
        }

        const newUser: User = {
            uuid: `user-stuart-${crypto.randomUUID().slice(0, 8)}`,
            name: newUserData.name,
            email: newUserData.email,
            role: 'stuart', // Hardcoding the role for this specific use case
            isVerified: false,
            password: newUserData.password,
        };

        users.push(newUser);
        return HttpResponse.json({ message: 'Stuart user created successfully', user: newUser }, { status: 201 });
    }),

    /**
     * DELETE /v1/users/:uuid
     * Delete a user by their UUID.
     */
    http.delete(`${baseUrl}/v1/users/:uuid`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { uuid } = params;
        const initialLength = users.length;
        users = users.filter(user => user.uuid !== uuid);

        if (users.length < initialLength) {
            return new Response(null, { status: 204 }); // Success, No Content
        } else {
            return new HttpResponse(JSON.stringify({ message: 'User not found' }), { status: 404 });
        }
    }),

    /**
     * GET /v1/users/me
     * Fetches the profile of the currently authenticated user.
     */
    http.get(`${baseUrl}/v1/users/me`, async ({ request }) => {
        const {auth} = useAuth();
        const uuid = auth.uuid;
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const userProfile = users.find(user => user.uuid === uuid);
        if (!userProfile) return new HttpResponse(JSON.stringify({ message: 'User profile not found' }), { status: 404 });

        return HttpResponse.json(userProfile);
    }),

    /**
     * PUT /v1/users/:uuid
     * Updates a user's profile information.
     */
    http.put(`${baseUrl}/v1/users/:uuid`, async ({ request, params }) => {
        const authResult = validateBearerToken(request);
        if (!authResult) return new HttpResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });

        const { uuid } = params;
        // Security check: In a real app, you'd verify if the logged-in user is allowed to edit this profile.
        // For this mock, we'll allow it if the UUID matches the token's user ID.
        if (authResult.userId !== uuid) {
            return new HttpResponse(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
        }

        const updatedData = await request.json() as Partial<Omit<User, 'uuid' | 'role'>>;
        const userIndex = users.findIndex(user => user.uuid === uuid);

        if (userIndex === -1) return new HttpResponse(JSON.stringify({ message: 'User not found' }), { status: 404 });

        users[userIndex] = { ...users[userIndex], ...updatedData };
        return HttpResponse.json(users[userIndex]);
    }),
];

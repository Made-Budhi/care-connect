import {delay, http, HttpResponse} from 'msw';

// Mock data for users
const users = [
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

// Helper to extract and validate bearer token
const validateBearerToken = (request: Request) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];

    // Check if a token exists in activeTokens
    for (const [userId, userToken] of activeTokens.entries()) {
        if (userToken === token) {
            return { userId: userId, token };
        }
    }

    return null;
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
];

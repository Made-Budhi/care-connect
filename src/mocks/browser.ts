import {setupWorker} from 'msw/browser';
import {childrenHandlers} from './handlers/children';
import {authHandlers} from './handlers/authentication';
import {fundingSubmissionHandlers} from "@/mocks/handlers/funding.ts";

// Combine all handlers
const allHandlers = [
    ...childrenHandlers,
    ...authHandlers,
    ...fundingSubmissionHandlers,
    // Add other handlers here as needed
];

// Create and export the service worker
export const worker = setupWorker(...allHandlers);

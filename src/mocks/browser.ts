import {setupWorker} from 'msw/browser';
import {childrenHandlers} from './handlers/children';
import {authHandlers} from './handlers/authentication';
import {fundingAndPaymentHandlers} from "@/mocks/handlers/funding.ts";
import {achievementHandlers} from "@/mocks/handlers/achievement.ts";
import {reportCardHandlers} from "@/mocks/handlers/report-card.ts";
import {eventAndSubmissionHandlers} from "@/mocks/handlers/event.ts";
import {schoolHandlers} from "@/mocks/handlers/school.ts";
import {newsHandlers} from "@/mocks/handlers/news.ts";

// Combine all handlers
const allHandlers = [
    ...childrenHandlers,
    ...authHandlers,
    ...fundingAndPaymentHandlers,
    ...achievementHandlers,
    ...reportCardHandlers,
    ...eventAndSubmissionHandlers,
    ...schoolHandlers,
    ...newsHandlers,
    // Add other handlers
];

// Create and export the service worker
export const worker = setupWorker(...allHandlers);

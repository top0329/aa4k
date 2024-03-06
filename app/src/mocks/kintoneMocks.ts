// src/mocks/kintoneMocks.ts

import {
  ConversationHistoryListResponseBody,
  KintoneProxyResponse,
  PreCheckResponseBody,
} from "~/types/apiResponse";

// This will extend the global object with kintone mocks
declare global {
  interface Window {
    kintone: any;
  }
}

// Define the kintone mocks
const kintoneMocks = {
  app: {
    getId: () => "mockAppId",
    // ... other app related mocks
  },
  getLoginUser: () => ({
    id: "mockUserId",
    isGuest: true,
  }),
  plugin: {
    app: {
      proxy: async (_pluguinId: string, url: string) => {
        console.log({ url });
        // Mock your response based on the request URL, method, headers, and body
        if (url.includes("/pre_check")) {
          const mockPreCheckResponse: PreCheckResponseBody = {
            message: "Success",
            errorCode: "A01001", // Replace "" with a valid error code value
            contractStatus: "active", // Use an appropriate value from ContractStatus enum
            systemSettings: {
              historyUseCount: 0,
            },
          };
          return [
            JSON.stringify(mockPreCheckResponse), // First element is the response body as a string
            200, // Second element is the response status code
            {}, // Third element is an empty object for the response headers
          ];
        }
        if (url.includes("/conversation_history/list")) {
          const mockConversationHistoryList: ConversationHistoryListResponseBody =
            {
              message: "Success",
              errorCode: "A01001",
              desktopConversationHistoryList: [
                {
                  id: "1",
                  user_message: "How can I reset my password?",
                  ai_message:
                    "You can reset your password by clicking the 'Forgot Password' link on the login page.",
                  ai_message_comment: "Standard procedure for password reset.",
                  error_message: "",
                  user_rating: "good",
                },
                // Add more mock records as needed
              ],
              mobileConversationHistoryList: [
                // Optionally, you can mock different data for mobile, or replicate desktop
              ],
            };

          const resConversationHistory: KintoneProxyResponse = [
            JSON.stringify(mockConversationHistoryList), // Response body as a string
            200, // HTTP status code
            {}, // Response headers (can be mocked as needed)
          ];

          return resConversationHistory;
        }
        // ...other conditions for different endpoints
        // If the endpoint isn't mocked, you could return a generic error or handle it in another way
        return [
          JSON.stringify({ errorCode: "NOT_MOCKED" }),
          500,
          // Mock response headers
        ];
        // You can add more conditions to mock different endpoints with different responses
      },
    },
  },
  api: Object.assign(
    async (url: string) => {
      if (url.includes("/k/v1/preview/app/customize.json")) {
        const mockAppCustomize = {
          scope: "ALL",
          desktop: {
            js: [
              {
                type: "URL",
                url: "https://example.com/customize.js",
              },
            ],
            css: [],
          },
          mobile: {
            js: [
              {
                type: "URL",
                url: "https://example.com/mobile_customize.js",
              },
            ],
            css: [],
          },
          revision: "12345",
        };
        return mockAppCustomize;
      }
    },
    {
      url: (path: string) => `https://example.kintone.com${path}`,
    },
  ),
};

// Set the kintone mocks on the global window object
window.kintone = kintoneMocks;

// This file is a module and should export something.
// You can export the mocks if you want to use them explicitly in tests or elsewhere.
export { kintoneMocks };

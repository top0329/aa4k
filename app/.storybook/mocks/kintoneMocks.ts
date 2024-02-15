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
    // ... other user related mocks
  }),
  proxy: async (url, method, headers, body) => {
    // Mock your response based on the request URL, method, headers, and body
    if (url.includes("/pre_check")) {
      return [
        JSON.stringify({
          // Your mock response body here
        }),
        200, // Mock response status code
        // Mock response headers
      ];
    }
    if (url.includes("/conversation_history/list")) {
      // Return a mock response array for the conversation history list endpoint
      return [
        JSON.stringify({
          // Your mock conversation history list response body here
          conversationHistoryList: [
            // Mock conversation history data
          ],
          // ...other response body fields
        }),
        200, // Mock response status code, assuming success
        // Mock response headers
      ];
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
  // ... other kintone functions you want to mock
};

// Set the kintone mocks on the global window object
window.kintone = kintoneMocks;

// This file is a module and should export something.
// You can export the mocks if you want to use them explicitly in tests or elsewhere.
export { kintoneMocks };

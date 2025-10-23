// Get the DynamoDB table name from environment variables
export const getAllItemsHandler = async (event) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "getAllItems working!" }),
  };
};


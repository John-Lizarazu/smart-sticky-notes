// Get the DynamoDB table name from environment variables
// Lists all notes
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

export const getAllItemsHandler = async () => {
  try {
    const res = await ddb.send(new ScanCommand({ TableName: TABLE_NAME }));
    return { statusCode: 200, headers: cors, body: JSON.stringify(res.Items ?? []) };
  } catch (err) {
    console.error("GET /notes error:", err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ message: "Server error" }) };
  }
};


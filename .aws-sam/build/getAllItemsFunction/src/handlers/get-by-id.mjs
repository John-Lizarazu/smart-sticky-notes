// Create clients and set shared const values outside of the handler.
// Fetch a single note by id
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
};

export const getByIdHandler = async (event) => {
  try {
    const id = event?.pathParameters?.id;
    if (!id) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ message: "Missing id" }) };
    }

    const res = await ddb.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));
    if (!res.Item) {
      return { statusCode: 404, headers: cors, body: JSON.stringify({ message: "Not found" }) };
    }
    return { statusCode: 200, headers: cors, body: JSON.stringify(res.Item) };
  } catch (err) {
    console.error(`GET /notes/${event?.pathParameters?.id} error:`, err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ message: "Server error" }) };
  }
};


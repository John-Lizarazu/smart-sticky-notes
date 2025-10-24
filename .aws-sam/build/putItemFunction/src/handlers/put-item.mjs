// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
// Create a new note (expects JSON body with at least { id, text })
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

export const putItemHandler = async (event) => {
  try {
    if (event?.httpMethod === "OPTIONS") {
      return { statusCode: 200, headers: cors, body: "" };
    }

    if (!event?.body) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ message: "Missing body" }) };
    }

    const note = JSON.parse(event.body);

    // minimal validation
    if (!note.id || !note.text) {
      return {
        statusCode: 400,
        headers: cors,
        body: JSON.stringify({ message: "Required fields: id, text" }),
      };
    }

    // add server-side timestamps if not provided
    note.created_at = note.created_at || new Date().toISOString();

    await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: note }));
    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("POST /notes error:", err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ message: "Server error" }) };
  }
};


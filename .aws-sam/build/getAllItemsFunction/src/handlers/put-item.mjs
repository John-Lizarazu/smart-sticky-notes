// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
// Create a new note (expects JSON body with at least { id, text })
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { Client as OSClient } from "@opensearch-project/opensearch";
import { AwsSigv4Signer } from "@opensearch-project/opensearch/aws";
import { defaultProvider } from "@aws-sdk/credential-provider-node";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME;

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

// AOSS
const OPENSEARCH_ENDPOINT = process.env.OPENSEARCH_ENDPOINT;
const OPENSEARCH_INDEX = process.env.OPENSEARCH_INDEX || "notes";

const os = new OSClient({
  ...AwsSigv4Signer({
    region: "us-east-1",
    service: "aoss",
    getCredentials: defaultProvider()
  }),
  node: OPENSEARCH_ENDPOINT
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST,OPTIONS"
};

async function ensureIndex() {
  const exists = await os.indices.exists({ index: OPENSEARCH_INDEX });
  if (!exists.body) {
    await os.indices.create({
      index: OPENSEARCH_INDEX,
      body: {
        settings: { index: { knn: true } },
        mappings: {
          properties: {
            text: { type: "text" },
            user_id: { type: "keyword" },
            vector: {
              type: "knn_vector",
              dimension: 1536,
              method: { name: "hnsw", space_type: "cosinesimil", engine: "nmslib", parameters: { ef_construction: 128, m: 16 } }
            }
          }
        }
      }
    });
  }
}

async function embedText(text) {
  const cmd = new InvokeModelCommand({
    modelId: "amazon.titan-embed-text-v1",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({ inputText: text })
  });
  const res = await bedrock.send(cmd);
  const body = JSON.parse(new TextDecoder().decode(res.body));
  return body.embedding; // float[] length 1536
}

export const putItemHandler = async (event) => {
  try {
    if (event?.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "" };
    if (!event?.body) return { statusCode: 400, headers: cors, body: JSON.stringify({ message: "Missing body" }) };

    const note = JSON.parse(event.body);
    if (!note.id || !note.text) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ message: "Required fields: id, text" }) };
    }
    note.created_at = note.created_at || new Date().toISOString();

    // 1) store in DynamoDB
    await ddb.send(new PutCommand({ TableName: TABLE_NAME, Item: note }));

    // 2) ensure index exists (one-time)
    await ensureIndex();

    // 3) embed and index into AOSS
    const vector = await embedText(note.text);
    await os.index({
      index: OPENSEARCH_INDEX,
      id: note.id,
      body: { text: note.text, user_id: note.user || "demo", vector }
    });
    await os.indices.refresh({ index: OPENSEARCH_INDEX });

    return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error("POST /notes error:", err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ message: "Server error" }) };
  }
};


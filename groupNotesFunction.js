import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "OPTIONS,POST"
};

export const handler = async (event) => {
  console.log("Incoming event:", event);

  // Handle preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const notes = body.notes || [];

    if (!Array.isArray(notes) || notes.length === 0) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ message: "No notes provided" }) };
    }

    // Ask Bedrock Nova reasoning model to group similar notes
    const prompt = `
      You are an AI assistant that groups similar notes together by theme or intent.
      Given these notes:
      ${notes.map((n, i) => `${i + 1}. ${n.text}`).join("\n")}
      Return a JSON object with categories and which notes belong to each category.
      Example:
      {
        "categories": [
          { "topic": "Travel", "notes": ["Book flights to Madrid", "Pack clothes"] },
          { "topic": "Personal", "notes": ["Call mom"] }
        ]
      }
    `;

    const cmd = new InvokeModelCommand({
      modelId: "anthropic.claude-3-5-sonnet-20240620-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({ inputText: prompt })
    });

    const res = await bedrock.send(cmd);
    const modelResponse = JSON.parse(new TextDecoder().decode(res.body));

    // Try to parse JSON output from model
    let output;
    try {
      output = JSON.parse(modelResponse.outputText);
    } catch {
      output = { raw: modelResponse.outputText };
    }

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({ grouped: output })
    };
  } catch (err) {
    console.error("POST /notes/group error:", err);
    return { statusCode: 500, headers: cors, body: JSON.stringify({ message: "Server error" }) };
  }
};

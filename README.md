
---

```markdown
# 🩵 Smart Sticky Notes

A modern, AI-powered **collaborative note-taking application** built on AWS.  
Smart Sticky Notes allows users to create, group, and retrieve notes intelligently using **Bedrock**, **OpenSearch**, **DynamoDB**, and **Lambda**.  
It’s fully serverless and scalable — deployed with **AWS SAM** and **Amplify** for the web interface.

---

## 🚀 Overview

Smart Sticky Notes helps users organize information dynamically by applying semantic embeddings and reasoning to cluster related notes.  
It supports **AI-powered grouping**, **daily digests**, and **scheduled nudges** to remind users of important items.

This project was built as part of an AWS Hackathon challenge to showcase cloud-native, AI-driven productivity tools.

---

## 🧱 System Architecture

```

Frontend (Amplify + HTML/CSS/JS)
|
↓
Amazon API Gateway
|
↓
AWS Lambda (Serverless Functions)
|
↓
Amazon DynamoDB  ←→  Amazon OpenSearch Serverless
|
↓
Amazon Bedrock (Nova Reasoning + Titan Embeddings)
|
↓
Amazon EventBridge Scheduler  →  SNS Notifications (Nudges)

```

---

## 🗂️ Project Structure

```

smart-sticky-notes/
│
├── frontend/
│   ├── index.html           # Main UI
│   ├── script.js            # API calls & interactivity
│   ├── style.css            # Styling
│
├── smart-notes-api/
│   ├── src/
│   │   └── handlers/
│   │       ├── get-all-items.mjs     # GET /notes
│   │       ├── get-by-id.mjs         # GET /notes/{id}
│   │       └── put-item.mjs          # POST /notes
│   ├── package.json                  # Dependencies
│   ├── template.yaml                 # AWS SAM template
│   ├── samconfig.toml                # Deployment config
│   └── README.md                     # Documentation
│
└── .gitignore

````

---

## 💡 Features

- 📝 Create, read, and manage personal or shared notes.
- 🧠 AI grouping using **Amazon Bedrock embeddings** (Titan + Nova).
- 🔍 Semantic search via **OpenSearch Serverless**.
- 🔔 Scheduled reminders using **EventBridge Scheduler**.
- ☀️ Automatic daily digests of notes.
- ⚡ Fully serverless architecture.
- 🌐 Web frontend hosted via **AWS Amplify**.

---

## 🛠️ Technologies Used

| Category | Service |
|-----------|----------|
| **Compute** | AWS Lambda |
| **API Layer** | Amazon API Gateway |
| **Database** | Amazon DynamoDB |
| **AI / ML** | Amazon Bedrock (Titan Embeddings, Nova Reasoning) |
| **Search** | Amazon OpenSearch Serverless |
| **Scheduling** | Amazon EventBridge |
| **Notifications** | Amazon SNS |
| **Frontend Hosting** | AWS Amplify |
| **Infrastructure as Code** | AWS SAM CLI |

---

## ⚙️ Setup and Deployment

### Step 1. Clone the Repository
```bash
git clone https://github.com/John-Lizarazu/smart-sticky-notes.git
cd smart-sticky-notes/smart-notes-api
````

### Step 2. Build and Deploy Backend

```bash
sam build
sam deploy --guided
```

> Choose your region (e.g., `us-east-1`)
> Allow SAM to create new IAM roles
> Save the configuration for next deploys

You’ll get an output like this:

```
Outputs
--------------------------------------------------------
Key                 WebEndpoint
Description         API Gateway endpoint URL for Prod stage
Value               https://abc123xyz.execute-api.us-east-1.amazonaws.com/Prod/
```

---

## 🧾 API Endpoints

| Method   | Path          | Description                    |
| -------- | ------------- | ------------------------------ |
| **GET**  | `/notes`      | Retrieve all notes             |
| **GET**  | `/notes/{id}` | Retrieve a specific note by ID |
| **POST** | `/notes`      | Add or update a note           |

---

### 🧪 Example CURL Tests

```bash
# Add a note
curl -X POST -H "Content-Type: application/json" \
  -d '{"id":"n1","text":"Buy groceries","user":"demo"}' \
  https://abc123xyz.execute-api.us-east-1.amazonaws.com/Prod/notes

# Get all notes
curl https://abc123xyz.execute-api.us-east-1.amazonaws.com/Prod/notes
```

---

## 🌤️ EventBridge Scheduler Setup

1. Go to **Amazon EventBridge → Scheduler → Create schedule**
2. Type: **One-time or recurring**
3. Target: **Lambda function** (`setNudgeLambda`)
4. For testing: Schedule 1 minute later → You should get an email or SNS ping.

---

## 🧠 OpenSearch + Bedrock Integration

Make sure your Lambda functions have:

* Access to **Amazon Bedrock** and **OpenSearch** via IAM role.
* Region consistency (keep everything in `us-east-1`).

Set environment variables in `template.yaml`:

```yaml
OPENSEARCH_ENDPOINT: "https://your-aoss-endpoint.us-east-1.aoss.amazonaws.com"
BEDROCK_MODEL_ID: "amazon.titan-embed-text-v1"
BEDROCK_REASONING_MODEL: "amazon.nova-pro"
```

---

## 🌐 Frontend (Amplify Deployment)

### Folder: `frontend/`

```
frontend/
├── index.html
├── style.css
└── script.js
```

### Deploy via Amplify Console

1. Connect the GitHub repository.
2. Set **root directory** to `/frontend`.
3. Click **Save and Deploy**.

Your Amplify app URL will look like:

```
https://main.d1abcd2efghi3.amplifyapp.com/
```

---

## 💾 Environment Variables

| Key                       | Description                                 |
| ------------------------- | ------------------------------------------- |
| `TABLE_NAME`              | DynamoDB table name                         |
| `OPENSEARCH_ENDPOINT`     | OpenSearch Serverless endpoint              |
| `OPENSEARCH_INDEX`        | OpenSearch index name (e.g., `notes-index`) |
| `BEDROCK_MODEL_ID`        | Titan Embeddings model                      |
| `BEDROCK_REASONING_MODEL` | Nova Reasoning model                        |

---

## 🧰 Local Testing

Start your API locally with SAM:

```bash
sam local start-api
```

Then test it via:

```
http://127.0.0.1:3000/notes
```

---

## 🧾 Example JavaScript Integration

```javascript
async function loadNotes() {
  const res = await fetch("https://abc123xyz.execute-api.us-east-1.amazonaws.com/Prod/notes");
  const notes = await res.json();
  console.log(notes);
}

async function addNote() {
  const newNote = { id: `note-${Date.now()}`, text: "My new sticky note", user: "demo" };
  await fetch("https://abc123xyz.execute-api.us-east-1.amazonaws.com/Prod/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newNote)
  });
  loadNotes();
}
```

---

## 👨‍💻 Contributors

| Name                 | Role               | Focus                        |
| -------------------- | ------------------ | ---------------------------- |
| **John Lizarazu**    | Backend Developer  | AWS Lambda, DynamoDB, SAM    |
| **Alysa Nguyen**     | Frontend Developer | HTML/CSS/Amplify Integration |
| **Team Smart Notes** | Project Leads      | Hackathon Cloud Architecture |

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.

---

## ⭐ Acknowledgments

* AWS Educate & Hackathon mentors
* Amazon Bedrock team for API access
* The open-source community for SAM & Amplify templates

---

### 🌟 Show Your Support

If you found this project helpful, please ⭐ star the repo and share feedback!

---

🩵 *Smart Sticky Notes — Intelligent Collaboration for the Cloud Era*

# 🏗️ System Architecture (Simplified, High-Level)

## 1. High-Level Architecture Overview

Your application consists of two main components:

### **Frontend (React App)**
- Runs on **Cloudflare Pages**
- Renders UI and form where users upload images
- Sends API requests to the Cloudflare Worker backend
- Displays the analysis result returned by the backend

### **Backend (Cloudflare Worker)**
- Deployed using **Wrangler**
- Exposes an API endpoint (`/api/gpt-image`)
- Receives Base64 image data from the frontend
- Sends the image + prompt to OpenAI API
- Returns formatted JSON results

Both components are independent but communicate securely over HTTPS.

---

## 2. Architecture Diagram (Simple)

```
┌─────────────────────────┐
│        User Browser      │
│  - Views React UI        │
│  - Uploads Image         │
│  - Receives Analysis     │
└──────────────┬──────────┘
               │ (HTTPS)
               ▼
┌─────────────────────────┐
│     Cloudflare Pages     │
│  - Hosts React frontend  │
│  - Sends API request     │
│    to backend Worker     │
└──────────────┬──────────┘
               │ (HTTPS: /api/gpt-image)
               ▼
┌─────────────────────────┐
│   Cloudflare Worker      │
│  - API endpoint          │
│  - Reads env vars        │
│  - Calls OpenAI API      │
│  - Returns JSON result   │
└──────────────┬──────────┘
               │ (HTTPS)
               ▼
┌─────────────────────────┐
│       OpenAI API         │
│  - GPT model analysis     │
│  - Returns JSON response  │
└─────────────────────────┘
```

---

## 3. Request Flow (Step-By-Step)

### **1️⃣ User uploads an image**
User selects or drags/drops a banner image in the React UI.

### **2️⃣ Frontend encodes the image**
Image is converted to Base64 client-side.

### **3️⃣ Frontend sends a POST request**
```
POST /api/gpt-image
Content-Type: application/json

{
  "imageBase64": "<base64 data>"
}
```

### **4️⃣ Cloudflare Worker receives the request**
- Validates JSON
- Builds strict system prompt
- Sends request to OpenAI using `env.OPENAI_API_KEY`

### **5️⃣ OpenAI returns analysis**

### **6️⃣ Worker returns JSON response with CORS enabled**

### **7️⃣ Frontend displays analysis results**

---

## 4. Component Responsibilities

### **Frontend (React + Cloudflare Pages)**
- Collect image from user  
- Convert to Base64  
- Call Worker API  
- Render loading state, errors, results  
- Secure: contains **no API keys**

### **Backend (Cloudflare Worker)**
- Validate incoming requests  
- Load environment variables securely  
- Build strict GPT prompt  
- Send Base64 image to OpenAI  
- Handle CORS and OPTIONS requests  
- Return JSON

### **OpenAI API**
- Performs evaluation  
- Returns structured JSON  

---

## 5. Security Model

| Layer | Protection |
|-------|------------|
| Frontend | Contains **zero secrets** |
| Worker | Stores API key using Cloudflare Secrets |
| Communication | HTTPS between all services |
| GitHub | Push Protection avoids key leaks |
| Worker | Strict CORS controls |

---

## 6. Deployment Flow

### **Frontend Deployment (Cloudflare Pages)**
1. Commit React code to GitHub  
2. Cloudflare auto-builds  
3. Deploys Through github push

### **Backend Deployment (Wrangler)**
1. Edit Worker code  
2. Run:

```
wrangler deploy
```

3. Worker updates instantly.

### **Secrets**
```
wrangler secret put OPENAI_API_KEY
```

---

---

## ✅ Summary

This architecture provides a clean, secure, and scalable model:

- React UI hosted globally on Cloudflare Pages  
- Worker backend handling API routing + GPT logic  
- Secure storage of keys  
- Simple HTTP communication  
- Fast, low-latency user interaction  

Perfect for production.


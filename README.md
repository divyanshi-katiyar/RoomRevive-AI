# RoomRevive AI

AI-powered interior design platform that transforms room photos into personalized interior redesigns using Gemini AI and Pollinations AI.

## ✨ Features

- 📸 Upload room images
- 🤖 AI-powered room analysis
- 🎨 Personalized interior redesign
- 🪑 Furniture and decor recommendations
- 🌈 Custom color preferences
- 💡 Lighting customization
- 💰 Budget-aware design planning
- 🔄 AI-powered design refinement
- 🖼️ Design variations
- 💡 AI-generated design insights
- 🛍️ Shop This Look
- 💬 AI Interior Assistant
- 🔐 Clerk authentication
- 💾 MongoDB Atlas persistence
- 📚 My Designs and Studio
- 🛡️ Protected API routes
- ⏱️ Generation limits

## 🧠 How It Works

```text
Room Image
    ↓
Gemini AI Room Analysis
    ↓
Room & Furniture Understanding
    ↓
User Customization
    ↓
Gemini Design Planning
    ↓
AI Image Prompt
    ↓
Pollinations AI
    ↓
Generated Interior Design
    ↓
Save / Refine / Shop
```

## 🤖 AI Room Analysis

Gemini analyzes the uploaded room image and identifies important visual information.

The analysis can include:

- Room type
- Existing furniture
- Furniture arrangement
- Color palette
- Materials
- Lighting
- Architectural elements
- Flooring
- Walls
- Windows and doors
- Existing design style
- Decorative elements

The analysis is then used as context for generating the redesign.

## 🎨 AI Interior Designer

Users can customize the redesign before generating the result.

Customization options include:

- Room type
- Interior style
- Color preferences
- Lighting preferences
- Furniture preferences
- Budget
- Custom instructions

Supported styles include:

- Modern
- Minimalist
- Scandinavian
- Japandi
- Industrial
- Bohemian
- Traditional
- Luxury
- Contemporary

## 🪄 Design Generation

Gemini creates a structured design plan based on the uploaded room and the user's preferences.

The plan considers:

- Existing room structure
- Existing furniture
- Selected interior style
- Preferred colors
- Lighting
- Furniture
- Decor
- Budget
- User instructions

The resulting generation prompt is sent to Pollinations AI to create the redesigned room image.

## 🔄 Design Refinement

Users can refine an existing generated design without restarting the complete workflow.

Example refinement requests include:

- Change the wall color
- Change furniture
- Add plants
- Improve lighting
- Add decorative elements
- Make the room more minimal
- Make the room more luxurious
- Change the overall style

The refinement request is processed by the backend AI workflow and a new image is generated.

## 🖼️ Design Variations

RoomRevive allows users to explore alternative interpretations of the same room.

Variations help users compare different:

- Styles
- Furniture arrangements
- Color combinations
- Lighting choices
- Decorative approaches

## 💡 AI Design Insights

RoomRevive can provide AI-generated explanations about the generated design.

Insights can cover:

- Style decisions
- Color choices
- Furniture choices
- Lighting
- Materials
- Spatial improvements
- Decorative elements

## 🛍️ Shop This Look

The Shop This Look feature helps users discover products related to the generated interior.

SerpApi is used for product discovery.

Possible product categories include:

- Furniture
- Lighting
- Decor
- Rugs
- Storage
- Interior accessories

This connects AI-generated design inspiration with real-world products.

## 💬 AI Interior Assistant

RoomRevive includes an AI Interior Assistant for conversational design help.

Users can ask questions about:

- Furniture
- Colors
- Interior styles
- Room layouts
- Decor
- Lighting
- Design improvements
- Interior recommendations

## 🔐 Authentication

RoomRevive uses Clerk for authentication.

Authentication provides:

- Sign in
- Sign up
- Google authentication through Clerk
- User sessions
- Protected application features

Each saved design is associated with the authenticated user's Clerk ID.

## 💾 MongoDB Atlas

MongoDB Atlas is used for persistent application data.

The database can store:

- Designs
- Design metadata
- User ownership
- Usage information
- Design history

Saved designs are associated with the authenticated user.

## 📚 My Designs

Authenticated users can access their saved designs.

Users can:

- View previous designs
- Open design details
- Review generated results
- Delete saved designs
- Manage design history

## 🛡️ API Security

Backend API routes use Clerk authentication middleware.

Protected operations use the authenticated user's identity.

User-specific design operations are associated with the user's Clerk ID to maintain ownership boundaries.

## 🏗️ Architecture

```text
React + TypeScript + Vite
          │
          ▼
        Clerk
   Authentication
          │
          ▼
   Node.js + Express
          │
    ┌─────┼─────┐
    ▼     ▼     ▼
 Gemini  Pollinations  SerpApi
    │        │           │
    └────────┼───────────┘
             ▼
       MongoDB Atlas
```

## 🧰 Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Axios
- Lucide React
- Motion

### Backend

- Node.js
- Express.js
- TypeScript
- Mongoose
- Clerk Express

### AI

- Google Gemini API
- Pollinations AI

### Database

- MongoDB Atlas

### Authentication

- Clerk

### Shopping

- SerpApi

## 📁 Project Structure

```text
RoomRevive/
├── src/
│   ├── components/
│   ├── features/
│   │   ├── designer/
│   │   └── studio/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── server/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── repositories/
│   ├── db/
│   ├── app.ts
│   └── main.ts
│
├── uploads/
├── index.html
├── server.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

## 🔌 API Endpoints

### Health

```text
GET /api/health
```

Checks backend availability.

### Design

```text
POST /api/design
POST /api/design/refine
```

Used for design generation and refinement.

### Saved Designs

```text
GET /api/designs
GET /api/designs/:id
POST /api/designs
DELETE /api/designs/:id
GET /api/designs/user/stats
```

Used for saved design management.

### Projects

```text
GET /api/projects
POST /api/projects
```

Used for project-related functionality.

### Assistant

```text
POST /api/assistant
```

Used by the AI Interior Assistant.

### Shopping

```text
POST /api/shop
```

Used for product discovery.

## 🌐 Frontend Routes

```text
/                  Home
/design            Designer
/design/result     Design Result
/studio            Studio
/my-designs        My Designs
/sign-in/*         Sign In
/sign-up/*         Sign Up
```

## 🔑 Environment Variables

Create a `.env` file using `.env.example`.

```env
VITE_CLERK_PUBLISHABLE_KEY=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

MONGODB_URI=

POLLINATIONS_API_KEY=
GEMINI_API_KEY=
SERPAPI_API_KEY=

DAILY_GENERATION_LIMIT=15
APP_URL=
```

### Clerk Frontend

```env
VITE_CLERK_PUBLISHABLE_KEY=
```

Used by the React application for Clerk authentication.

### Clerk Backend

```env
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

Used by the Express backend.

### MongoDB

```env
MONGODB_URI=
```

MongoDB Atlas connection string.

### Gemini

```env
GEMINI_API_KEY=
```

Used for room analysis, design planning and AI-assisted functionality.

### Pollinations

```env
POLLINATIONS_API_KEY=
```

Used for AI image generation.

### SerpApi

```env
SERPAPI_API_KEY=
```

Used for shopping and product discovery.

### Application URL

```env
APP_URL=
```

Used for the deployed application URL.

## 🚀 Local Setup

Clone the repository:

```bash
git clone https://github.com/divyanshi-katiyar/RoomRevive-AI.git
cd RoomRevive-AI
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Add the required API keys and MongoDB connection string.

Start the development server:

```bash
npm run dev
```

## 🏭 Production Build

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

Type-check the project:

```bash
npm run lint
```

## 🔒 Security

Sensitive credentials should never be committed to GitHub.

Keep the following values private:

- Clerk secret key
- Gemini API key
- Pollinations API key
- MongoDB credentials
- SerpApi key

Only public frontend configuration should be exposed through Vite client-side environment variables.

## ⏱️ Generation Limits

RoomRevive includes generation-limit middleware to control AI usage.

The configured value is:

```env
DAILY_GENERATION_LIMIT=15
```

Generation limits help reduce unnecessary API usage and protect AI-generation resources.

## 🖼️ Image Handling

Uploaded and generated images are processed through the backend workflow.

Image references and metadata can be stored separately from the main design information to avoid unnecessarily storing large image payloads directly inside MongoDB documents.

## 🔄 Complete User Journey

```text
1. Open RoomRevive
2. Sign in or create an account
3. Upload a room image
4. Gemini analyzes the room
5. Select design preferences
6. Gemini creates a design plan
7. Pollinations generates the redesign
8. View the generated result
9. Refine or create variations
10. View AI design insights
11. Explore products
12. Save the design
13. Access it later from My Designs
```

## 🎯 Project Goal

RoomRevive AI makes interior visualization easier by allowing users to experiment with room designs before making real-world changes.

Instead of manually imagining how a room could look, users can upload an existing room and receive AI-generated design concepts based on their preferences.

## 🌟 Why RoomRevive?

RoomRevive combines:

- Full-stack web development
- Multimodal AI
- Generative AI
- AI image generation
- Authentication
- Database persistence
- Product discovery
- Personalized user workflows

The project demonstrates how multiple AI services and backend technologies can be combined into a complete AI-powered application.

## 👩‍💻 Author

**Divyanshi Katiyar**

Built as a full-stack AI interior design project using modern web technologies and generative AI.

## 📄 License

This project is intended for educational and portfolio purposes.
```

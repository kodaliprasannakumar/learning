# Wizzle Platform - Complete Architecture & Feature Documentation

## Platform Overview
Wizzle is a comprehensive AI-powered creative platform for children, offering 8 interactive educational tools with credit-based gamification and progress tracking.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                WIZZLE PLATFORM                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                              Frontend (React/TypeScript)                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │ Doodle to   │ │ Story       │ │ Puzzle      │ │ Space       │ │ Interactive │    │
│  │ Image       │ │ Generator   │ │ Challenge   │ │ Explorer    │ │ Quiz        │    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                                    │
│  │ Daily       │ │ AI Trainer  │ │ Music       │                                    │
│  │ Wisdom      │ │ Academy     │ │ Studio      │                                    │
│  └─────────────┘ └─────────────┘ └─────────────┘                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                              Core Systems                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                    │
│  │ Credit      │ │ User        │ │ Progress    │ │ Achievement │                    │
│  │ System      │ │ Auth        │ │ Tracking    │ │ System      │                    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘                    │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              Backend Services                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                       Supabase (Primary Database)                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                    │
│  │ User        │ │ Doodles     │ │ Credit      │ │ Music       │                    │
│  │ Profiles    │ │ Storage     │ │ Transactions│ │ Compositions│                    │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘                    │
│                                                                                     │
│                      Supabase Edge Functions                                        │
│  ┌─────────────┐ ┌─────────────┐                                                    │
│  │ proxy-image │ │ generate-   │                                                    │
│  │             │ │ media       │                                                    │
│  └─────────────┘ └─────────────┘                                                    │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           External AI Services                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│     AWS Lambda (Primary AI)            │        OpenAI (Direct)                     │
│  ┌─────────────────────────────────┐   │   ┌─────────────────────────────────┐      │
│  │ kxjju6abc5.execute-api.         │   │   │ api.openai.com/v1/              │      │
│  │ us-west-2.amazonaws.com/        │   │   │ chat/completions                │      │
│  │ default/generate-media          │   │   └─────────────────────────────────┘      │
│  │                                 │   │   Used by: Space Explorer                  │
│  │ Handles:                        │   │                                            │
│  │ • Image Generation (DALL-E 3)   │   │   Stability AI (via Service)               │
│  │ • Text Generation (GPT-4o-mini) │   │   ┌─────────────────────────────────┐      │
│  │ • Question Validation           │   │   │ Stability AI API                │      │
│  └─────────────────────────────────┘   │   │ (via Image Generation Service)  │      │
│  Used by:                              │   └─────────────────────────────────┘      │
│  • Doodle to Image                     │   Used by: Story Generator                 │
│  • Puzzle Challenge                    │                                            │
│  • Story Generator (text only)         │   External Services                        │
│                                        │   ┌─────────────────────────────────┐      │
│                                        │   │ Slido Platform                  │      │
│                                        │   │ app.sli.do/event/*/live/polls   │      │
│                                        │   └─────────────────────────────────┘      │
│                                        │   Used by: Interactive Quiz                │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Feature Breakdown & Workflows

### 1. Doodle to Image
**Description**: Transform hand-drawn sketches into AI-enhanced artwork

**Cost**: 3 credits per image generation

**Workflow**:
```
User draws on canvas → Complete doodle → Select style → Generate Image
```

**Endpoints**:
- **Primary**: `https://xxxxx/default/generate-media`
  - Mode: `image`
  - Process: GPT-4 Vision analyzes doodle → DALL-E 3 generates enhanced image
- **Storage**: Supabase proxy-image function for saving generated images

**Technical Stack**:
- HTML5 Canvas for drawing interface
- Three.js for visual effects
- Multiple brush types and colors
- Real-time canvas manipulation

---

### 2. Story Generator
**Description**: Create illustrated stories from character, setting, and object combinations

**Cost**: 3 credits per story generation

**Workflow**:
```
Select elements (character/setting/object/style) → Generate story → View/Download
```

**Endpoints**:
- **Text Generation**: Direct OpenAI API call (`https://api.openai.com/v1/chat/completions`)
  - Model: GPT-3.5-turbo
  - Creates 3-paragraph story structure
- **Image Generation**: Stability AI via image generation service
  - 3 images per story (one per paragraph)

**Features**:
- Text-to-speech with emotional voice modulation
- PDF export functionality
- Story style selection (Fun, Adventure, Comedy, Educational, Mystery)
- Image style selection (Cartoon, Watercolor, Pixel Art, etc.)

---

### 3. Puzzle Challenge
**Description**: Build questions using drag-and-drop word blocks, get AI responses

**Cost**: 1 credit per question/validation

**Workflow**:
```
Add words to collection → Drag to puzzle area → Arrange sentence → Validate/Ask
```

**Endpoints**:
- **Question Validation**: AWS Lambda `generate-media`
  - Mode: `text`
  - Validates grammar and sentence structure
- **Question Answering**: AWS Lambda `generate-media`
  - Mode: `text`
  - Provides educational responses

**Features**:
- Drag-and-drop interface with physics
- Magnet mode for automatic alignment
- Text-to-speech for responses
- Colorful block system with animations

---

### 4. Space Explorer
**Description**: Interactive 3D solar system with educational Q&A

**Cost**: 1 credit per space question

**Workflow**:
```
Explore 3D solar system → Click planets → Ask questions → Get AI answers
```

**Endpoints**:
- **Direct OpenAI**: `https://api.openai.com/v1/chat/completions`
  - Model: GPT-3.5-turbo
  - Child-friendly space education responses

**Features**:
- Full 3D solar system with Three.js
- 10 celestial bodies + asteroids/comets/ISS
- Mission system with progress tracking
- Fly-to animations and realistic orbital mechanics
- Text-to-speech with child-friendly voices

---

### 5. Interactive Quiz
**Description**: Embedded Slido quizzes with reward system

**Cost**: No credits (external platform)

**Workflow**:
```
Access embedded Slido quiz → Complete quiz → Manual reward trigger
```

**Endpoints**:
- **External**: `https://app.sli.do/event/[EVENT_ID]/live/polls`
- **No internal API calls**: All quiz functionality handled by Slido

**Features**:
- Embedded iframe integration
- Multiple quiz events available
- 5 credit reward for completion
- Simple refresh functionality

---

### 6. Daily Wisdom (Quote Page)
**Description**: Display inspirational quotes with vocabulary building

**Cost**: No credits required

**Workflow**:
```
View daily quote → Learn vocabulary → Share wisdom
```

**Endpoints**:
- **Internal**: Static quote database or content management
- **No external APIs**: Pre-configured content

**Features**:
- Daily quote rotation
- Vocabulary enhancement
- Educational content focus
- Inspirational messaging for children

---

### 7. AI Trainer Academy
**Description**: Educational platform teaching AI concepts to children

**Cost**: Variable (depending on activities)

**Workflow**:
```
Learn AI concepts → Complete exercises → Build AI understanding
```

**Endpoints**:
- **To be determined**: Educational content delivery
- **Potential**: AWS Lambda for interactive AI demonstrations

**Features**:
- Age-appropriate AI education
- Interactive learning modules
- Hands-on AI concept exploration
- Progress tracking for AI literacy

---

### 8. Music Maker Studio
**Description**: Full digital audio workstation with AI music assistance

**Cost**: 1-5 credits (AI help: 1-3, Instrument unlock: 5)

**Workflow**:
```
Open studio → Create tracks → Add notes → Use AI assistance → Save composition
```

**Endpoints**:
- **Storage**: Supabase database for compositions and user progress
- **AI Features**: Planned integration (not yet implemented)
  - Would use AWS Lambda or OpenAI for music theory assistance

**Features**:
- Piano roll interface with multi-track support
- Real-time audio synthesis (Web Audio API)
- Skill level progression system (4 levels)
- Achievement system and progress tracking
- Planned AI features: melody, harmony, rhythm suggestions

---

## Core Systems

### Credit System
**Purpose**: Gamification and resource management

**Storage**: Supabase `profiles` table
- `credits` field for current balance
- `credit_transactions` table for transaction history

**Earning Methods**:
- Saving doodles: +2 credits
- Completing stories: +3 credits
- Quiz completion: +5 credits
- Various achievements: Variable credits

**Spending**:
- Doodle to Image: 3 credits
- Story generation: 3 credits
- Puzzle questions: 1 credit each
- Space questions: 1 credit each
- Music AI assistance: 1-3 credits
- Instrument unlocks: 5 credits

### User Authentication & Profiles
**System**: Supabase Auth
**Storage**: Supabase `profiles` table

**Profile Data**:
- Basic user information
- Music progress (skill level, instruments, achievements)
- Credit balance and transaction history
- Feature-specific progress data

### Progress Tracking
**Purpose**: Educational progression and engagement

**Components**:
- Skill levels per feature
- Achievement unlocking
- Time tracking
- Completion statistics
- Learning milestone tracking

## Database Schema

### Supabase Tables

```sql
-- User profiles with comprehensive tracking
profiles:
  - id (uuid, primary key)
  - credits (integer, default 10)
  - music_skill_level (integer, default 1)
  - unlocked_instruments (text[])
  - completed_lessons (text[])
  - music_achievements (text[])
  - total_compositions (integer, default 0)
  - practice_time_minutes (integer, default 0)
  - music_progress_data (jsonb)

-- Saved doodles with metadata
doodles:
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - image_url (text)
  - video_url (text, nullable)
  - title (text)
  - details (jsonb)
  - created_at (timestamp)

-- Credit transaction history
credit_transactions:
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - amount (integer)
  - description (text)
  - created_at (timestamp)

-- Music compositions
compositions:
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - title (text)
  - composition_data (jsonb)
  - metadata (jsonb)
  - created_at (timestamp)
  - updated_at (timestamp)
```

## Security & Best Practices

### API Security
- **Supabase RLS**: Row Level Security for user data protection
- **Environment Variables**: All API keys stored securely
- **Credit Validation**: Server-side credit balance verification
- **Rate Limiting**: Built into external API services

### Data Privacy
- **Child-Safe Content**: All AI responses filtered for age-appropriate content
- **No Personal Data**: Minimal user data collection
- **Local Storage**: Some preferences stored client-side only
- **Secure Storage**: Images and compositions stored in Supabase with proper access controls

## Performance Considerations

### Frontend Optimization
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Compressed textures and assets
- **Code Splitting**: Feature-based bundle splitting
- **Caching**: Smart caching for generated content

### Backend Optimization
- **Edge Functions**: Supabase edge functions for low latency
- **CDN**: Global content delivery for static assets
- **Database Indexing**: Optimized queries for user data
- **Parallel Processing**: Multiple AI requests handled efficiently

## Future Enhancements

### Planned Features
1. **Music Studio AI**: Full integration with music theory AI
2. **Collaboration**: Real-time collaboration features
3. **Export Systems**: Advanced export for all creation tools
4. **Social Features**: Sharing and community features
5. **Mobile Apps**: Native mobile applications
6. **Advanced AI**: More sophisticated AI assistance across all features

### Scalability Plans
- **Microservices**: Breaking down into smaller, focused services
- **Global Deployment**: Multi-region deployment for performance
- **Advanced Analytics**: Detailed usage and learning analytics
- **Enterprise Features**: Classroom management and teacher tools

## Technology Stack Summary

**Frontend**:
- React 18 with TypeScript
- Tailwind CSS for styling
- Three.js for 3D graphics
- Framer Motion for animations
- Web Audio API for music
- Canvas API for drawing

**Backend**:
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- AWS Lambda for AI processing
- OpenAI GPT models
- DALL-E 3 for image generation
- Stability AI for additional image generation

**External Integrations**:
- Slido for interactive quizzes
- Web Speech API for text-to-speech
- Browser-based audio synthesis

**Development Tools**:
- Vite for build system
- ESLint + Prettier for code quality
- TypeScript for type safety
- Git for version control

---

*This architecture supports a scalable, educational platform designed to grow with users' learning needs while maintaining high performance and security standards.*
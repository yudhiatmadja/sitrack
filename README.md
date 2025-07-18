# 🚀 Next.js + Supabase Project Setup Guide

<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=32&duration=2800&pause=2000&color=6366F1&center=true&vCenter=true&width=940&lines=Welcome+to+Next.js+%2B+Supabase!;Build+Modern+Web+Applications;With+Beautiful+UI+%26+Animations" alt="Typing SVG" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue" alt="Framer Motion" />
</div>

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=yudhiatmadja&theme=tokyonight&hide_border=true&include_all_commits=true&count_private=true" alt="GitHub Stats" />
</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎨 **Modern UI/UX**
- 🌈 Beautiful gradient designs
- 🎭 Smooth animations with Framer Motion
- 📱 Fully responsive design
- 🌙 Dark/Light mode support
- ✨ Glass morphism effects

</td>
<td width="50%">

### 🔧 **Tech Stack**
- ⚡ Next.js 14 with App Router
- 🗄️ Supabase Database & Auth
- 🎯 TypeScript for type safety
- 🎨 Tailwind CSS for styling
- 🚀 Optimized for performance

</td>
</tr>
</table>

---

## 🛠️ Quick Start

### Prerequisites

<div align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,npm,git,vscode" alt="Prerequisites" />
</div>

- Node.js 18+
- npm/yarn/pnpm
- Git
- Supabase account

### Installation

```bash
# 📦 Clone the repository
git clone https://github.com/yudhiatmadja/your-repo-name.git
cd your-repo-name

# 🔧 Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Environment Setup

```bash
# 📝 Create environment file
cp .env.example .env.local
```

**Configure your `.env.local`:**
```env
# 🏗️ Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 🔐 Optional: Service Role Key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Database Setup

<details>
<summary>📊 <strong>Click to expand database schema</strong></summary>

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 👤 Users profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- 📝 Posts table
CREATE TABLE public.posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    slug TEXT UNIQUE,
    published BOOLEAN DEFAULT FALSE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 💬 Comments table
CREATE TABLE public.comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔒 Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 🛡️ Security Policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 🔄 Auto-create profile function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 🎯 Trigger for new users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

</details>

### Run the Development Server

```bash
# 🚀 Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser! 🎉

---

## 📁 Project Structure

```
📦 project/
├── 📂 app/
│   ├── 🎨 globals.css
│   ├── 📄 layout.tsx
│   ├── 🏠 page.tsx
│   ├── 📂 auth/
│   │   ├── 🔐 login/
│   │   └── 📝 register/
│   ├── 📂 dashboard/
│   └── 📂 api/
│       └── 🔑 auth/
├── 📂 components/
│   ├── 📂 ui/
│   │   ├── 🔘 button.tsx
│   │   ├── 📝 input.tsx
│   │   └── 🎴 card.tsx
│   ├── 📂 layout/
│   │   ├── 🧭 navbar.tsx
│   │   └── 🦶 footer.tsx
│   └── 📂 features/
│       ├── 🔐 auth/
│       └── 📝 posts/
├── 📂 lib/
│   ├── 🗄️ supabase.ts
│   ├── 🔧 utils.ts
│   └── 📡 api.ts
├── 📂 hooks/
│   └── 🎣 useAuth.ts
├── 📂 types/
│   └── 📋 index.ts
├── 🔐 .env.local
├── 📄 .env.example
└── 📖 README.md
```

---

## 🎨 Customization

### Tailwind Animations

Our project includes beautiful custom animations:

```css
/* ✨ Custom animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

### Color Scheme

<div align="center">
  <img src="https://via.placeholder.com/60x60/6366f1/ffffff?text=Primary" alt="Primary" />
  <img src="https://via.placeholder.com/60x60/8b5cf6/ffffff?text=Secondary" alt="Secondary" />
  <img src="https://via.placeholder.com/60x60/ec4899/ffffff?text=Accent" alt="Accent" />
  <img src="https://via.placeholder.com/60x60/22c55e/ffffff?text=Success" alt="Success" />
  <img src="https://via.placeholder.com/60x60/ef4444/ffffff?text=Error" alt="Error" />
</div>

---

## 🚀 Deployment

### Vercel (Recommended)

<div align="center">
  <img src="https://img.shields.io/badge/Deploy%20to-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white" alt="Deploy to Vercel" />
</div>

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "🚀 Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy! 🎉

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

---

## 🔧 Development Tools

### VS Code Extensions

- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **Auto Rename Tag**

### Useful Commands

```bash
# 🧹 Lint and format
npm run lint
npm run format

# 🏗️ Build for production
npm run build

# 📊 Analyze bundle
npm run analyze

# 🧪 Run tests
npm test

# 📱 Type checking
npm run type-check
```

---

## 📚 Documentation

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="https://nextjs.org/docs">
          <img src="https://skillicons.dev/icons?i=nextjs" width="50" height="50" alt="Next.js" />
        </a>
        <br />
        <strong>Next.js Docs</strong>
      </td>
      <td align="center">
        <a href="https://supabase.com/docs">
          <img src="https://supabase.com/favicon.ico" width="50" height="50" alt="Supabase" />
        </a>
        <br />
        <strong>Supabase Docs</strong>
      </td>
      <td align="center">
        <a href="https://tailwindcss.com/docs">
          <img src="https://skillicons.dev/icons?i=tailwind" width="50" height="50" alt="Tailwind" />
        </a>
        <br />
        <strong>Tailwind CSS</strong>
      </td>
      <td align="center">
        <a href="https://www.framer.com/motion/">
          <img src="https://www.framer.com/favicon.ico" width="50" height="50" alt="Framer Motion" />
        </a>
        <br />
        <strong>Framer Motion</strong>
      </td>
    </tr>
  </table>
</div>

---

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

<div align="center">
  <img src="https://contrib.rocks/image?repo=yudhiatmadja/sitrack" alt="Contributors" />
</div>

### Development Process

1. 🍴 Fork the repository
2. 🌿 Create a feature branch: `git checkout -b feature/amazing-feature`
3. 💾 Commit your changes: `git commit -m 'Add amazing feature'`
4. 📤 Push to the branch: `git push origin feature/amazing-feature`
5. 🔄 Open a Pull Request

---

## 🐛 Troubleshooting

<details>
<summary>❗ <strong>Common Issues</strong></summary>

### 🔑 "Invalid API key"
- ✅ Check your `.env.local` file
- ✅ Verify Supabase keys are correct
- ✅ Restart development server

### 🗄️ "Database connection failed"
- ✅ Check Supabase project status
- ✅ Verify RLS policies
- ✅ Check database URL

### 🏗️ "Build error during deployment"
- ✅ Check TypeScript errors
- ✅ Verify all dependencies
- ✅ Check environment variables

### 🔄 "Authentication redirect loop"
- ✅ Check callback URLs in Supabase
- ✅ Verify middleware configuration
- ✅ Check auth flow implementation

</details>

---

## 📈 Roadmap

- [x] ✅ Basic project setup
- [x] ✅ Authentication system
- [x] ✅ Database integration
- [x] ✅ UI components
- [ ] 🔄 Real-time features
- [ ] 📁 File upload system
- [ ] 🔍 Search functionality
- [ ] 📧 Email notifications
- [ ] 🌙 Dark mode toggle
- [ ] 📱 Mobile app version

---

## 📊 Project Stats

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=yudhiatmadja&layout=compact&theme=tokyonight&hide_border=true" alt="Top Languages" />
</div>

<div align="center">
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=yudhiatmadja&theme=tokyonight&hide_border=true" alt="GitHub Streak" />
</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- 💙 Thanks to the [Next.js](https://nextjs.org/) team
- 🔥 Thanks to [Supabase](https://supabase.com/) for the amazing backend
- 🎨 Thanks to [Tailwind CSS](https://tailwindcss.com/) for the styling system
- ✨ Thanks to [Framer Motion](https://www.framer.com/motion/) for animations

---

<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=20&duration=3000&pause=1000&color=6366F1&center=true&vCenter=true&width=600&lines=Thanks+for+visiting!;Happy+coding!+🚀;Star+⭐+if+you+like+this+project!" alt="Thanks" />
</div>

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/yudhiiatmadja">Yudhi Atmadja</a></p>
  <p>⭐ Don't forget to star this repository if you found it helpful!</p>
</div>

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer&text=Happy%20Coding!&fontSize=16&fontAlignY=65&desc=Next.js%20+%20Supabase&descAlignY=50&descAlign=62" alt="Footer" />
</div>
# CashZone Profile Studio — Global Unique Edition

Windows Chrome user agent এবং **সব ইউজারের জন্য একটাই শেয়ার্ড ইমেইল রেজিস্ট্রি** ব্যবহার করে US-style Gmail address তৈরির ওয়েব অ্যাপ।

এই ভার্সনে ইমেইল uniqueness শুধু আপনার ব্রাউজারের মধ্যে সীমাবদ্ধ নয়। Netlify Function + Netlify Blobs ব্যবহার করে প্রতিটি handle সার্ভারে atomically reserve করা হয়, তাই ভিন্ন ইউজার বা ভিন্ন ডিভাইসেও একই ইমেইল আর ফিরে আসে না।

---

## এই ভার্সনে কী আছে

- Windows Chrome UA, ডিফল্ট **Chrome 155.0.0.0**
- ম্যানুয়াল সিলেক্টরে **Chrome 150 থেকে 160** পর্যন্ত সব version
- American-style Gmail handle: শুধু lowercase letter, কোনো dot/space/symbol নেই
- Gmail-এর 30-character local-part limit মেনে handle তৈরি
- **Global uniqueness:** Netlify Blobs store `cashzone-email-registry`
- প্রতিটি reservation `onlyIfNew: true` দিয়ে atomic conditional write
- Store-level **strong consistency** ব্যবহার করা হয়েছে
- API ব্যর্থ হলে production-এ ভুলভাবে local uniqueness দেখিয়ে যায় না; generation বন্ধ থাকে
- `file://` বা সাধারণ static server-এ চাইলে শুধু **Local preview** mode
- ইমেইল history এই ডিভাইসের `localStorage`-এ থাকে
- CSV export, keyboard shortcut (`G`), copy buttons

> **গুরুত্বপূর্ণ:** এগুলো দেখতে Gmail-এর মতো হলেও আসল inbox নয়। কোনো Gmail account তৈরি হয় না, মেইল পাঠানো বা গ্রহণ করা যায় না।

---

## ফোল্ডার স্ট্রাকচার

```text
cashzone-ua-generator-global/
├─ public/                        # Netlify publish directory
│  ├─ index.html
│  ├─ robots.txt
│  └─ assets/
│     ├─ app.js
│     ├─ style.css
│     ├─ logo.png
│     ├─ icon.png
│     └─ fonts/
├─ netlify/
│  ├─ functions/
│  │  └─ claim-email.mjs          # GET health check + POST reservation
│  └─ lib/
│     ├─ registry.mjs             # atomic reservation logic
│     └─ names.mjs                # shared first/last name pool
├─ netlify.toml
├─ package.json
├─ package-lock.json
├─ .gitignore
└─ README.md
```

`netlify/functions` এবং `netlify/lib` পাবলিশ ফোল্ডারের বাইরে থাকে। Netlify Functions নিজেই এগুলো bundle করে।

---

## যা লাগবে

1. **Node.js 22.12 বা তার উপরে** — [nodejs.org](https://nodejs.org/)
2. একটি **Netlify account**
3. ইন্টারনেট সংযোগ (প্রথম `npm install`-এর জন্য)

যাচাই করুন:

```bash
node --version
npm --version
```

`v22.12.0` বা তার বেশি দেখা উচিত।

---

## Deploy — পদ্ধতি ১: Netlify CLI (দ্রুততম)

প্রজেক্ট ফোল্ডারে terminal খুলুন:

```bash
cd C:\path\to\cashzone-ua-generator-global
npm install
npx netlify-cli login
npx netlify-cli deploy --build --prod
```

প্রথমবার `deploy` চালালে Netlify CLI জিজ্ঞেস করবে:

- existing site বেছে নিন, অথবা
- **Create & configure a new site** বেছে নিন

এরপর এটি `.netlify/state.json`-এ site ID সেভ করবে এবং live URL দেবে।

### প্রথমবার deploy করার আগে

`npm install` অবশ্যই চালাবেন। এতে `@netlify/blobs` package `node_modules`-এ ইনস্টল হবে এবং function bundle ঠিকভাবে তৈরি হবে।

### পরেরবার update করতে

একই ফোল্ডার থেকে আবার:

```bash
npm install
npx netlify-cli deploy --build --prod
```

**একই Netlify site-এ deploy করুন।** নতুন site বানালে নতুন Blobs store তৈরি হবে এবং পুরোনো reserved email-এর রেকর্ড থাকবে না।

---

## Deploy — পদ্ধতি ২: Git + Netlify (দীর্ঘমেয়াদে সুপারিশকৃত)

1. এই ফোল্ডারটি একটি GitHub/GitLab repository-তে push করুন।
2. Netlify Dashboard → **Add new site** → **Import an existing project**।
3. Repository বেছে নিন।
4. Netlify নিজেই `netlify.toml` থেকে settings পড়বে:
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
   - **Build command:** `npm install`
   - **Node version:** 22
5. **Deploy site** চাপুন।

প্রতিটি push-এ একই site update হবে, তাই একই Blobs registry ব্যবহার হবে।

### Netlify UI-তে যদি settings ম্যানুয়ালি দিতে হয়

| Setting | Value |
|---|---|
| Build command | `npm install` |
| Publish directory | `public` |
| Functions directory | `netlify/functions` |
| Node version | `22` |

`NODE_VERSION` ইতিমধ্যে `netlify.toml`-এ সেট করা আছে।

---

## Netlify Drop বা শুধু ZIP drag & drop ব্যবহার করবেন না

Netlify Drop সাধারণত static files publish করে। এটি `netlify/functions` bundle করে না, ফলে:

- `/api/claim-email` পাওয়া যাবে না
- সাইট **Registry offline** দেখাবে
- production-এ generation বন্ধ থাকবে (এটাই ইচ্ছাকৃত নিরাপদ behavior)

Global uniqueness চাইলে অবশ্যই **Netlify CLI** অথবা **Git deploy** ব্যবহার করুন।

---

## Local-এ চালানো ও পরীক্ষা

### পূর্ণ ফাংশন + local Blobs sandbox

```bash
npm install
npx netlify-cli dev
```

তারপর খুলুন:

```text
http://localhost:8888
```

Netlify Dev একটি sandboxed local Blobs store ব্যবহার করে। এই store production data পড়ে না, কিন্তু reservation logic ঠিকভাবে পরীক্ষা করা যায়।

প্রত্যাশিত ফলাফল:

- হেডারে **Global unique** status
- প্রতিবার Generate চাপলে ভিন্ন ইমেইল
- Network tab-এ `GET /api/claim-email` এবং `POST /api/claim-email` সফল

### শুধু frontend preview

`public/index.html` সরাসরি খুললে বা সাধারণ static server দিলে:

- হেডারে **Local preview** দেখাবে
- ইমেইল শুধু ওই ব্রাউজারের `localStorage` দিয়ে unique হবে
- **Global uniqueness থাকবে না**

এটি শুধু ডিজাইন দেখার জন্য, আসল deployment-এর জন্য নয়।

---

## Global uniqueness কীভাবে কাজ করে

1. পেজ লোডে frontend `GET /api/claim-email` দিয়ে রেজিস্ট্রি health check করে।
2. Generate চাপলে `POST /api/claim-email` যায়।
3. Function প্রথমে একটি natural American-style handle বানায়, যেমন `jameswilson`.
4. `store.set(handle, data, { onlyIfNew: true })` দিয়ে atomically reserve করে।
5. একই handle আগে থেকে থাকলে Netlify `modified: false` ফেরত দেয়; function নতুন handle চেষ্টা করে।
6. কয়েকবার collision হলে short random letter suffix যোগ করা হয়, যেমন `jameswilsonqx`.
7. Reservation সফল হলেই ইমেইল frontend-এ দেখানো হয়।

Store-level strong consistency ব্যবহার করা হয়েছে, তাই concurrent user-দের ক্ষেত্রেও conditional write সঠিকভাবে কাজ করে।

### সংরক্ষিত data

```text
Store: cashzone-email-registry
Key:   jameswilson
Value: {"email":"jameswilson@gmail.com","reservedAt":"2026-..."}
```

শুধু anonymous handle এবং reservation timestamp রাখা হয়। কোনো নাম, IP, কপি করা টেক্সট বা ব্যক্তিগত তথ্য সেভ করা হয় না।

### Local history

- সর্বশেষ ৫০টি profile browser-এর `localStorage`-এ থাকে
- **Clear history** শুধু এই ডিভাইসের history মুছে
- ইতিমধ্যে globally reserved ইমেইল মুছে যায় না বা আবার ব্যবহারযোগ্য হয় না

---

## Global uniqueness-এর সীমা

এটি **এই deployed site-এর সব ইউজারের মধ্যে** uniqueness নিশ্চিত করে। এর অর্থ:

- আমাদের সাইটের দুইজন ইউজার একই ইমেইল পাবেন না
- কিন্তু Gmail-এর নিজের বিশ্বব্যাপী নামের তালিকায় ওই address আগে থেকেই কারও থাকতে পারে
- তাই Gmail signup-এ "username already taken" আসতে পারে
- এই টুল আসল Gmail account তৈরি করে না বা availability যাচাই করে না

অন্য কথায়: **আমাদের রেজিস্ট্রিতে duplicate নেই, কিন্তু Gmail-এ addressটি খালি আছে এমন কোনো নিশ্চয়তা নেই।**

---

## ব্যাকআপ ও রিসেট

### Backup

Netlify Dashboard → **Data & Storage** → **Blobs** → `cashzone-email-registry`। এখান থেকে blob list দেখা ও download করা যায়।

### Registry রিসেট

সব reserved handle মুছতে চাইলে Netlify UI থেকে store-এর blobs delete করতে পারেন। এতে পুরোনো ইমেইল আবার generate হতে পারে, তাই সাধারণত এটি করবেন না।

### নতুন Netlify site

Blobs store **site-scoped**। নতুন site মানে নতুন খালি registry। তাই:

- update সবসময় একই site-এ করুন
- site মুছে ফেললে বা নতুন site-এ migrate করলে uniqueness history থাকবে না

---

## সমস্যা হলে

### হেডারে "Registry offline" দেখাচ্ছে

- সাইটটি Netlify CLI বা Git দিয়ে deploy হয়েছে কি না দেখুন
- Netlify Dashboard → **Functions**-এ `claim-email` function আছে কি না দেখুন
- Function logs-এ error দেখুন
- `package.json`-এ `@netlify/blobs` আছে এবং build-এ `npm install` চলেছে কি না নিশ্চিত করুন
- সাইটে Blobs access আছে কি না দেখুন (সাধারণত zero-config, আলাদা setup লাগে না)

### `/api/claim-email`-এ 404

- function deploy হয়েছে কি না দেখুন
- `netlify.toml`-এ functions directory ঠিক আছে কি না দেখুন
- `claim-email.mjs`-এর `config.path` ঠিক আছে কি না দেখুন
- সরাসরি পরীক্ষা করুন: `https://your-site.netlify.app/.netlify/functions/claim-email`

### "Local preview" দেখাচ্ছে কিন্তু live site-এ থাকা উচিত

- `file://` বা `localhost`-এ খুলেছেন কি না দেখুন
- production URL ব্যবহার করুন
- function deploy ও health check ঠিক আছে কি না দেখুন

### 503 / "temporarily unavailable"

- সাময়িকভাবে Blobs unreachable হতে পারে; আবার চেষ্টা করুন
- Netlify status ও function logs দেখুন

### Node version error

- `netlify.toml`-এ `NODE_VERSION = "22"` আছে
- local Node 22.12+ আছে
- package.json-এর `engines.node` মেনে চলছে

---

## নিরাপত্তা ও নীতি

- Generated ইমেইল আসল inbox নয়; spam, verification bypass বা fake account তৈরির জন্য ব্যবহার করবেন না
- যেসব platform-এ testing করবেন, তাদের rules মানুন
- User agent শুধু একটি generated string; এটি আপনার ব্রাউজারের আসল UA পরিবর্তন করে না
- সাইটে কোনো signup বা personal data collection নেই
- শুধু anonymous handle + timestamp সংরক্ষিত হয়

---

## দ্রুত যাচাই

Deploy করার পর:

```text
1. https://your-site.netlify.app/api/claim-email
   → {"ok":true,"mode":"global"}

2. সাইটে Generate চাপুন
   → হেডারে "Global unique"
   → নতুন ইমেইল দেখাবে

3. একই ব্রাউজারে আবার Generate চাপুন
   → ভিন্ন ইমেইল

4. অন্য ব্রাউজার/ডিভাইসে Generate চাপুন
   → আগের ইমেইলগুলো পাবেন না
```

---

## সংক্ষেপে

- **Static-only ZIP** → শুধু local uniqueness
- **এই ফোল্ডার + Netlify CLI/Git** → সত্যিকারের global uniqueness
- **একই Netlify site** → registry সংরক্ষিত থাকে
- **আসল Gmail inbox নয়** → শুধু realistic testing data

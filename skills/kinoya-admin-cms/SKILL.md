---
name: kinoya-admin-cms
description: Build and maintain a full-featured static website CMS Admin Dashboard (/admin/) with 8-category tabbed navigation (no endless vertical scroll), per-field instant save, single-item selector for multi-store/multi-item editing, YouTube Data API v3 sync, automatic news link metadata/thumbnail scraper, Excel (.xlsx) full backup/restore, and visitor analytics.
---

# Kinoya Admin CMS Skill (`kinoya-admin-cms`)

Use this skill whenever the user asks to create, replicate, or extend a comprehensive **Admin Page (`/admin/`)** for a static website backed by the platform Table API (`tables/*`) and Hosted File Service (`/__platform/files`).

---

## 1. Core Architecture & Design Principles

1. **Zero Endless Vertical Scrolling (2-Tier Category Hub)**
   - Never dump dozens of CMS sections into one long vertical page.
   - Group all management panels and `site_content` groups into **Top-Level Category Tabs** (e.g., `🌐 공통 · 로고 · 카카오톡`, `📺 유튜브 · SNS 통합`, `🏪 매장 통합 관리`, `🍜 메뉴 소개`, `📖 브랜드 · 사람들`, `💼 창업 · 비용 · FAQ`, `📰 상담 · 뉴스 · 자료실`, `🏠 메인 히어로 · 백업 · 통계`) and **2nd-Level Sub-Tabs**.
   - Display **only the active sub-tab's section(s)** at any time (`display: ''` vs `display: 'none'`), plus a `전체 펼쳐보기 / 카테고리 탭 뷰로 돌아가기` toggle button.
   - Sync the left sidebar navigation (`#group-nav`) so clicking any group automatically activates its corresponding category and sub-tab.

2. **Single-Item Selector for Large Repetitive Lists (e.g. 45 Stores)**
   - When a section contains many repetitive items (e.g. `store.1.*` through `store.45.*`), render a **Single-Item Dropdown Filter Bar** (`◀ 이전 매장` / `<select>` / `다음 매장 ▶` + `전체 펼쳐보기` option) at the top of the section.
   - Tag each field wrapper with `data-store-num="N"` so only the selected store's fields are visible at once.

3. **Per-Field Instant Save (`[💾 이 항목 저장]`) + Global Save (`전체 저장`)**
   - Every text, textarea, HTML, URL, or number field in `site_content` gets an inline **`[💾 이 항목 저장]`** button (`data-cms-save-single`) next to its label, in addition to the top `전체 저장` button.
   - Image/video fields get **`[파일 선택]`**, **`[💾 이 사진/영상 저장]`**, and **`[비우기]`** buttons.
   - Binary files are **never** stored as Base64 in D1 tables. Upload binary via `KinoyaRuntime.uploadFile(file)` (`/__platform/files`), then store only the returned URL/reference in `site_content` or collection tables.

---

## 2. Required Database Tables (`.tables/schema.json`)

Define these tables using `TableSchemaUpdate`:

1. **`site_content`**: Key-value CMS store for text, HTML, URLs, image/video references, and slider intervals.
   - Fields: `id` (text), `key` (text), `group` (text), `label` (text), `type` (text: `text` | `html` | `image` | `video`), `value` (rich_text)
2. **`store_items`**: Dynamic store directory items.
   - Fields: `id`, `region` (`seoul` | `gyeonggi` | `incheon` | `chungcheong` | `daegu` | `busan` | `jeju`), `name`, `address`, `hours`, `meta`, `phone`, `photo`, `detail_url`, `google_map_url`, `naver_map_url`, `kakao_map_url`, `tmap_url`, `sort_order` (number), `is_published` (bool)
3. **`news_items`**: Press releases and brand news.
   - Fields: `id`, `title`, `date`, `source`, `url`, `excerpt`, `thumbnail`, `sort_order` (number), `is_published` (bool)
4. **`resources`**: Downloadable brochures and PDFs.
   - Fields: `id`, `category`, `title`, `description`, `link_type` (`file` | `url`), `file_url`, `file_data`, `file_name`, `sort_order` (number), `is_published` (bool)
5. **`faq_items`**: Dynamic FAQ accordion items.
   - Fields: `id`, `category`, `question`, `answer`, `meta`, `sort_order` (number), `is_published` (bool)
6. **`youtube_videos`**: Synced or manually curated YouTube videos and Shorts.
   - Fields: `id`, `kind` (`video` | `shorts`), `video_id`, `title`, `subtitle`, `views`, `published_at`, `duration`, `thumbnail`, `sort_order` (number), `is_published` (bool)
7. **`partner_logos`**: 3-row infinite marquee partner logos.
   - Fields: `id`, `name`, `row_position` (`top` | `middle` | `bottom`), `image_data`, `sort_order` (number), `is_published` (bool)
8. **`consultations`**: Customer inquiry submissions.
   - Fields: `id`, `submitted_at`, `name`, `phone`, `region`, `type`, `budget`, `store_status`, `message`, `status`, `memo`
9. **`visitor_logs`**: Pageview analytics logs.
   - Fields: `id`, `visited_at`, `date_key`, `hour_key`, `visitor_id`, `session_id`, `page_path`, `page_title`, `referrer`, `referrer_domain`, `channel`, `keyword`, `device_type`, `os`, `browser`, `language`, `screen_size`, `utm_source`, `utm_medium`, `utm_campaign`

---

## 3. Modular File Structure (`/admin/` & `/js/`)

Keep each responsibility in a focused script file:

- `js/site-runtime.js`: Shared runtime (`window.KinoyaRuntime`) providing `fetch`, `all(table)`, `create(table, row)`, `update(table, id, row)`, `remove(table, id)`, `uploadFile(file)`, `safeURL(url)`, and `cleanHTML(html)`.
- `js/cms.js`: Public page loader that binds `[data-cms]`, `[data-cms-href]`, and `[data-cms-tel]` attributes from `site_content` with `localStorage` (`cms_cache`) instant pre-application to prevent image/text flash.
- `admin/index.html`: Admin layout shell, sticky top category hub (`#admin-category-hub`), collection containers, and `window.CMS_FIELDS` manifest.
- `admin/core.js`: Admin state (`fields`, `byKey`, `setStatus`, `escapeHtml`).
- `admin/editor.js`:
  - Renders `window.CMS_FIELDS` into grouped cards (`section.cms-group-card`).
  - Adds per-field `[💾 이 항목 저장]` buttons and image/video upload handlers.
  - Builds the **Single-Store Selector** for multi-store groups (`store.N.*`).
  - Organizes all CMS groups and DB sections into the **8 Top-Level Categories & Sub-Tabs**.
- `admin/collection-editor.js`: Generic CRUD card builder (`KinoyaCollections.mount`) for `faq_items`, `news_items`, `resources`, and `youtube_videos`.
- `admin/news-manage.js`:
  - Mounts `news_items` collection and injects **`[📰 링크에서 뉴스 자동 가져오기]`** button next to the URL input.
  - Scrapes article HTML via CORS proxy fallbacks (`allorigins`, `codetabs`, `corsproxy`) + `noembed`, extracting OpenGraph/Twitter meta tags (`og:title`, `og:description`, `og:image`, `article:published_time`, `og:site_name`), JSON-LD (`NewsArticle`), and `<article>` paragraphs.
  - Decodes HTML entities (`&hellip;` → `…`, `&quot;` → `"`) cleanly via a `<textarea>` helper.
  - Attempts to download the article thumbnail image and upload it via `KinoyaRuntime.uploadFile` so it is hosted directly on the site.
- `admin/stores-manage.js`:
  - Renders a collapsible **45-Store Quick Reference Table** with `[✏️ 사진·정보 편집 바로가기]` buttons that jump directly to that store in the single-store editor, plus Excel (`.xlsx`) export and dynamic `store_items` CRUD.
- `admin/youtube-sync.js`:
  - Connects to YouTube Data API v3 using `social.youtube.apikey` and `social.youtube.channelid` (supports channel ID `UC...`, channel URL, or `@handle`), fetches channel statistics + latest videos/Shorts, and populates `youtube_videos`.
- `admin/backup-excel.js`:
  - Uses SheetJS (`XLSX`) to export all 9 tables into a multi-sheet `.xlsx` workbook and restore/import `.xlsx` files back into the tables.

---

## 4. Auto-Scroll Speed (Seconds) & Footer SNS Visibility Controls

1. **Configurable Auto-Scroll Interval (Seconds) in Admin**
   - Expose CMS fields in `window.CMS_FIELDS`:
     - `menu.autoslide.seconds` (Menu category rows, default `4`)
     - `store.autoslide.seconds` (Seoul & Nationwide store rows, default `3`)
     - `news.autoslide.seconds` (News horizontal scroller, default `3`)
   - In public scrollers (`js/home-store-rows.js`, `js/home-full.js`, `js/menu-rows.js`), read the seconds value from `cms_cache` and `home-cms-loaded` / `kinoya:cms-ready` events, and calculate `pxPerMs = cardStepWidth / (seconds * 1000)`.
   - Do **not** let OS `prefers-reduced-motion: reduce` silently freeze horizontal carousels on visitor desktops; keep carousels running smoothly and pause only on pointer hover, focus, or touch/wheel interaction.

2. **Footer `FIND & SNS` Auto-Hide When Unlinked**
   - Any `.footer-sns-item` without a valid URL (`is-placeholder`, `href="#"`, or empty CMS value `social.sns.*`) must be hidden (`display: none !important`).
   - When an administrator saves a URL in `📺 유튜브 · SNS 통합` → `푸터 SNS 링크 관리` (`social.sns.navermap`, `social.sns.googlemap`, `social.sns.kakaomap`, `social.sns.tmap`, `social.sns.blog`, `social.sns.youtube`, `social.sns.instagram`, `social.sns.threads`, `social.sns.facebook`, `social.sns.kakaochannel`, `social.sns.kakaostory`), the icon automatically appears in the footer grid; clearing the URL hides it immediately.

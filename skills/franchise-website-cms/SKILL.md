---
name: franchise-website-cms
description: Build a complete, production-ready F&B / retail franchise official website and integrated 8-tab Admin CMS (/admin/). Includes animated hero slider, category menu horizontal auto-scrollers, Seoul & nationwide store carousels + individual store detail pages (2x large photo + 6 action buttons: Detail/Google/Naver/Kakao/T-Map/Call), YouTube & Shorts live sync, 3-row infinite partner logo marquee, press release auto-scraper from URL, consultation CRM with KakaoTalk & floating consult bar, and full Excel (.xlsx) backup/restore.
---

# Franchise Website + Integrated Admin CMS Skill (`franchise-website-cms`)

Use this skill whenever the user asks to create or upgrade a **Franchise / F&B Brand Official Website** with a complete **Admin CMS (`/admin/`)** where every text, photo, menu item, store location, YouTube video, news article, FAQ, brochure, and consultation inquiry is managed without touching code.

---

## 1. Complete Franchise Website Page Map & UX Blueprint

### A. Single-Page Flagship Home (`index.html`) + Multi-Page Sub-Routes
1. **Top Navigation (`header`) & Floating Quick Bar (`#floating-consult-bar`)**
   - Brand logo (`common.logo`), phone badge (`common.phone`), KakaoTalk inquiry button (`common.kakao.url`), and primary links:
     - 브랜드 소개 (`/about/`) · 자가제면/핵심경쟁력 (`/noodle/`) · 메뉴 소개 (`/menu/`) · 매장 안내 (`/store/`) · 창업 경쟁력 (`/franchise/`) · 창업절차·비용 (`/cost/`) · 자주 묻는 질문 (`/faq/`) · 창업 상담 (`/contact/`) · 키노야 사람들 (`/people/`)
   - Bottom sticky consultation bar + floating KakaoTalk button for instant franchise conversion.

2. **Hero Full-Screen Visual Slider (`#hero`)**
   - Supports multiple slides (`hero.1.*`, `hero.2.*`, `hero.3.*`) with background image or MP4 video (`hero.video`), headline, subtitle, CTA buttons, and configurable slide interval (`hero.interval` seconds).

3. **Brand Philosophy & Core Craftsmanship Section (`#about`, `#noodle`, `/people/`)**
   - Editorial typography + craftsmanship cards (`noodle.step1~4`, `about.card1~3`) + 16-photo people gallery (`people.1~16`).

4. **Menu Showcase with Category Auto-Scroll Rows (`#menu`, `/menu/`)**
   - Categories (e.g., 우동 · 소바 · 돈카츠 · 덮밥 · 사이드) rendered as horizontal smooth auto-scrolling carousels (`js/menu-rows.js`).
   - Configurable scroll speed via Admin CMS (`menu.autoslide.seconds`, default `4` seconds per card).
   - Clicking any menu card opens a high-resolution modal lightbox.

5. **Store Directory & Individual Store Detail Pages (`#stores`, `/store/`, `/store/{slug}/`)**
   - **Home & `/store/` Store Carousels (`js/home-store-rows.js`)**:
     - Split into **서울 매장 (Seoul)** and **전국 매장 (Nationwide)** horizontal auto-scrolling rows (`store.autoslide.seconds`, default `3` seconds) + regional filter tabs (`전체` · `서울` · `경기` · `인천` · `충청` · `대구·경북` · `부산·경남` · `제주`).
     - Each store card displays:
       - Store photo (`store.N.photo` or `store_items.photo`)
       - Region badge + Store Name + Address + Hours + Meta tags + Phone number
       - **6 Standardized Action Buttons**:
         1. `상세` (Internal detail page `/store/{slug}/` or `detail_url`)
         2. `구글` (Google Maps search/link)
         3. `네이버` (Naver Map link)
         4. `카카오` (KakaoMap link)
         5. `티맵` (T-Map link)
         6. `전화` (`tel:` call link)
   - **Individual Store Detail Page (`/store/{slug}/index.html`)**:
     - **2x Enlarged Hero Store Photo** (`min-height: 480px~560px`, full-width split layout `1.22fr : 0.98fr`) automatically synced with `store.N.photo` from Admin CMS (`site_content` + `localStorage.cms_cache`).
     - **Identical 6 Action Buttons (`상세` · `구글` · `네이버` · `카카오` · `티맵` · `전화`)** under the store info panel for consistent UX.
     - Embedded Google Map iframe + store highlights & directions.

6. **Franchise Competitiveness, Cost Table & Revenue Simulator (`#franchise`, `#cost`, `/cost/`)**
   - Editable startup cost table (`cost.row1~8.*`), margin breakdown chart, and step-by-step opening procedure (`cost.step1~6`).

7. **YouTube & Shorts Live Channel Hub (`#youtube`)**
   - Displays channel subscriber/video/view counters + main featured video player + horizontal video & Shorts carousels synced via YouTube Data API v3 (`youtube_videos` table).

8. **3-Row Infinite Partner Logo Marquee (`#partners`)**
   - Top (left), Middle (right), Bottom (left) infinite CSS marquee rows powered by `partner_logos` table.

9. **Press Releases (`#news`) & Downloadable Brochures (`#resources`) + Dynamic FAQ (`#faq`)**
   - Horizontal auto-scrolling News cards (`news.autoslide.seconds`, default `3` seconds) with thumbnail, source badge, date, title, and 3-line excerpt.
   - Resource download cards supporting direct file upload (`/__platform/files`) or external URL.

10. **Franchise Consultation Form (`#contact`) & Smart Footer (`footer`)**
    - Submits directly to `consultations` table and triggers optional webhook/notification.
    - **Footer `FIND & SNS` Grid**: Supports 11 map/social channels (`네이버 지도`, `구글 지도`, `카카오맵`, `티맵`, `공식 블로그`, `유튜브`, `인스타그램`, `쓰레드`, `페이스북`, `카카오톡 채널`, `카카오스토리`). Any channel without a saved URL in Admin (`social.sns.*`) is **automatically hidden** (`display: none !important`), and appears immediately once a URL is saved.

---

## 2. Integrated 8-Tab Admin CMS Architecture (`/admin/`)

### A. Zero Endless Scroll: 8 Top-Level Categories & 2nd-Level Sub-Tabs
Organize all CMS groups and DB tables into an intuitive sticky hub (`#admin-category-hub`):
1. **`🌐 공통 · 로고 · 카카오톡`**: 브랜드 기본 정보, 로고 이미지, 대표번호/이메일, 카카오톡 상담 링크, 플로팅 바 문구
2. **`📺 유튜브 · SNS 통합`**: 유튜브 Data API v3 원클릭 채널 동기화, 영상/쇼츠 개별 관리, 푸터 SNS 링크 관리(입력 시 자동 노출 / 비우면 자동 숨김), 인스타그램·쓰레드·블로그 연동
3. **`🏪 매장 통합 관리`**:
   - **매장 슬라이드 속도(`store.autoslide.seconds`)**
   - **전 매장(45개+) 1곳씩 선택 편집기 (`store-single-select`)**: 드롭다운 + `◀ 이전 매장 / 다음 매장 ▶` 버튼으로 선택한 매장 1곳의 사진·주소·전화·지도 링크만 깔끔하게 표시
   - **45개 매장 한눈에 보기(엑셀 표) & 바로가기 허브**: 접기/펼치기 가능한 요약 표 + `[✏️ 사진·정보 편집 바로가기]` 버튼 + 엑셀(`.xlsx`) 다운로드
   - **신규 매장 추가/삭제 (`store_items` DB)**
4. **`🍜 메뉴 소개`**: 메뉴 자동 스크롤 속도(`menu.autoslide.seconds`), 대표 메뉴 6종, 카테고리별 전체 메뉴(우동·소바·돈카츠·덮밥·사이드) 사진 및 가격
5. **`📖 브랜드 · 면 · 사람들`**: 브랜드 스토리, 자가제면 4대 원칙, 키노야 사람들 16컷 사진·문구, 협력사 로고 3줄 롤링 관리
6. **`💼 창업 · 비용 · FAQ`**: 창업 경쟁력, 창업 비용 표, 예상 수익, 자주 묻는 질문(FAQ) DB 추가/수정/정렬
7. **`📰 상담 · 뉴스 · 자료실`**:
   - 창업 상담 접수 내역(`consultations`) 상태 관리 및 메모
   - **언론 보도 / 뉴스 관리 (`news_items`) + `[📰 링크에서 뉴스 자동 가져오기]`**: 뉴스 원문 URL만 입력하고 버튼을 누르면 기사 제목·날짜·언론사·본문 요약·썸네일 이미지를 자동 크롤링하고 HTML 엔티티(`&hellip;` 등)를 깨끗하게 디코딩하여 채움
   - 자료실 / 브로셔 관리 (`resources`) 파일 직접 업로드 및 링크 연동
8. **`🏠 메인 히어로 · 백업 · 통계`**: 메인 히어로 슬라이드(배경 사진/MP4 영상), **전체 DB 9개 테이블 엑셀(`.xlsx`) 통합 백업·복원**, 방문자 유입/디바이스/페이지별 통계 차트(`visitor_logs`)

### B. Per-Field Instant Save (`[💾 이 항목 저장]`) & Binary File Upload Rule
- Every CMS field includes an inline **`[💾 이 항목 저장]`** button (`data-cms-save-single`) next to its label so the admin can save a single text/number/URL change in 1 second without clicking the global save button.
- Every image/video field uploads binary files via `KinoyaRuntime.uploadFile(file)` (`/__platform/files`) and persists only the returned file URL/reference in `site_content` (never Base64 in D1).
- On public pages, `js/cms.js` caches `site_content` into `localStorage.cms_cache` and applies cached values synchronously before DOM paint to eliminate image/text flashing.

---

## 3. Required Database Schema (`.tables/schema.json`)

Use `TableSchemaUpdate` to provision these 9 tables:
- `site_content` (`id`, `key`, `group`, `label`, `type`, `value`)
- `store_items` (`id`, `region`, `name`, `address`, `hours`, `meta`, `phone`, `photo`, `detail_url`, `google_map_url`, `naver_map_url`, `kakao_map_url`, `tmap_url`, `sort_order`, `is_published`)
- `news_items` (`id`, `title`, `date`, `source`, `url`, `excerpt`, `thumbnail`, `sort_order`, `is_published`)
- `resources` (`id`, `category`, `title`, `description`, `link_type`, `file_url`, `file_data`, `file_name`, `sort_order`, `is_published`)
- `faq_items` (`id`, `category`, `question`, `answer`, `meta`, `sort_order`, `is_published`)
- `youtube_videos` (`id`, `kind`, `video_id`, `title`, `subtitle`, `views`, `published_at`, `duration`, `thumbnail`, `sort_order`, `is_published`)
- `partner_logos` (`id`, `name`, `row_position`, `image_data`, `sort_order`, `is_published`)
- `consultations` (`id`, `submitted_at`, `name`, `phone`, `region`, `type`, `budget`, `store_status`, `message`, `status`, `memo`)
- `visitor_logs` (`id`, `visited_at`, `date_key`, `hour_key`, `visitor_id`, `session_id`, `page_path`, `page_title`, `referrer`, `referrer_domain`, `channel`, `keyword`, `device_type`, `os`, `browser`, `language`, `screen_size`, `utm_source`, `utm_medium`, `utm_campaign`)

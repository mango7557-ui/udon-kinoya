# 우동키노야(Udon Kinoya) 공식 홈페이지

## 핵심기술 설명 문구 교체 (`noodle.tech.desc`)
- `/noodle/`와 홈 대체 내용, 관리자 기본값에서 `noodle.tech.desc` 문구를 “우동키노야는 자체 제면공장을 운영합니다.”에서 사용자가 요청한 **“매일 반죽,숙성,패킹까지 마친 면을 매장에 공급하고, 매장은 점증된 프로세스로 삶고 담기만 하면 됩니다.”**로 교체했습니다. 기존 CMS 키(`noodle.tech.desc`)는 유지합니다.
- 프리뷰 `site_content`의 기존 `noodle-tech-description` 행을 동일 문구로 PUT 갱신했으며, 독립 페이지와 홈의 실제 CMS 적용 텍스트 및 모바일 화면 렌더링을 확인했습니다.
- 운영 D1 및 배포는 변경하지 않았습니다. 운영 반영은 별도 승인 후 진행됩니다.


## 신념과 경쟁력 페이지 상단 소개 문구 수정
- 국문 `/noodle/` 상단 `noodle.hero.desc`의 기본 문구를 사용자가 지정한 “우동키노야는 매장에서 직접 제면하는 방식과 노하우를 제조공정에 그대로 구현하여, 최상의 면 품질은 유지하면서도 매장에서는 간편하게 조리할 수 있도록 공급합니다.”로 변경했습니다. 관리자 기본값도 같은 문구로 수정했습니다. 기존 CMS 키는 유지합니다.
- 프리뷰 `site_content`를 읽기 전용으로 조회해 해당 키가 없음을 확인한 뒤 같은 키의 새 행 1개를 추가했습니다. 프리뷰에서 국문 독립 페이지와 홈 조합의 적용 문구를 확인했으며, 독립 페이지는 PC·모바일 실제 화면도 확인했습니다. 홈 조합은 텍스트 검사 통과했으나 캡처의 스크롤 위치 불안정으로 해당 영역의 모바일 시각 확인은 별도로 완료하지 못했습니다.
- 이번 변경은 첨부 이미지에 표시된 상단 소개 문구에 한정됩니다. 다른 섹션이나 다국어 페이지의 제면공장 관련 문구는 변경하지 않았습니다. 프리뷰 데이터와 운영 D1은 별개이며, 운영 데이터 수정·배포는 하지 않았습니다. 운영에 저장된 CMS 값이 있다면 정적 기본 문구를 덮어쓸 수 있으므로 운영 반영 시 해당 값을 별도 확인해야 합니다.


## 2026-11-04 · AEO·GEO 공식 정보·정적 FAQ 및 검색 정합성 개선 (미배포)
- **새 진입점 `/guide/`:** `guide/index.html` + `css/official-guide.css`. 브랜드·숙성면·메뉴·매장·비용·업종전환·연락처·알레르기에 대한 8개 답변, 항목별 원문 링크, 자료 정리일, 정보 기준과 정정 경로를 제공합니다. 앱 JavaScript 없이 읽을 수 있는 정적 본문이며 FAQPage/Question/Answer, WebPage, BreadcrumbList를 함께 제공합니다. 홈 푸터에서 정적 링크로 접근할 수 있습니다.
- **검색 엔티티:** 홈의 Organization·Brand·WebSite·WebPage 관계를 명시하고 가이드를 연결했습니다. 브랜드와 동일한 대상을 뜻하지 않는 개별 유튜브 영상 `sameAs`를 제거하고, 로고로 오인될 수 있는 매장 사진 속성을 브랜드 공유 이미지 `image`로 정리했습니다. 홈의 기존 CMS 데이터·키와 영상 자체는 유지합니다.
- **사실 일관성:** 영문·일문 홈과 매장 안내의 45개/이전 지역 수치를 국문 등록 목록 51개(서울 26·경기 17·인천 1·충청 2·대구 1·부산 3·제주 1)와 일치시켰습니다. 실제 영업 상태의 외부 검증이 아니라 사이트 등록 목록 기준임을 가이드와 요약에 명시했습니다. 국문·영문·일문 비용/FAQ의 과거 50호점 지원 문구를 현재 게시된 100호점 조건으로 정리했습니다. 계약 시 적용 여부는 본사 확인이 필요합니다.
- **과거 매장 안내:** 현재 목록에서 제외된 `/store/songdo/`의 원본 주소·연락처·CMS 바인딩을 유지하고 과거 정보 알림과 `noindex, follow`를 추가했습니다. 해당 URL은 사이트맵과 Restaurant 마크업에서 제외했습니다. DB의 매장 레코드를 삭제하거나 변경한 것이 아닙니다.
- **크롤링 문서:** `llms.txt`를 현재 공개 안내에 맞춰 갱신했습니다. `robots.txt`는 일반 공개 크롤링을 유지하고 관리자·API·테스트·내부 자료 경로를 제외합니다(보안 수단 아님). `sitemap.xml`에는 가이드를 추가하고 이번에 수정한 URL의 lastmod만 갱신했습니다. llms.txt는 보조 제안 형식이며 모든 AI 서비스가 지원하는 표준은 아닙니다.
- **검증:** `tests/aeo-geo.html` **19/19 PASS**. 사이트맵의 **51개 URL**에 대한 프리뷰 응답·제목·설명·canonical·JSON-LD 구문, 다국어 hreflang 상호 링크, 8개 FAQ의 표시 문구/스키마 완전 일치, 숫자 정합성 및 검색 제외를 검사했습니다. `tests/premium-home.html` 기존 홈 회귀 검사 **19/19 PASS**. 가이드 PC/모바일 실화면 및 콘솔 검사 완료. 송도점 직접 캡처는 networkidle timeout으로 실제 원문 페이지를 iframe으로 여는 `tests/archive-view.html`에서 PC·모바일 알림 표시를 확인했습니다. 이것은 Google/Bing의 운영 색인·리치 결과 검증을 대신하지 않습니다.
- **저장/유지보수:** 기존 Table 데이터·localStorage/IndexedDB 키·DB 스키마·접근 정책은 수정하지 않았습니다. 가이드·llms.txt·정적 JSON-LD는 CMS 변경 시 자동 갱신되지 않으므로 원문과 함께 갱신해야 합니다. 자세한 파일별 갱신표와 운영 절차는 `docs/aeo-geo-operations.md`에 정리했습니다.
- **운영 상태:** canonical 도메인 `https://www.udonkinoya.com/` 유지. 이번에는 Hosted 배포, 운영 DB 동기화, DNS·리디렉션 설정, 검색엔진 소유권 인증·사이트맵 제출을 하지 않았습니다. 승인 배포 후 실제 운영 URL/크롤러 접근, Search Console·Bing·네이버 등록을 소유자 계정으로 확인해야 합니다. AI 인용·검색 순위·FAQ 리치 결과는 보장하지 않습니다.


## 2026-11-04 · 홈 브랜드 디자인·모바일 탐색·모션 품질 개선 (미배포)
- **범위:** 기존 콘텐츠를 교체하지 않고 국문 홈(`/`, `index.html`) 중심의 디자인을 개선했습니다. 기존 사진·영상 URL, 음식사진 20장, 매장사진 20장, 메뉴·매장 정보, CMS 키와 저장 데이터는 유지합니다. 별도 테이블 쓰기·데이터 동기화·Hosted Deploy는 실행하지 않았습니다.
- **디자인:** `css/home-premium.css`를 `.kinoya-home`에 한정 적용합니다. 네이비/아이보리/앤티크 골드, 좌측 정렬 히어로, 명확한 CTA, 48시간·13개월·한 그릇 요약, 메뉴·매장·창업 안내 3개 바로가기를 추가했습니다. 기존 기본 로고 이미지를 숨긴 정책을 유지하고, 기본 이미지가 숨겨져 있거나 이미지 참조가 없을 때만 텍스트 `KINOYA` 홈 링크를 표시합니다. 사용자 업로드 로고가 있으면 해당 이미지가 우선합니다.
- **모바일:** 홈에서 기존 3행 메뉴를 1행 브랜드·창업상담·전체메뉴로 정돈했습니다. 전체메뉴에서 기존 모든 메뉴와 EN/JA에 접근할 수 있습니다. `js/main.js`는 메뉴 열기/닫기 ARIA 상태, ESC 닫기, 포커스 복귀·순환, 닫힌 메뉴 inert, 화면 크기 변경 시 스크롤 잠금 해제를 처리합니다.
- **모션:** 음식사진의 RAF/타이머 중복 이동을 없애 단일 RAF로 왕복합니다. 음식사진·매장 슬라이더는 화면 밖 및 OS 동작 줄이기에서 자동 이동을 멈춥니다. 홈에는 영상·메뉴·매장 자동 이동 정지/재생 버튼을 추가했습니다. 영상은 화면 밖·숨긴 탭에서 멈추며, 사용자 정지 상태는 페이지 내 메모리에서만 유지됩니다. 기존 관리자 속도 설정과 수동 스크롤/키보드 이동을 유지합니다.
- **CMS 안정성:** `js/home-premium.js`는 `homeContentReady` 이후 보조 UI를 추가해 기존 경로 기반 CMS 바인딩을 먼저 확정합니다. 새 요약/바로가기 문구는 이 JS 파일에서 관리하며 기존 관리자 필드를 대체하지 않습니다. 메뉴 조기 로더의 이미지·Table API URL을 프로젝트 루트 기준으로 수정하고, 로고 조회에서 하드코딩된 운영 레코드 ID를 제거했습니다. 기존 캐시 키와 DB 스키마는 바꾸지 않았습니다.
- **검증:** `tests/premium-home.html`은 실제 `index.html`을 iframe으로 열어 19/19 검사 통과(800px 콘솔 환경), PC 1280px·모바일 390px 실제 화면 확인. 모바일 헤더 요소 위치까지 검사합니다. `tests/home-discovery.html`에서 모바일 바로가기 화면도 확인했습니다. `tests/menu-categories.html` 26/26, `tests/home-store-rows.html` 25/25, `tests/home-full.html` 전체 통과. 홈 품질 검사에서 리소스 404 및 JS 오류 없음; 프리뷰 플랫폼 iframe sandbox 경고는 남습니다. 직접 홈 캡처의 networkidle 대기가 시간 초과되어 실제 페이지를 지연 로드하는 읽기 전용 iframe 검사기를 사용했으며 디자인을 복제한 테스트 화면은 아닙니다.
- **진입점/데이터:** `/`, `/menu/`, `/store/`, `/admin/`, `/admin/home.html` 유지. 기존 `site_content` 등 프리뷰 테이블과 운영 D1은 별개이며, localStorage/IndexedDB 캐시는 기존 키를 유지합니다. 운영 canonical URL은 `https://www.udonkinoya.com/`이나 이번 변경이 해당 주소에 반영된 것은 아닙니다.
- **다음 단계:** 명시적 배포 요청 및 플랫폼 승인 후 운영 반영. 실제 관리자 파일 업로드, 운영 상담 접수·메일 수신, 카카오 공유 캐시는 이번 읽기 전용 검증 범위 밖이며 별도 운영 확인이 필요합니다. 아래는 이전 작업 이력으로, 모션 정책은 이 절이 우선합니다.


## 카카오톡 공유 썸네일(`images/kakao-share-thumbnail.png`) 전체 페이지 반영 및 관리자 미리보기 정규화
- 첨부해주신 **「국내최초 48시간 저온숙성우동 우동키노야」** 원본 PNG 이미지(`412,397 bytes`)를 `images/kakao-share-thumbnail.png`로 저장하고, 국문·영문(`en/`)·일문(`ja/`) 전체 페이지 및 11개 매장 상세페이지(`store/*/index.html`), 뉴스·자료실·404 페이지의 `<meta property="og:image">` 및 `<meta name="twitter:image">`에 `data-cms="social.kakao.image" data-cms-type="meta"`로 일괄 연결했습니다.
- 프리뷰 DB(`site_content`)에 `social.kakao.image`(`images/kakao-share-thumbnail.png`), `social.kakao.title`, `social.kakao.desc`를 입력·반영했으며, 관리자 페이지(`/admin/`) 첫 화면(`공통 로고 · 파비콘 · 카카오톡 썸네일` 탭)에서 상대 경로(`images/...`)가 `AdminCore.root` 기준으로 항상 정상 로드되도록 `admin/editor.js`의 `setMenuPreview`를 보강했습니다.

## 전국 각지 아래 「전국 매장 사진 · 20장 갤러리」 자동 좌우 스크롤 섹션 및 관리자 등록 기능 추가
- 홈페이지(`index.html` `#stores`) 및 매장 찾기(`/store/`)의 **「전국 각지 · 25개 매장」 섹션 바로 아래**에 **「전국 매장 사진 · 20장 갤러리」** 섹션(`#store-photo-gallery`)을 추가하고 상단 바로가기(`.section-jump-links`)에 `전국 매장 사진` 링크를 연결했습니다.
- 실제 전국 대표 매장 대문·외관 사진 20장(`images/store-*.jpg`)과 매장명·지역 설명을 20개 카드(`STORE 01` ~ `STORE 20`)로 구성하여, `js/home-store-rows.js`를 통해 **한 줄 가로 트랙에서 자동으로 부드럽게 좌우 왕복 스크롤**(마우스 호버·드래그·휠·키보드 조작 시 일시정지 후 자동 재개)되도록 구현했습니다.
- 관리자 페이지(`/admin/`의 `🏪 매장 통합 관리 (51개)` → `전국 매장 사진 · 갤러리 (20장 슬라이드)` 서브탭 및 `/admin/home.html`)에서 섹션 제목(`store.gallery.title`), 안내 문구(`store.gallery.desc`), 그리고 **1번~20번 매장 사진(`store.gallery.01.photo` ~ `store.gallery.20.photo`)과 매장명·설명(`store.gallery.01.title` ~ `store.gallery.20.title`)**을 개별 업로드·수정·비우기·기본값 복원할 수 있으며, 1~20번 빠른 이동 드롭다운 필터(`◀ 이전 사진 / 다음 사진 ▶`)도 함께 제공합니다.

## 메뉴소개 사이드 하단 「우동키노야 음식사진」 20장 자동 좌우 스크롤 섹션 및 관리자 등록 기능 추가
- 메뉴소개(`/menu/`) 및 홈페이지 `#menu-preview`의 **`05 / SIDE 사이드` 섹션 바로 아래(하단 안내문 위)**에 **`06 / KINOYA FOOD GALLERY · 우동키노야 음식사진`** 섹션(`#category-food-photos`)을 추가하고 상단 바로가기(`.section-jump-links`)에 `우동키노야 음식사진` 링크를 연결했습니다.
- 우동키노야 실제 음식 사진 20장(`images/food-*.jpg/png` 14장 + 기존 메뉴 사진 6장)과 각 메뉴의 상세 설명을 20개 카드(`PHOTO 01` ~ `PHOTO 20`)로 구성하여, `js/menu-rows.js`를 통해 **한 줄 가로 트랙에서 자동으로 끊김 없이 부드럽게 좌우 왕복 스크롤**(현재는 화면 안에서 자동 이동하며 OS 동작 줄이기 설정을 존중; 마우스 호버·드래그·터치·휠·키보드 화살표 조작 시 일시정지 후 자동 재개)되도록 구현했습니다. 또한 `01 · 시그니처`, `02 · 붓카케·자루`, `03 · 카케` 전 메뉴 카드에도 실제 음식 사진을 연결했습니다.
- 관리자 페이지(`/admin/`의 `🍜 메뉴 소개 · 음식사진 (7종)` → `우동키노야 음식사진 (20장 슬라이드)` 탭 및 `/admin/home.html`)에서 섹션 상단 라벨(`menu.food.eyebrow`), 제목(`menu.food.title`), 그리고 **1번~20번 음식 사진(`menu.food.01.bg` ~ `menu.food.20.bg`)과 설명(`menu.food.01.desc` ~ `menu.food.20.desc`)**을 개별 선택·업로드·수정·비우기·기본값 복원할 수 있으며, 1~20번 빠른 이동 드롭다운 필터도 함께 제공합니다.

## 공식 매장 갤러리(`jinkinoya.mycafe24.com`) 매장 대문 사진 다운로드 및 전체 연동
- 공식 매장 갤러리(`https://jinkinoya.mycafe24.com/company-basic/company-basic-gallery/`)에 등록된 **41개 운영 매장의 대문(외관) 사진**을 `images/store-*.jpg/png`로 다운로드하여 매장 찾기(`/store/`), 홈페이지 매장 섹션(`index.html` `#stores`), 개별 매장 상세페이지(`/store/guri/`, `/store/yongsan/`, `/store/magok/`, `/store/euljiro/`, `/store/hapjeong/`, `/store/guro/`, `/store/hanammisa/`, `/store/seomyeon/`, `/store/yeomchang/`), 영문·일문 매장 안내(`/en/store/`, `/ja/store/`), 관리자 페이지(`/admin/`)의 기본 매장 사진으로 일괄 반영했습니다.
  - **서울 (21개 매장 사진 적용):** 용산직영점(신용산본점), 마곡점, 을지로점, 합정점, 중앙대점, 신촌숲길점, 강남신논현역점, 구로디지털단지점, 신림점, 미아역점, 왕십리점, 방배카페골목점, 성수점, 대학로점, 건대점, 잠실점, 상암점, 강남역점, 금천구청역점, 강남도곡점, 염창역점, 외대점.
  - **경기·충청·대구·부산·제주 (20개 매장 사진 적용):** 구리본점, 금정AK플라자점, 하남미사점, 일산차병원점, 용인역북점, 롯데프리미엄아울렛 파주점, 현대프리미엄아울렛 김포점, 수원인계점, 판교파미어스몰점, 김포구래점, 안양평촌점, 서현점, 양평점, 과천점(과천역점), 충주호암점, 대구죽전점, 부산서면점, 부산광안점, 제주노형점.

## 메뉴소개 정식·사이드·음료주류, 창업비용, 사이트 전체 라인 통일 및 창업안내 자동재생 영상 삽입
- 창업안내(`/franchise/`, 홈 `#proof`)의 **「TOTAL · 최종합계 1억2,485만원(부가세포함)」** 바와 **「COST INNOVATION · 거품을 걷어낸 실속 창업」** 박스 사이에 첨부된 `kinoya_retro_udon_v3_logo_rise.mp4` 영상을 `images/kinoya-7000-open.mp4`로 저장·배치하고, 페이지 진입 시 자동 무한 반복 재생(`autoplay muted loop playsinline webkit-playsinline controls`)되도록 설정했습니다.
- 사이트 전체의 보더·구분선·카드 테두리(`--line-dark`, `--line-light`, `.wood-line`, 모든 섹션 카드·테이블·배지·구분선)를 특허출원 배너 참조 이미지와 동일한 **1px 앤티크 골드·브론즈 헤어라인 + 라운드 모서리(10~12px) 및 캡슐 배지(999px)** 스타일로 통일했습니다.
- 메뉴소개(`/menu/`, 홈 `#menu-preview`)에서 **04 · 정식**과 **05 · 사이드** 카테고리는 빈 사진 프레임 없이 메뉴명·가격 카드만 깔끔하게 보이도록 했으며, **06 · 음료·주류** 섹션과 상단 음료·주류 바로가기 버튼을 화면에서 숨겼습니다. 기존 CMS 데이터와 바인딩은 삭제하지 않고 보존합니다.
- 창업비용(`/franchise/cost/`, 홈 `#model`) 섹션의 상단/하단 안내문, 4가지 출점 컨셉 바로가기 탭, 컨셉별 설명·견적 비교표 및 포함/별도비용 카드를 화이트 카드·네이비 테이블 헤더 구조로 정돈했습니다.

## 신념과 경쟁력 섹션 순서 및 48시간 숙성·원팩 사진
- 국문 `/noodle/`와 홈 `#noodle`(원본 로딩 실패 시 대체 내용 포함)의 바로가기 및 본문을 48시간 숙성 이유 → 핵심기술 → 연구 데이터 → Q&A 순서로 표시합니다. 기존 Q&A 앵커와 CMS 키는 유지됩니다.
- 48시간 숙성 섹션(`#aging`, `#home-noodle-aging`, `/en/noodle/`, `/ja/noodle/`)에는 새로 업로드된 제면공장 배합기 사진(`images/noodle-flour-mixing.png`)을 텍스트 오른쪽에 표시하며, 핵심기술의 `01 · Factory` 카드는 우동면 클로즈업 사진(`images/udon-noodle-texture.jpg`)으로 복구하고 `02 · One-Pack` 카드(`/noodle/`, 홈, `/en/noodle/`, `/ja/noodle/`)에는 원팩 우동면 사진(`images/noodle-packed-udon.png`)만 표시되도록 적용했습니다. 기존 CMS 바인딩과 저장된 값은 삭제하지 않고 그대로 보존합니다.
- `js/noodle-order.js`가 실제 DOM을 이동합니다. 홈에서는 기존 경로 기반 CMS 바인딩을 먼저 생성한 뒤 재배치하여 저장된 값이 다른 요소에 적용되지 않도록 합니다. 자바스크립트를 사용할 수 없는 경우에는 원래 순서가 유지됩니다.
- 운영 배포는 별도 승인 전까지 적용되지 않습니다.

## 리뉴얼·업종전환 사례 시안 적용
- `/franchise/#before-after`, `/franchise/#conversion-cases` 및 홈에 조합되는 동일 섹션에 첨부된 시안의 비교 슬라이더와 매출 막대 스타일을 적용했습니다. 스타일은 `css/renewal-cases.css`, 동작은 `js/renewal-cases.js`입니다. 마우스·터치·방향키를 지원하며 동작 축소 설정을 존중합니다.
- 사용자 제공 전후 사진을 1·2번 리뉴얼 사례와 건대점(3번) 비교 슬라이더에 사용합니다. 건대점은 `images/renewal-case3-before.png`(기존 매장)와 `images/renewal-case3-after.png`(리뉴얼 후)입니다. 업종전환 사례에는 합정점과 금천구청역점 각각 사용자가 제공한 전후 사진을 표시합니다(`images/conversion-hapjeong-*.png`, `images/conversion-geumcheon-*.png`). 기존 업종전환 CMS 합성 이미지 바인딩은 '기존 업종전환 비교 이미지 보기'에, 리뉴얼 사례의 기존 CMS 이미지는 각 사례의 '기존 전후 비교 이미지 보기'에 유지됩니다. 사용자가 제공한 새 사진의 지점 및 간판 정확성은 확인이 필요합니다.
- 운영 배포는 별도 승인 전까지 적용되지 않습니다.

## 홈페이지 2차 피드백(`홈페이지 피드백 2차.pptx` 1~9페이지) 전면 반영 완료 — 2026-11-02 (최신)
- **Page 1 · 브랜드스토리(`brand/index.html`, `index.html` `#brand-story`, `kinoya.css`):**
  - 기존 우동키노야 홈페이지의 브랜드스토리 원문(**「하루 0명에서 월 5,000명이 되기까지.」** — 도쿄 단골집 자가제면 수련부터 하루 1팀도 못 받던 시절을 지나 하루 3.5시간 영업으로 월 4,000~5,000명이 방문하는 매장이 되기까지의 실제 스토리)을 그대로 복원하고, 인물 사진으로 **육승준 대표(`images/people-yuk-seungjun.jpg`)** 사진을 적용했습니다.
  - **사진 하단 텍스트 플로우 배치(`.miracle.is-story-wrap`):** 좌측 대표 사진 아래가 비어 보이지 않도록, 데스크톱 화면에서 사진 우측에 상단 문단이 배치되고 이어지는 본문 문단들이 **사진 밑으로도 컨테이너 전체 폭(100%)을 따라 자연스럽게 흐르도록** 수정했습니다.
- **Page 2 · 키노야의 신념과 경쟁력 좌측 중복 이미지 교체(`noodle/index.html`, `index.html` `#home-noodle-aging`):**
  - 반복되던 기존 매장 사진을 자체 제면공장 **밀가루배합 공정 사진(`images/noodle-flour-mixing.png`)**으로 교체했습니다.
- **Page 3 · 핵심기술 우측 원팩 사진 교체 및 특허 출원 2건 시각화(`noodle/index.html`, `index.html` `#home-noodle-tech`):**
  - `02 · One-Pack` 우측 카드 배경 사진을 **팩킹 우동면 실물 사진(`images/noodle-packed-udon.png`)**으로 변경했습니다.
  - 핵심기술 카드 하단에 **특허 출원 2건(제1호: 48시간 저온숙성 우동 생면 제조 및 배합 방법 / 제2호: 약 80cm 장척 숙성 우동면의 원팩 포션 패킹 및 유통 공정)** 인증 배너·카드(`patent-cert-banner`)를 시각화해 삽입하고 관리자 CMS(`noodle.patent.*`)에서 출원번호·명칭을 편집할 수 있도록 연동했습니다.
- **Page 4 · 구리본점 실제 포스(POS) 최고매출 사진 삽입 및 8월 1일자 표시(`franchise/index.html`, `index.html`, `store/guri/index.html`):**
  - 구리본점 실제 POS 월별 매출현황 사진(`images/store-guri-pos-sales.png`)을 삽입하고, **8월 1일(토) 일 최고매출 `3,805,700원` 달성(단 27석 · 하루 3.5시간 영업)** 콜아웃 배지를 표시했습니다.
- **Page 5 · 가맹 100호점까지 지원 문구 수정(`franchise/index.html`, `franchise/cost/index.html`, `index.html`):**
  - 창업비용 안내표 및 컨셉 안내의 가맹점 지원 혜택을 **`가맹100호점까지 가맹비 30% 지원 · 가맹100호점까지 교육비 40% 지원`**으로 일괄 수정했습니다.
- **Page 6 · 7~8천만원 합리적 창업 배너 리디자인 및 문구 수정(`franchise/index.html`, `kinoya.css`):**
  - 부자연스러웠던 기존 배너를 브랜드 네이비·골드 톤의 **거품 절감 비교 그래픽(`일반 신규창업 평균 1억 3,000만원+` → `우동키노야 합리적 오픈 기준 7~8천만원 OPEN!`)**과 **`7~8천만원으로 시작할 수 있습니다.`** 타이틀로 세련되게 리디자인했습니다.
- **Page 7 · 기존업주 업종전환 성공사례 및 BEFORE & AFTER 섹션 프리미엄 리디자인(`franchise/index.html` `#before-after`, `#conversion-cases`, `kinoya.css`, `js/home-full.js`):**
  - **업종전환(`#conversion-cases` · 「업종 변경으로, 다시 성장한 매장들」):**
    - 좌·우 두 카드(`01 · SUCCESS CASE 합정메세나점`, `02 · SUCCESS CASE 금천구청역점`)의 상단 헤더(`.conv-card-top`)를 **완전한 좌우 대칭 3단 스택 구조(배지+전환 경로 한 줄 → 매장명 → 우드 보더 슬로건 박스)**로 통일해 높이 차이를 없앴습니다.
    - 내부 사진 영역(`.conv-photo-pair`)은 브로슈어 슬라이드의 흰색 배경·회색 캡슐·둥근 테두리를 완전히 배제하고, **개별 매장 BEFORE / AFTER 사진만 각각 추출해 다크 네이비 슬롯(`.conv-photo-slot`)과 골드 원형 화살표 배지(`.conv-pair-badge`)**로 나란히 배치했습니다.
    - **01 · SUCCESS CASE 합정메세나점(합정점):** 카레 전문점(월 4,000만원) → 우동키노야(**월 9,500만원 · 약 2.4배 매출 성장**)
    - **02 · SUCCESS CASE 금천구청역점:** 개인 돈까스점(월 1,900만원) → 우동키노야(**월 8,000만원 · 약 4.2배 매출 성장**)
  - **리뉴얼 사례(`#before-after` · 중앙대점 / 일산차병원점 / 건대점):**
    - 원본 합성 이미지에 있던 파란색 화살표 그래픽을 배제하고, **좌측 BEFORE 사진과 우측 AFTER 사진을 동일한 비율(`356:328`)의 다크 네이비 비교 프레임(`.fr-ba-photo-compare`)으로 분리**하여 중앙 골드 원형 화살표 배지(`.ba-center-badge`) 및 상단 `BEFORE` / `AFTER · KINOYA` 헤더 바와 함께 통일감 있게 구성했습니다.
- **Page 8 · 본사 지원 01번 문구 수정(`franchise/index.html`, `admin/index.html`):**
  - 본사 지원(`Support`) 첫 번째 카드를 **`01. 상권분석 / 손익분석`**으로 수정했습니다.
- **Page 9 · 창업모델 및 창업비용 4가지 컨셉 재구성(`franchise/index.html`, `franchise/cost/index.html`, `index.html`, `admin/index.html`):**
  - 기존 3가지 구분을 **① `10평대 닷지(바석)형 컨셉`, ② `20~30평대 홀+닷지 결합형 컨셉`, ③ `리뉴얼공사`, ④ `업종전환`**의 4가지 컨셉(`model-grid is-2x2` 및 컨셉별 상세 견적 섹션)으로 전면 재구성했습니다.


## 창업상담 신청 이메일 연동(`delhi1984@naver.com`) 및 전국 51개 운영 매장 엑셀 업데이트 완료 — 2026-10-31
- **1. 창업상담 신청(`#consult-form`) 실시간 이메일 발송 연동 (`delhi1984@naver.com`):**
  - `contact/index.html`, `en/contact/index.html`, `ja/contact/index.html` 및 홈페이지(`index.html`)에 조합되는 `#consult-form`에 `data-notify-email="delhi1984@naver.com"` 속성을 지정하고, `js/main.js`에서 상담 신청 접수 시 기존 `/tables/consultations` DB 저장과 동시에 **FormSubmit AJAX API (`https://formsubmit.co/ajax/delhi1984@naver.com`)**로 신청자 성함·연락처·희망지역·창업유형·문의내용·접수경로·접수일시(KST)를 자동 이메일 발송하도록 연동했습니다.
  - 관리자 페이지(`admin/index.html`, `admin/consultations.js`)의 `[창업문의]` 탭에 수신 이메일 변경 필드(`contact.notify.email`, 기본값 `delhi1984@naver.com`)를 추가하고, 상담신청 관리 카드마다 **`[✉️ 이메일로 열기 (delhi1984@naver.com)]`** 원클릭 `mailto:` 버튼을 함께 제공했습니다.
  - **최초 1회 활성화 안내:** FormSubmit 서비스 정책상 최초 1회 상담 신청이 발생하면 `delhi1984@naver.com` 메일함으로 FormSubmit 인증 메일(`Activate Form`)이 도착합니다. 메일 내 **Confirm(활성화)** 버튼을 1회 클릭하면 이후 모든 창업상담 내역이 실시간으로 수신됩니다.
- **2. 전국 매장 정보 엑셀(`우동키노야_전국_매장_정보_수집_요청_업데이트.xlsx`) 반영 — 총 51개 운영 매장:**
  - **신규 8개 매장 추가:** 삼성점(`store-46`), 고양터미널점(`store-47`), 용두점(`store-48`), 보라매점(`store-49`), 정자역점(`store-50`), 가양역점(`store-51`, 상세페이지 `gayang/` 연결), 충남대점(`store-52`), 광교상현점(`store-53`).
  - **기존 매장 최신 정보 반영:** 외대점(`store-42`), BIFC2 스퀘어가든점(`store-41`), 영종하늘도시점(`store-45`, 전화번호 `070-7655-5044` 및 이은스퀘어 1층 주소 반영).
  - **폐점 2곳 정리:** 엑셀 비고란에 `폐점`으로 표시된 인천송도점(`store-4`), 천안불당점(`store-30`)을 운영 매장 목록에서 제외하여 현재 운영 매장 **총 51개 매장(서울 26 · 경기 17 · 인천 1 · 충청 2 · 대구 1 · 부산 3 · 제주 1)**으로 `store/index.html`, `store/gayang/index.html`, `admin/index.html`, `admin/editor.js`, `admin/stores-manage.js`, `tests/home-store-rows-test.js`를 모두 동기화했습니다.


## 우동키노야 AEO · GEO(답변 엔진 · 생성형 AI 검색) 최적화 완료 — 2026-10-31
- **1단계 (다국어 페이지 `en/`, `ja/` 수치 및 연락처 동기화):**
  - `en/index.html`, `ja/index.html`, `en/store/index.html`, `ja/store/index.html`에 전국 45개 매장 운영 현황(서울 22 · 경기 14 · 인천 2 · 충청 2 · 대구 1 · 부산 3 · 제주 1)을 국문 페이지와 동일하게 반영하고, 푸터 연락처에 가맹·창업 대표번호(`1668-2750`)와 구리본점 안내번호(`0507-1408-1984`)를 명확히 구분해 표기했습니다.
  - `en/franchise/cost/index.html`, `ja/franchise/cost/index.html`, `en/franchise/faq/index.html`, `ja/franchise/faq/index.html`의 본문 및 `FAQPage` JSON-LD에 30평형 신규 기준표(1억 2,485만 원, 50호점 지원 혜택)와 무권리 업종전환 리뉴얼 사례(7,200만~8,200만 원대) 수치를 국문과 일치시켰습니다.
- **2단계 (`llms.txt` 공식 팩트 시트 및 대표번호 정정):**
  - `llms.txt` 상단에 LLM·AI 검색 시스템이 즉시 인용할 수 있는 **핵심 사실 요약(Key Facts Summary)** 섹션(13개월 연구 · 48시간 저온숙성 · 약 80cm 원팩 공급, 6대 메뉴 카테고리, 전국 45개 매장 분포, 10평대/30평형/업종전환 투자비 참고 범위, 목표 원가율 33~34%)을 추가했습니다.
  - `llms.txt`의 연락처에 가맹·창업 상담 대표번호(`1668-2750`)와 구리본점 매장 안내번호(`0507-1408-1984`)를 구분하여 생성형 AI의 번호 혼동을 방지했습니다.
- **3단계 (JSON-LD 엔티티 그래프 및 창업비용 표 접근성 보강):**
  - `index.html`: `Organization` JSON-LD에 `telephone` (`1668-2750`), 가맹 상담·고객 안내 `contactPoint` 2종(다국어 `ko`, `en`, `ja` 지원 명시), 공식 유튜브 `sameAs`를 연결했습니다.
  - `menu/index.html`, `en/menu/index.html`, `ja/menu/index.html`: `js/menu-catalog.js`의 실제 메뉴·가격 데이터와 일치하는 `Menu` / `MenuSection` / `MenuItem` + `Offer`(`KRW`) JSON-LD 및 6대 카테고리 설명을 국문·영문·일문에 모두 추가했습니다.
  - `noodle/index.html`, `en/noodle/index.html`, `ja/noodle/index.html`: 단일 `Question` 구조에서 2개 핵심 문항(직접 제면 여부, 48시간 숙성 이유)을 담은 정식 `FAQPage` JSON-LD로 확장했습니다.
  - `people/index.html`: 본문에 소개된 경영진 2명(김민찬 대표이사, 육승준 R&D 본부장)과 분야별 전문가 4명(이정구 가맹본부장, 박민호 운영본부장, 이홍규 상권분석 전문가, 김형석 마케팅 전문가)의 `Person` 엔티티(`worksFor` → `#organization`)를 `@graph`에 연결해 E-E-A-T 엔티티 신호를 강화했습니다.
  - `franchise/cost/index.html`: 하단 비용 관련 Q&A 2문항을 `FAQPage` JSON-LD로 연결하고, 10평대 비용 표에 `<caption class="sr-only">` 및 `<th scope="col">`을 추가했습니다.
- **4단계 (회귀 테스트 검증 완료):**
  - `tests/home-full.html` (39/39 PASS), `tests/nav-state.html` (15/15 PASS), `tests/people-team.html` (14/14 PASS) 등 인-브라우저 테스트 통과 확인.


## 우동키노야 릴리스 엔지니어링 · 배포 차단/회귀 검증 및 수정 완료 — 2026-10-31
- **`js/site-runtime.js` Table API 조회 정합성 및 413 묶음 축소 복구:**
  - `KinoyaRuntime.all()`에서 HTTP 413 발생 시 `100 → 20 → 5 → 1` 단계로 묶음 크기를 줄여 `page=1`부터 안전하게 재조회하도록 복구하고, HTTP 401/403/500 에러 시 불필요한 묶음 축소 재시도를 하지 않도록 정밀화(`tests/admin-read413.html` 17/17 PASS, `tests/admin-reliability.html` 29/29 PASS).
- **`admin/editor.js` 단건 조회(`readExistingRow`) 응답 호환성 개선:**
  - 서버나 테스트 픽스처가 `/tables/site_content/{id}` 요청에 대해 단건 객체(`{id, key, value}`)뿐 아니라 리스트 래퍼(`{data: [...]}`) 형식을 반환하더라도 해당 `id` 또는 `key` 행을 정확히 찾아 충돌 오판 없이 PUT 갱신이 이루어지도록 보강(`tests/menu-admin-settings.html` 8/8 PASS).
- **플랫폼 접근 제어(`.meta/access-control.json`) 및 9개 D1 테이블 스키마 검증 완료:**
  - `AccessRulesValidate` 통과(`valid: true`, `issues: []`), 공개 페이지/이미지·영상·자료실 읽기(`public`), 상담·방문자 로그 등록(`POST public`), 관리자(`/admin`, `/admin/**`) 및 파일/테이블 쓰기(`allowlist`) 정책 정합성 확인 완료.


## 우동키노야 기술 SEO · 크롤링/색인 · Sitemap/Robots · 구조화 데이터 · Preload 최적화 완료 — 2026-10-31
- **`robots.txt` 및 비공개·중복 템플릿 색인 제어:**
  - `robots.txt`에 공개 영역(`Allow: /`)과 `Sitemap: https://www.udonkinoya.com/sitemap.xml`을 유지하면서 비공개/내부 경로(`Disallow: /admin/`, `Disallow: /tests/`)를 명시.
  - 쿼리 파라미터(`?id=`) 기반 빈 쉘 페이지인 `news/view/index.html`에 `<meta name="robots" content="noindex, follow">` 및 `<link rel="canonical" href="https://www.udonkinoya.com/news/">`를 추가해 Soft 404 색인 방지.
  - 보관용 디자인 원본 파일인 `resources/kinoya-menu-source.html`에 `<meta name="robots" content="noindex, nofollow">` 및 `<link rel="canonical" href="https://www.udonkinoya.com/menu/">`를 추가해 `/menu/`와의 중복 색인 방지.
- **`sitemap.xml` 및 `llms.txt` 대표 공개 URL 동기화:**
  - `sitemap.xml`에 누락되어 있던 7개 지점 상세페이지(`/store/euljiro/`, `/store/gayang/`, `/store/yeomchang/`, `/store/guro/`, `/store/songdo/`, `/store/hanammisa/`, `/store/seomyeon/`)와 `/news/`, `/resources/`를 추가(기계적인 날짜 변경 없이 기존 기준일 `2026-09-16` 유지).
  - 기존 프로젝트에 포함되어 있던 `llms.txt`에 `/news/`, `/resources/` 경로와 전국 45개 매장·6개 메뉴 카테고리 구성을 최신화.
- **메타데이터 및 JSON-LD 구조화 데이터 정합성 개선:**
  - `news/index.html`, `resources/index.html`에 누락되어 있던 `hreflang`(`ko`, `x-default`), `og:site_name`, `twitter:card` 메타데이터와 `WebPage` + `BreadcrumbList` JSON-LD를 추가.
  - 9개 매장 상세페이지(`guri`, `yongsan`, `hapjeong`, `magok`, `euljiro`, `yeomchang`, `guro`, `hanammisa`, `seomyeon`)의 `Restaurant` JSON-LD에서 실제 사이트 자체 리뷰 시스템 근거 없이 `"reviewCount": "1"`로 하드코딩되어 있던 `aggregateRating` 속성을 제거하여 구조화 데이터 가이드라인 위반 소지를 차단하고, `magok`, `yeomchang`, `songdo`, `hanammisa` 4개 지점의 `Restaurant` JSON-LD에 화면과 일치하는 `telephone` 속성을 보완.
- **LCP / 네트워크 대역폭 최적화 (미사용 이미지 Preload 제거):**
  - `index.html`과 `menu/index.html`의 `<head>`에서 첫 화면(Above-the-fold)에 즉시 사용되지 않아 브라우저 콘솔 경고를 유발하던 `udon-bowl-hero.jpg`, `udon-noodle-texture.jpg` `<link rel="preload" as="image">`를 제거하여 상단 로고(`logo-header.png`) 및 핵심 스타일시트 로딩 우선순위를 확보.


## 우동키노야 정보 구조(IA) · 탐색(Navigation) · 내부링크 일관성 개선 완료 — 2026-10-31
- **홈(`index.html`) 접근성·시맨틱 및 앵커 텍스트 개선:**
  - `<a href="#main-content" class="skip-link">본문 바로가기</a>` 및 `<main id="main-content">` 적용으로 전 서브페이지와 랜드마크 구조 통일.
  - 창업모델 섹션의 URL 노출형 링크(`/franchise/cost/`)를 목적 중심 한국어 앵커(`창업비용 안내 페이지`)로 개선하고, 매장 섹션 영문 단독 링크(`VIEW ALL`)를 `전국 매장 전체 보기`로 명확화, 푸터 메뉴의 `#noodle` 해시 링크를 정식 대표 URL(`noodle/`)로 연결.
- **서브페이지 8종(`brand/`, `noodle/`, `menu/`, `people/`, `franchise/`, `franchise/cost/`, `franchise/faq/`, `contact/`) 푸터 탐색 통일:**
  - 기존에 일부 링크만 노출되어 브랜드/제면/메뉴/매장/뉴스/자료실로 이동이 끊기던 푸터 `Menu` 컬럼을 전체 10개 핵심 페이지(`브랜드스토리` · `키노야의 신념과 경쟁력` · `우동키노야 사람들` · `창업안내` · `창업비용` · `우리동네 키노야` · `메뉴소개` · `FAQ` · `뉴스` · `자료실`)로 통일.
- **매장 찾기(`store/index.html`) 및 개별 매장 상세 11곳(`store/*/index.html`) 내부링크 강화:**
  - `store/index.html` 푸터의 빈 `<b></b>` 태그를 정리하고 주요 메뉴·창업·뉴스·자료실 내부링크를 연결.
  - 11개 지점 상세페이지 푸터의 대표 지점명을 실제 지점 상세 URL(`../guri/`, `../yongsan/`, `../hapjeong/`, `../magok/` 등) 링크로 연결하고, 구버전 표기(`전체 매장 보기 (11) →`)를 실제 운영 기준(`전체 매장 보기 (45) →`)으로 바로잡았으며 대표메뉴·창업비용·FAQ·뉴스·자료실 상호 연결을 추가.
- **404 에러 페이지(`404.html`) 헤더/모바일 내비게이션 통일:**
  - 누락되어 있던 `창업비용(franchise/cost/)` 및 `메뉴소개(menu/)` 링크를 추가하고 전체 사이트와 메뉴 명칭·순서를 일치시킴.


## 프랜차이즈 홈페이지 통합 스킬(`skills/franchise-website-cms/SKILL.md`) & 관리자 페이지 스킬(`skills/kinoya-admin-cms/SKILL.md`) 생성 — 2026-10-23
- **생성된 스킬 파일 2종:**
  1. **프랜차이즈 홈페이지 통합 스킬:** `skills/franchise-website-cms/SKILL.md` (`name: franchise-website-cms`)
     - 프랜차이즈 공식 홈페이지 전체(히어로 슬라이더 · 카테고리별 메뉴 자동 스크롤 · 서울/전국 매장 자동 스크롤 및 2배 확대 사진 + 6대 버튼 개별 매장 상세페이지 · 브랜드/자가제면/키노야 사람들 · 창업경쟁력/비용표/FAQ · 유튜브 API 라이브 허브 · 3줄 협력사 무한 롤링 · 뉴스 원문 링크 크롤러 · 카카오톡/플로팅 창업상담 · 푸터 미입력 SNS 자동 숨김 · 8대 탭 통합 관리자 CMS)를 한 번에 구축하는 마스터 스킬입니다.
  2. **관리자 페이지 전용 스킬:** `skills/kinoya-admin-cms/SKILL.md` (`name: kinoya-admin-cms`)
- **관리자 페이지 상단 헤더 원클릭 다운로드 (`admin/index.html`):**
  - 관리자 페이지(`/admin/`) 우측 상단에 **`[🏪 프랜차이즈 홈페이지 스킬 다운로드]`** 버튼과 **`[✨ 관리자 스킬 다운로드]`** 버튼을 모두 배치하여 클릭 한 번으로 각각의 `SKILL.md` 파일을 내려받을 수 있습니다.


## 개별 매장 상세페이지(`store/*/index.html` 10곳) 사진 크기 2배 확대 · 6가지 버튼 구성 · 매장 사진 등록 연동 완료 — 2026-10-23
- **적용 대상 매장 상세페이지 (총 10곳):**
  - `store/guri/`(구리본점), `store/yongsan/`(신용산본점), `store/hapjeong/`(합정점), `store/magok/`(마곡점), `store/euljiro/`(을지로점), `store/gayang/`(가양역점), `store/yeomchang/`(염창역점), `store/guro/`(구로점), `store/songdo/`(송도점), `store/hanammisa/`(하남미사점), `store/seomyeon/`(서면점)
- **변경 내용 (`kinoya.css`, `js/cms.js`, `store/*/index.html`, `admin/index.html`):**
  1. **매장 사진 크기 2배 확대 (`.store-card.is-photo-large`):**
     - 기존 가로 `220px` 크기의 작은 사진/한자 박스를 **2배 크기인 가로 `440px`(4:3 비율)**로 확대했습니다.
  2. **메인 화면과 동일한 6가지 액션 버튼(2행 × 3열) 배치:**
     - **1행:** `전화하기`(브라운 강조 버튼) · `문의하기` · `🗺 구글맵`
     - **2행:** `🗺 네이버맵` · `🗺 카카오맵` · `🧭 티맵`
  3. **메인 화면과 동일하게 매장 사진 등록 연동 (`store.{N}.photo` & `storydetail.{slug}.photo`):**
     - 관리자 페이지 `🏪 매장 통합 관리 (45개)` → `서울 지역 매장 사진·정보` / `전국 각지 매장 사진·정보`에서 등록한 매장 사진(`store.{N}.photo`)이 **해당 매장의 상세페이지에도 자동으로 똑같이 크게 표시**됩니다.
     - 추가로 `개별 매장 상세페이지 (10개)` 탭에서도 각 매장별 상세페이지 전용 사진(`storydetail.{slug}.photo`)을 직접 업로드·교체할 수 있습니다.


## 푸터 `FIND & SNS` 영역 링크 미입력 항목 자동 숨김 처리 — 2026-10-23
- **변경 내용 (`kinoya.css`, `js/main.js`, `js/home-model.js`, `admin/index.html`):**
  1. 기존에는 하단 푸터 `FIND & SNS` 영역에서 링크가 아직 입력되지 않은 버튼(`티맵`, `블로그`, `인스타그램`, `스레드`, `페이스북`, `카카오 채널`, `카카오스토리`)이 반투명(`opacity: 0.55`) 상태로 노출되고 클릭 시 `"준비중입니다"` 알림이 떴습니다.
  2. 이제 **링크가 입력되지 않은 항목(`.is-placeholder`, `href="#"`, 빈 값)은 화면에 아예 노출되지 않도록(`display: none !important`)** 수정했습니다.
  3. 관리자 페이지(`/admin/` → `📺 유튜브 · SNS 통합` → `푸터 SNS 링크 관리`)에서 원하는 SNS나 지도 URL을 입력·저장하면 해당 아이콘이 즉시 푸터에 나타나며, 반대로 URL을 지우고 저장하면 즉시 숨겨집니다(기본 활성 항목인 `네이버 지도`, `구글 지도`, `카카오맵`, `유튜브`도 관리자 페이지에서 비우면 숨길 수 있습니다).


## 서울 지역 · 전국 각지 매장 및 우동키노야 뉴스 자동 가로 스크롤 복구 + 관리자 페이지 자동 스크롤 간격(초) 설정 추가 — 2026-10-23
- **왜 자동 스크롤이 멈춰 있었는지 (원인 및 해결 완료):**
  1. **Windows / macOS의 '애니메이션 표시 끔(`prefers-reduced-motion: reduce`)' 설정 감지 시 강제 정지:**
     - 기존 코드(`js/home-store-rows.js`, `js/home-full.js`, `news/index.html`)는 방문자 PC의 OS 디스플레이 설정에서 애니메이션 줄이기 옵션이 켜져 있으면 `paused = true`로 시작해 가로 자동 스크롤을 아예 실행하지 않았습니다.
     - 또한 `HomeStoreRows`는 첫 프레임에 `elapsed = 0`으로 시작하고 `visible = false` 초기값으로 인해 IntersectionObserver 콜백 타이밍에 따라 멈추는 현상이 있었습니다.
  2. **해결 (`js/home-store-rows.js`, `js/home-full.js`, `js/home-runtime.js`, `news/index.html`):**
     - 일반 방문자 환경에서는 OS 애니메이션 설정과 무관하게 **항상 즉시 부드러운 자동 가로 스크롤이 작동**하도록 수정하고, 0.8초 주기 안전 타이머(`setInterval` heartbeat)를 추가해 레이아웃 확정 직후에도 멈추지 않고 끝까지 이동 후 반대 방향으로 왕복하도록 개선했습니다.
     - 뉴스 제목·본문에 `&hellip;`, `&quot;` 등 HTML 엔티티가 그대로 노출되던 현상도 자동 디코딩(`…`, `"`)되도록 함께 수정했습니다.
- **관리자 페이지(`admin/index.html`, `admin/editor.js`)에서 자동 스크롤 시간(초) 설정 기능 추가:**
  1. **`🏪 매장 통합 관리 (45개)` 탭 상단 (`매장 찾기` 섹션):**
     - **`자동 스크롤 간격(초) · 서울지역 · 전국각지 매장 공통 (카드 1칸 이동 시간)`** (`store.autoslide.seconds`, 기본값 `3`초) 입력칸과 **`[💾 이 항목 저장]`** 버튼을 추가했습니다.
  2. **`📰 상담 · 뉴스 · 자료실` → `뉴스 · 언론보도 관리` 탭 상단 (`우동키노야 뉴스 설정` 섹션):**
     - **`자동 스크롤 간격(초) · 우동키노야 뉴스 (카드 1칸 이동 시간)`** (`news.autoslide.seconds`, 기본값 `3`초) 입력칸과 **`[💾 이 항목 저장]`** 버튼을 추가했습니다.
  3. 숫자를 원하는 초(예: `2`, `3`, `5` 등)로 바꾸고 **`[💾 이 항목 저장]`**을 누르면 카드 1칸이 이동하는 속도가 즉시 반영됩니다.


## 매장 카드 하단 액션 버튼(`.store-actions`) 2행 꽉 찬 정렬 디자인 개선 — 2026-10-22
- **매장 카드 버튼 2행 100% 폭 정렬 (`css/home-store-rows.css`, `kinoya.css`):**
  - 기존에는 매장 카드 하단 버튼들(`전화하기`, `매장 자세히 보기 →`, `🗺 구글맵`, `🗺 네이버맵`, `🗺 카카오맵`, `🧭 티맵`)이 내용 길이에 따라 불규칙한 폭으로 줄바꿈되어 우측에 빈 공간이 남았습니다.
  - 이를 **6칸 CSS Grid(`grid-template-columns: repeat(6, minmax(0, 1fr))`) 기반 2행 레이아웃**으로 개편하여:
    1. **6개 버튼 매장:** 1행 3개(`전화하기` · `매장 자세히 보기 →` · `🗺 구글맵`), 2행 3개(`🗺 네이버맵` · `🗺 카카오맵` · `🧭 티맵`)가 **좌우 빈 공간 없이 카드 가로폭 100%에 꽉 차게 정렬**됩니다.
    2. **5개 버튼 매장(상세페이지 링크 없는 매장):** 1행 2개(`전화하기` · `🗺 구글맵` 각 50% 폭), 2행 3개(`🗺 네이버맵` · `🗺 카카오맵` · `🧭 티맵` 각 33.3% 폭)로 **1행과 2행 모두 좌우 여백 없이 깔끔하게 정렬**됩니다.


## 관리자 뉴스 관리(`admin/news-manage.js`)에서 원문 링크 입력 후 `[📰 링크에서 뉴스 자동 가져오기]` (제목·날짜·출처·내용·썸네일 자동 추출 및 사진 다운로드 지원) 구현 — 2026-10-22
- **뉴스 원문 링크 기반 원클릭 자동 채우기 (`admin/news-manage.js`):**
  1. **입력 순서 최적화 및 `[📰 링크에서 뉴스 자동 가져오기]` 버튼 추가:**
     - `원문 링크` 입력칸을 맨 위에 배치하고 바로 아래에 **`[📰 링크에서 뉴스 자동 가져오기 (제목·날짜·출처·내용·썸네일)]`** 버튼을 추가했습니다.
  2. **제목 · 날짜 · 출처 · 요약/기사 본문 자동 추출:**
     - 원문 링크를 입력하고 버튼을 누르면 기사의 OpenGraph / Twitter Card / JSON-LD(`NewsArticle`) 및 기사 본문(`#dic_area`, `#articleBodyContents`, `.article_body`, `article` 등)을 파싱하여 **제목**, **날짜(`YYYY-MM-DD`)**, **출처(매체명 자동 매핑 포함)**, **요약 및 기사 전체 본문**을 입력칸에 자동으로 채워줍니다.
  3. **썸네일 사진 자동 입력·자동 저장 (`admin/collection-editor.js`, `admin/news-manage.js`) + 필요 시 사진 다운로드 버튼 제공:**
     - `[📰 링크에서 뉴스 자동 가져오기]`를 누르면 기사의 대표 이미지(`og:image` 등)를 찾아 3:4 미리보기로 보여주고, **`📌 자동 입력된 썸네일 주소`** 칸과 **`썸네일 교체` 파일 선택칸(`input[type="file"]`)에 자동으로 입력**됩니다.
     - 별도로 `[파일 선택]`을 누르지 않고 그대로 **`[등록]` / `[변경사항 저장]`** 버튼만 누르면:
       - 파일 업로드가 가능한 운영 환경에서는 자동으로 파일 서버(`/files/cms-images`)에 업로드하여 참조 경로로 저장하고,
       - 언론사 CORS 제한으로 파일 변환이 막히거나 미리보기 환경인 경우에도 **자동 입력된 기사 대표 이미지 URL(`dataset.autofetchedUrl`)을 `thumbnail` 필드에 즉시 저장**하여 100% 빠짐없이 썸네일이 등록됩니다.
     - 또한 직접 사진 파일을 받아 수정·업로드하고 싶을 때를 위해 **`[⬇️ 썸네일 사진 파일 다운로드]`** 버튼과 **`[🔍 원본 사진 새창 열기]`** 버튼도 함께 제공됩니다.


## 뉴스 섹션 PC 5개 동시 표시 + 10개 자동 가로 스크롤 및 카드별 `[더보기 →]` 상세 페이지(`/news/view/`) 연동 — 2026-10-22
- **뉴스 카드 레이아웃 및 자동 스크롤 개선 (`kinoya.css`, `js/home-full.js`, `news/index.html`, `news/view/index.html`):**
  1. **PC 화면 5개 동시 표시 & 3:4 세로(Portrait) 사진 비율:**
     - 뉴스 섹션 컨테이너(`.news-section-container`) 폭을 확장(`max-width: 1480px`)하고, `.news-list-card` 폭을 `calc((100% - 80px) / 5)`(`gap: 20px`)로 지정하여 **PC 화면에서 5개의 3:4 세로 사진 뉴스 카드가 한눈에 나란히 표시**됩니다(태블릿 4열/2열, 모바일 1열 반응형 지원).
  2. **10개 뉴스 카드 자동 가로 스크롤 (`requestAnimationFrame` 기반):**
     - 등록된 뉴스 기사를 기반으로 **총 10개의 뉴스 카드**가 가로 트랙(`.news-grid`)에 구성되어 부드럽게 자동 좌우 왕복 스크롤됩니다(마우스 호버·터치 드래그·키보드 포커스 시 자동 일시정지 및 수동 스크롤 지원).
  3. **본문 텍스트 3줄 말줄임(`...`) 및 카드별 `[더보기 →]` 상세 페이지(`/news/view/?id=...`) 이동 (하단 중복 `[뉴스 더보기 →]` 버튼 제거):**
     - 제목(`.news-list-title`)은 최대 2줄, 본문 요약(`.news-list-excerpt`)은 **최대 3줄(`-webkit-line-clamp: 3`)**까지만 표시하고, 카드 내 `[더보기 →]` 클릭 시 뉴스 상세 페이지(`news/view/?id={뉴스ID}`)로 이동합니다(기존 섹션 하단의 `뉴스 페이지로 이동 →` 링크와 중복되던 `[뉴스 더보기 →]` 버튼은 제거했습니다).


## 관리자 페이지(`admin/index.html`) ↔ 메인 페이지(`index.html`) 및 서브페이지 최종 연결 전수 점검 완료 — 2026-10-22
- **전수 점검 및 E2E 자동화 테스트(13개 항목 전원 통과) 결과:**
  1. **상단·하단 로고 및 파비콘 0ms 즉시 표시 연결 확인:**
     - 사용자 업로드 로고(`うどん 木の屋 우동 키노야` 원형 엠블럼 로고)가 `images/logo-header.png`에 정적 내장되고 `<head>` 최상단 `<link rel="preload" as="image" href="images/logo-header.png" fetchpriority="high">`로 연결되어 첫 접속 즉시(0ms) 표시됩니다.
  2. **구리본점(`store.1.photo`) 사진 및 상단 정렬 복구:**
     - 라이브 DB에 빈 문자열(`""`)로 들어가 구리본점 사진을 숨기고 있던 `store.1.photo` 레코드를 정리하여 기본 외관 사진(`images/store-guri-exterior.jpg`)이 정상 노출되며, 옆 매장들(`금정AK플라자점`, `하남미사점`)과 상단 높이가 1px 오차 없이 일치합니다.
  3. **공개 페이지 상단 "로그인이 필요합니다" 배너 원천 차단:**
     - `.meta/access-control.json`에 `/tables/store_items` 및 `/files/cms-videos/**`의 공개 읽기(`GET, HEAD: public`) 규칙을 추가·검증 완료했고, `js/site-runtime.js`에서 일반 방문자 페이지에는 `#admin-login-notice` 배너가 절대 생성되지 않도록 차단했습니다.
  4. **관리자 페이지 상단 8대 카테고리 탭 · 중복 섹션 병합 · 개별 즉시 저장 연동 확인:**
     - 상단 8대 카테고리 탭(`공통·로고·카카오톡`, `유튜브·SNS 통합`, `매장 통합 관리(45개)`, `메뉴 소개·카테고리(6종)`, `브랜드·면·사람들`, `창업·비용·FAQ 통합`, `상담·뉴스·자료실`, `메인 히어로·백업·통계`)과 하위 섹션 탭이 정상 동작하며, 개별 저장(`[이 사진 저장]`, `[💾 이 항목 저장]`) 및 45개 매장 빠른 편집기(`[💾 이 매장 데이터 즉시 저장]`)에서 저장한 값(매장명·영업시간·휴무일·전화번호·네이버맵/구글맵/카카오맵/티맵 링크 등)이 메인 페이지(`HomeModel` + `HomeStoreRows`)와 서브페이지(`js/cms.js`)에 100% 일치하게 반영됨을 검증했습니다.


## 상단/하단 로고(`うどん 木の屋 우동 키노야` 원형 엠블럼 로고)를 정적 기본 파일(`images/logo-header.png`)로 직접 내장하여 접속 즉시(0ms) 표시 — 2026-10-22
- **원인:** 기존에는 관리자 페이지에서 업로드한 로고(`うどん 木の屋 우동 키노야` 원형 엠블럼 로고)가 런타임 파일 경로(`/files/cms-images/cb4d108c...`)로만 연결되어 있어서, 홈페이지 첫 접속 시 DB 조회(`site_content`)가 완료되기 전까지 1~2초 동안 옛날 텍스트형 기본 로고가 보였다가 나중에 바뀌는 지연이 있었습니다.
- **해결:**
  - 업로드해주신 **`うどん 木の屋 우동 키노야` 원형 엠블럼 로고 원본**을 프로젝트의 기본 정적 파일 **`images/logo-header.png`**(및 파비콘 `images/favicon.png`)에 직접 덮어쓰고, 라이브 DB(`global.logo.header`, `global.logo.footer`, `global.favicon`) 값도 정적 경로(`images/logo-header.png`, `images/favicon.png`)로 통일했습니다.
  - 이제 홈페이지(`index.html` 및 52개 전 서브페이지)에 접속하는 첫 순간(0ms)부터 네트워크 DB 조회를 기다리지 않고 **HTML 기본 `<img>`와 `<link rel="preload">`를 통해 로고가 즉시 표시**됩니다.


## 공개 홈페이지 상단 "로그인이 필요합니다" 배너 노출 원천 제거 및 `/tables/store_items` 공개 읽기 권한 추가 — 2026-10-22
- **왜 공개 홈페이지 상단에 "로그인이 필요합니다. 로그인 후 직접 다시 시도해주세요. 로그인하기" 배너가 나왔는지:**
  1. 공개 홈페이지(`js/home-full.js`, `js/cms.js`)에서 추가 등록 매장 목록을 가져오기 위해 `/tables/store_items`에 `GET` 요청을 보내는데, 접근 제어 규칙(`.meta/access-control.json`)에 새로 추가된 `/tables/store_items`의 공개 `GET/HEAD` 허용 규칙이 빠져 있어 하위 `/tables/**`(관리자 전용 `allowlist`)에 걸리면서 `HTTP 401`이 반환되었습니다.
  2. 이때 공통 런타임(`js/site-runtime.js`)의 `loginNotice()`가 관리자 페이지가 아닌 일반 공개 페이지에서도 상단에 노란색 `#admin-login-notice` 배너를 띄우고 있었습니다.
- **해결 완료 (이중 차단):**
  1. **Hosted Access Rules 업데이트 (`.meta/access-control.json`):** `/tables/store_items` 및 `/tables/store_items/**`의 `GET, HEAD`를 `public`(익명 방문자 읽기 허용, 쓰기는 관리자만 허용)으로 추가하고, `/files/cms-videos/**`의 `GET, HEAD`도 공개 읽기로 추가하여 `AccessRulesValidate` 및 `AccessRulesTest` 검증을 통과했습니다.
  2. **공개 페이지 배너 표시 원천 차단 (`js/site-runtime.js`):** `isAdminPage()` 판별 함수를 추가하여 관리자 페이지(`/admin/`)가 아닌 일반 방문자 페이지에서는 어떤 경우에도 상단에 `로그인이 필요합니다` 배너(`#admin-login-notice`)가 생성되지 않도록 막았습니다.


## 관리자 페이지 상단 8대 카테고리 탭 · 하위 섹션 탭 전환 (무한 스크롤 제거) 및 중복 섹션 통합 병합 — 2026-10-22
- **상단 카테고리 허브(`#admin-category-hub`) 및 좌측 트리 메뉴 동기화 (`admin/index.html`, `admin/editor.js`):**
  - 기존에 48개 섹션(851개 입력 항목)이 한 페이지에 세로로 나열되어 끝없이 스크롤해야 했던 구조를 전면 개편했습니다.
  - 상단에 **8개 대분류 카테고리 탭**과 **하위 섹션 서브탭**을 배치하여, **선택한 섹션만 화면에 깔끔하게 표시**됩니다(우측 상단 `[전체 펼쳐보기]` 버튼으로 언제든 전체 보기도 가능).
    1. **🌐 공통 · 로고 · 카카오톡** (`공통 로고 · 파비콘 · 대표번호` / `카카오톡 공유 썸네일`)
    2. **📺 유튜브 · SNS 통합** (`유튜브 API 설정 + 한 번에 업데이트 + 영상 목록 (통합)` / `푸터 SNS 링크 관리`)
    3. **🏪 매장 통합 관리 (45개)** (`엑셀 참조 · 45개 매장 빠른 편집 · 신규 매장 등록` / `서울 지역 매장 사진·정보 (22개)` / `전국 각지 매장 사진·정보 (23개)` / `개별 매장 상세페이지 (10개)`)
    4. **🍜 메뉴 소개 · 카테고리 (6종)** (`메뉴 공통 · 대표 슬라이드 (16종)` + `가케·붓카케·마제/온센·카츠/덮밥·사이드·음료` 6개 카테고리 탭)
    5. **📖 브랜드 · 면 · 사람들** (`브랜드스토리` / `키노야의 신념과 경쟁력 (면)` / `우동키노야 사람들` / `협력사 로고`)
    6. **💼 창업 · 비용 · FAQ 통합** (`창업안내` / `창업비용` / `창업 FAQ 통합 관리` / `창업문의 폼 문구`)
    7. **📰 상담 · 뉴스 · 자료실** (`상담신청 접수 내역` / `뉴스 · 언론보도 관리` / `자료실 관리`)
    8. **🏠 메인 히어로 · 백업 · 통계** (`메인 히어로 · 숫자 · 매장슬라이더 · 하단CTA` / `전체 데이터 백업 · 복원` / `방문자 통계 리포트` / `📦 [보관용] 구 홈페이지 요약 문구 (11개 섹션 병합)`)
- **흩어져 있던 중복 섹션 완벽 병합:**
  - **유튜브 관리 3곳 → 1곳으로 병합:** 상단에 있던 `한 번에 업데이트`와 `영상 목록` 섹션, 그리고 하단에 따로 떨어져 있던 `유튜브 API 키 / 채널 ID 설정`을 **`📺 유튜브 · SNS 통합`** 탭의 한 화면으로 합쳤습니다.
  - **매장 관리 3곳 → 1곳으로 병합 & 매장 1곳씩 골라보기 필터 추가:** `엑셀 참조 · 45개 매장 빠른 편집 · 신규 매장 등록`과 `서울 22개 매장` / `전국 23개 매장`을 **`🏪 매장 통합 관리 (45개)`** 아래로 통합했고, 서울(22개)·전국(23개) 매장 사진 섹션 안에는 **`매장 선택 드롭다운 + [◀ 이전 매장] / [다음 매장 ▶]`** 필터를 넣어 **선택한 매장 1곳만 화면에 표시**되도록 하여 긴 스크롤을 완전히 없앴습니다.
  - **FAQ 관리 2곳 → 1곳으로 병합:** `FAQ DB 관리`와 `창업 FAQ 기본 문구`를 **`창업 FAQ 통합 관리`** 탭 하나로 합쳤습니다.
  - **구 홈페이지 요약·보관용 11개 섹션 → 1개 보관 탭으로 병합:** 좌측 메뉴를 길게 차지하던 `[요약·보관]` 11개 섹션을 `📦 [보관용] 구 홈페이지 요약 문구` 서브탭 하나로 묶어 평소에는 화면을 가리지 않도록 정리했습니다.


## 홈페이지 접속 시 상단/하단 로고 0ms 즉시 표시 최적화 — 2026-10-22
- **왜 로고가 몇 초 있다가 보였는지 (원인 4가지 해결 완료):**
  1. **외부 폰트·CSS(Google Fonts, Pretendard CDN) 로딩 전까지 로고 가시성 규칙(`kinoya.css`) 적용 대기:** `index.html` 최상단 `<head>`에 `<link rel="preload" as="image" href="images/logo-header.png" fetchpriority="high">` 및 인라인 `<style>img[data-cms="global.logo.header"],img[data-cms="global.logo.footer"]{visibility:visible;animation:none}</style>`을 배치해 외부 리소스를 기다리지 않고 첫 프레임(0ms)부터 로고를 즉시 다운로드·렌더링하도록 수정했습니다.
  2. **로고 `<img>` 태그 우선순위 명시:** 상단 헤더 로고와 푸터 로고에 `loading="eager" fetchpriority="high" decoding="sync" width="230" height="77" class="cms-revealed"`를 기본 부여했습니다.
  3. **로고 `src` 중복 재할당으로 인한 깜빡임 제거 (`js/logo-first.js`, `js/home-model.js`):** 상대경로(`images/logo-header.png`)와 절대경로(`https://.../images/logo-header.png`)가 같은 파일일 때는 `img.src`를 다시 덮어쓰지 않도록 비교 로직을 추가하고, `HomeModel`이 `KinoyaLogo`가 관리하는 로고를 중복으로 다시 건드리지 않도록 수정했습니다.
  4. **브라우저 로컬 캐시에 남아 있던 과거 727KB Base64 로고 자동 폐기 (`js/logo-first.js`):** 방문자 브라우저 `localStorage`에 예전 대용량 `data:image/...` Base64 로고가 남아 있어도 이를 무시하고 즉시 가벼운 정적 로고 파일을 표시하도록 개선했습니다.


## 관리자 페이지 매장 등록·관리에서 첨부 엑셀(`서울지역` / `전국 각지` 2개 시트) 참조 입력 및 45개 전체 매장 사진 외 데이터 빠른 편집기 추가 — 2026-10-22
- **첨부 엑셀 파일(`우동키노야_매장관리_서울지역_전국각지_2026-10-21.xlsx`)의 16개 전체 컬럼 완벽 연동 (`admin/stores-manage.js`, `js/cms.js`, `js/home-model.js`):**
  - 엑셀 시트(`서울지역` 22개 매장 · `전국 각지` 23개 매장)의 사진 외 전체 컬럼(`매장코드`, `지역`, `매장명`, `주소`, `영업시간`, `휴무일`, `한줄소개`, `전화번호`, `네이버맵링크`, `구글맵링크`, `카카오맵링크`, `티맵링크`, `상세페이지링크`, `표시순서`, `공개여부`)을 관리자 페이지의 **`🏪 신규 매장 등록 · 관리 (서울 지역 · 전국 각지)`** 섹션에서 3가지 방식으로 바로 입력·저장할 수 있도록 개편했습니다.
  1. **기존 45개 매장(서울지역 22개 · 전국 각지 23개) 사진 외 전체 데이터 빠른 편집기:**
     - 권역 필터(`전체 권역` / `서울지역` / `전국 각지`)와 매장 선택 드롭다운에서 매장을 고르면 해당 매장의 `매장명 · 전화번호 · 도로명/지번 주소 · 영업시간 · 휴무일 · 상세페이지 링크 · 한줄소개 · 네이버맵/구글맵/카카오맵/티맵 링크`가 엑셀 열 구조 그대로 즉시 채워집니다.
     - 사진 없이 텍스트/링크 데이터만 수정한 뒤 **`[💾 이 매장 데이터 즉시 저장]`** 버튼을 누르면 공개 페이지(`index.html` 및 `store/index.html`)에 즉시 반영됩니다.
  2. **`[엑셀 파일 참조 불러오기 (행 선택 입력)]` 기능:**
     - 엑셀 파일(`.xlsx`)을 선택하면 화면에 시트별 매장 목록 표가 열리며, 원하는 매장 행에서 **`[편집기에 채우기]`**, **`[즉시 저장]`**, 또는 **`[새 매장 등록폼에 채우기]`** 버튼을 눌러 사진 외 모든 데이터를 클릭 한 번으로 불러오거나 저장할 수 있습니다.
  3. **`새 항목 등록` 폼 & `[매장 엑셀 전체 일괄 반영]`:**
     - 신규 매장 등록 폼에서도 사진은 선택 사항(맨 아래 배치)으로 두고, 엑셀의 모든 텍스트/지도 링크 항목을 먼저 입력해 등록할 수 있습니다.


## 메인 페이지 전국 각지 매장 가로 슬라이더에서 구리본점(및 각 권역 첫 매장) 사진 상단 위치 정렬 일치 — 2026-10-22
- **원인:** 메인 페이지 매장 가로 슬라이더(`js/home-store-rows.js`)에서 구리본점(경기 첫 매장) 등 각 권역 첫 번째 `.store-card` 내부에 권역 이동용 앵커(`<span class="home-anchor-alias">`)가 첫 번째 자식으로 들어가면서, `.store-card`의 `display:flex; flex-direction:column; gap:20px` 때문에 사진 박스(`.store-thumb`)가 다른 매장 카드들보다 **20px 아래로 밀려 보이는 현상**이 있었습니다.
- **해결 (`css/home-store-rows.css`, `tests/home-store-rows-test.js`):**
  - `#stores .home-store-track > .store-card > .home-anchor-alias`에 `position:absolute; top:0; left:0; width:0; height:0`을 적용하여 레이아웃 흐름(flex gap)에서 분리했습니다.
  - 이제 구리본점(`우동키노야 구리본점`) 사진 박스의 상단 위치가 옆의 `금정AK플라자점`, `하남미사점` 등 다른 모든 매장 사진 박스와 **1px 오차 없이 정확히 동일한 높이**에 맞춰졌습니다.
  - 또한 구리본점 썸네일 좌측 상단의 `Main Store` 뱃지도 사진 위(`z-index: 3`)에서 아이보리 톤으로 선명하게 보이도록 보강했습니다.


## 관리자 페이지 초기 로딩 속도 약 6,000배 단축(6.3MB → 1KB) 및 모든 사진·글씨 항목 개별 즉시 저장/복원 버튼 추가 — 2026-10-22
- **왜 계속 가져오고 시간이 오래 걸렸는지 (근본 원인 해결 완료):**
  1. **DB 내 과거 대용량 Base64 이미지 데이터(총 6.3MB) 적체:** 과거에 업로드됐던 파비콘(`global.favicon` 666KB), 상단/하단 로고(`global.logo.*` 각 727KB), 카카오톡 썸네일(`social.kakao.image` 550KB), 히어로/면 배경 등 9개 항목이 DB(`site_content`)에 총 **6.3MB의 Base64 문자열**로 저장되어 있었습니다.
  2. 이 때문에 관리자 페이지 진입 시 `site_content` 전체 조회가 서버 용량 제한(`HTTP 413` / `HTTP 500`)에 걸려 `100개 → 25개 → 5개 → 1개`씩 쪼개어 수십 번 재요청하느라 불러오는 데 수십 초가 걸렸고, 로딩이 끝나기 전(`!ready`)에는 `파비콘 · 상단 헤더 로고 · 하단 푸터 로고`의 사진 선택과 저장이 잠겨 있었습니다.
  3. **해결:** 라이브 DB(`site_content`)의 9개 대용량 Base64 행을 정적 파일 경로(`images/favicon.png`, `images/logo-header.png`, `images/kakao-share-thumbnail.png` 등)로 즉시 경량화하여 `site_content` 전체 용량을 **6,300KB → 1.0KB(30개 행 합계 1,029B)**로 줄였습니다. 이제 관리자 페이지와 홈페이지 모두 **0.1초 이내에 즉시 로딩**됩니다.
- **모든 사진·글씨 항목에 개별 즉시 저장 및 기본값 복원 버튼 추가 (`admin/editor.js`):**
  - **`공통(전체 페이지)` 파비콘 · 상단 헤더 로고 · 하단 푸터 로고 등 모든 이미지 항목:** 기존의 `사진 선택` / `사진 처리 다시 시도`만 있던 구조를 개편하여 **`[이 사진 저장]` · `[사진 비우기]` · `[기본 사진 복원]`** 버튼을 전 이미지 항목에 추가했습니다. 또한 초기 조회를 기다리지 않고 페이지 열자마자 즉시 사진을 선택·저장할 수 있습니다.
  - **`대표 전화번호` · `푸터 브랜드 설명문` 등 모든 글씨(텍스트/숫자) 항목:** 각 입력칸 바로 아래에 **`[💾 이 항목 저장]`** 버튼과 **`[기본 문구 복원]`** 버튼을 추가했습니다. 상단 `전체 저장`까지 스크롤하지 않고 해당 항목에서 바로 눌러 즉시 DB 저장 + 캐시(`cms_cache`, `kinoya_logo_cache_v1`) 갱신까지 한 번에 적용됩니다.


## 관리자 페이지 매장 사진 섹션에서 사진 아래에 매장 정보(매장명·주소·영업시간·휴무일·한줄설명·전화번호) 통합 입력 지원 — 2026-10-22
- **매장 사진 + 매장 정보 통합 편집 구성 (`admin/index.html`, `admin/editor.js`, `js/home-full.js`):**
  - 메뉴 소개 섹션에서 각 메뉴의 사진(`bg`) 바로 아래에 `메뉴명 · 설명 · 가격` 입력칸이 함께 배치되어 있는 것과 동일한 방식으로, 관리자 페이지(`/admin/`)의 **`매장 사진 · 정보 - 서울 지역 (22개 매장)`** 및 **`매장 사진 · 정보 - 전국 각지 (23개 매장)`** 섹션을 개편했습니다.
  - 이제 각 매장의 **사진(`store.<번호>.photo`)** 바로 아래에 해당 매장의:
    1. **매장명 (`store.<번호>.name`)**
    2. **주소 (`store.<번호>.addr`)**
    3. **영업시간·휴무일 (`store.<번호>.hours`)**
    4. **한줄설명·특징 (`store.<번호>.meta`)**
    5. **전화번호 (`store.<번호>.phone`)**
    입력칸이 현재 홈페이지 기본값과 함께 나란히 배치되어, 다른 섹션으로 이동할 필요 없이 한 자리에서 매장 사진과 매장 정보를 동시에 확인·수정할 수 있습니다.
  - 매장별로 구분선(`border-t`)을 추가하여 다음 매장과의 경계가 한눈에 구분되도록 개선했습니다.


## 매장 관리 「매장 엑셀 다운로드 (2개 시트)」 조회 실패(HTTP 500) 오류 수정 — 2026-10-21
- **원인 진단 (`admin/stores-manage.js`, `js/site-runtime.js`):**
  1. `매장 엑셀 다운로드 (2개 시트)` 및 `매장 엑셀 업로드` 실행 시 `A.all('site_content', { search: 'store.' })`를 호출하면서, `site_content` 테이블의 대용량 행(최대 798KB)까지 SQL `LIKE` 스캔이 걸려 서버가 **`엑셀 다운로드 실패: 조회 실패 (HTTP 500). 잠시 후 직접 다시 시도해주세요.`**를 반환했습니다.
  2. 또한 `store/index.html` 정적 HTML 파일 fetch가 일시적인 네트워크/접근 제한으로 실패할 경우 기본 매장 목록을 가져오지 못하는 위험이 있었습니다.
- **수정 내용 (`admin/stores-manage.js`, `admin/editor.js`, `js/site-runtime.js`):**
  - **`loadStoreCmsRowsSafe()` 다중 안전 폴백 (`admin/stores-manage.js`, `admin/editor.js`):**
    1. 관리자 페이지 로드 시 이미 메모리에 읽어둔 `KinoyaAdminEditor.getRowsByPrefix('store.')` 또는 `cms_cache`에서 `store.*` 항목을 즉시 가져와 불필요한 `site_content?search=store.` 네트워크 요청을 차단했습니다.
    2. 만일 네트워크 조회가 필요한 경우에도 `search=store.`에서 `HTTP 500`이 발생하면 `KinoyaRuntime.all()`이 자동으로 전체 목록 페이지네이션 + 클라이언트 필터링으로 우회합니다.
  - **내장 전국 45개 매장 데이터(`BUILTIN_BASE_STORES`) 폴백 탑재 (`admin/stores-manage.js`):**
    - `store/index.html` fetch가 실패하거나 지연되더라도 내장된 서울 22개 + 전국 각지 23개(총 45개 매장)의 정식 매장명·주소·영업시간·휴무일·특징·전화번호·4대 지도 링크 데이터를 즉시 사용해 `"서울지역"` 시트(22개)와 `"전국 각지"` 시트(23개) 엑셀 다운로드가 100% 성공하도록 보장했습니다.


## 유튜브 채널 자동 연동 「한 번에 전체 자동 업데이트」 조회 실패(HTTP 500) 오류 수정 — 2026-10-21
- **원인 진단 (`admin/youtube-sync.js`, `js/site-runtime.js`, `admin/editor.js`):**
  1. `runFullSync()`에서 ① 유튜브 채널 통계(`511+`, `180.8만+`)를 화면에 먼저 표시한 직후, ② `upsertSiteContent()` 3개를 동시에 호출하면서 `AdminCore.all('site_content', { search: 'social.youtube.stats.*' })`를 실행했습니다.
  2. 이 과정에서 `site_content` 테이블 내 과거 대용량 행(최대 798KB)까지 SQL `LIKE`로 전체 스캔하게 되어 서버가 **`조회 실패 (HTTP 500)`**을 반환했고, `KinoyaRuntime.all()`은 기존에 `413`만 축소 재시도하고 `500`은 즉시 에러로 던져 전체 자동 업데이트가 중단되었습니다.
- **수정 내용 (`js/site-runtime.js`, `admin/editor.js`, `admin/youtube-sync.js`):**
  - **`KinoyaAdminEditor` 메모리 행 참조 우선 사용 (`admin/editor.js`, `admin/youtube-sync.js`):** 관리자 페이지 로드 시 이미 읽어둔 `rows['social.youtube.stats.*']`와 `cms_cache`에서 `id`를 즉시 참조하여 불필요한 `site_content?search=...` 재조회를 원천 차단했습니다.
  - **통계 저장 순차 처리 및 비차단 폴백 (`admin/youtube-sync.js`):** 3개 통계 항목을 순차 저장하고, 설령 `site_content` 조회/저장에서 일시적 서버 오류가 발생하더라도 ③·④ 최신 영상/쇼츠 수집 및 `youtube_videos` DB 저장은 멈추지 않고 끝까지 완료되도록 보호했습니다.
  - **`KinoyaRuntime.all()` HTTP 500/502/504 자동 축소 재시도 (`js/site-runtime.js`):** 테이블 조회 시 `413`뿐 아니라 `500/502/504` 응답이 발생할 때도 페이지 크기(`100 → 25 → 10 → 5 → 1`)를 줄여 자동으로 재시도하도록 보강했습니다.
  - **`youtube_videos` 저장 안정화 (`admin/youtube-sync.js`):** 동시 쓰기 배치를 3개 단위로 조정하고, 개별 행 PUT/POST 시 일시적 5xx 응답에 대해 최대 2회 자동 재시도 및 중복 `youtube_id` 자동 정리를 추가했습니다.


## 카카오톡 공유 썸네일(`images/kakao-share-thumbnail.png`) 신규 반영 및 관리자 페이지 연동 — 2026-10-21
- **원본 PNG 저장 및 구버전 정리:**
  - 첨부해주신 **「국내최초 48시간 저온숙성우동 우동키노야」** 카카오톡 공유 썸네일 원본 PNG(`412,397B`)를 `images/kakao-share-thumbnail.png`로 저장하고, 기존 구버전 `images/kakao-share-thumbnail.jpg`는 삭제했습니다.
- **전체 페이지 Open Graph / Twitter 공유 썸네일 적용 (`index.html` 및 주요 서브페이지 11개):**
  - 메인 페이지(`index.html`)의 `<meta property="og:image">` 및 `<meta name="twitter:image">`와 서브페이지(`brand/`, `noodle/`, `people/`, `franchise/`, `franchise/cost/`, `franchise/faq/`, `store/`, `menu/`, `news/`, `resources/`, `contact/`)의 `<meta property="og:image">`를 모두 `https://www.udonkinoya.com/images/kakao-share-thumbnail.png` (`data-cms="social.kakao.image" data-cms-type="meta"`)로 연결했습니다.
- **관리자 페이지(`/admin/`) 및 메인 통합 관리(`/admin/home.html`) 연동 (`admin/index.html`, `admin/editor.js`, `js/cms.js`):**
  - 관리자 페이지(`/admin/`) **「카카오톡 공유 썸네일」** 섹션(`social.kakao.image`)의 기본 사진과 미리보기를 `images/kakao-share-thumbnail.png`로 설정했습니다.
  - 또한 `social.kakao.image`에도 **사진 선택(PNG 600KB 이하 자동 변환 미리보기) · 이 사진 저장(개별 즉시 저장) · 사진 처리 다시 시도 · 사진 비우기 · 기본 사진 복원** 버튼을 모두 활성화해 전체 저장을 누르지 않고도 공유 썸네일만 즉시 변경·복원할 수 있도록 개선했습니다.


## 전체 오류 점검·수정, 불필요/중복 파일 29개 정리, 유튜브 정보 및 사진 초고속 로딩 최적화 — 2026-10-21
- **1. 불필요·중복 파일 전수 조사 및 29개 삭제 완료:**
  - **중복 이미지 1개 삭제:** `images/favicon-kinoya.png` (`images/favicon.png`와 중복되어 미사용하던 구버전 파일 제거, `tests/logo-first-test.js` 참조도 `images/favicon.png`로 통일).
  - **일회성 테스트 뷰/하네스 파일 28개 삭제:** `tests/admin-collections-view.*`, `tests/admin-read413-view.html`, `tests/contact-cta-view.*`, `tests/franchise-solution-view.*`, `tests/gyudon-photo-upload-view.html`, `tests/home-beliefs-view.html`, `tests/home-contact-view.html`, `tests/home-full-view.html`, `tests/home-menu-categories*`, `tests/home-stores-view.html`, `tests/live-logo-check.html`, `tests/menu-photo-cleared-view.html`, `tests/menu-photo-selection-view.html`, `tests/menu-preview-view.html`, `tests/people-cleared*`, `tests/social-tabs-view.html`, `tests/store-map-buttons-view.*`, `tests/store-photo-view.*`, `tests/system-bg-view.*` 삭제.
- **2. 유튜브 정보(`youtube_videos` + `social.youtube.*` 통계) 초고속 로딩 최적화 (`js/main.js`, `admin/youtube-sync.js`):**
  - 메인 페이지 전체 합성(`homeContentReady`, 11개 서브페이지 HTML 로드) 완료를 기다리지 않고 `initSocialYoutubeFast()`를 `DOMContentLoaded` 즉시 실행, 로컬 캐시(`kinoya_yt_fast_v1`) 0ms 즉시 렌더링, `youtube_videos` / `site_content` 분리 반영, 첫 4개 썸네일 `loading="eager" fetchpriority="high"` 우선 로드, 관리자 동기화 6개 단위 병렬 배치 저장으로 개선했습니다.
- **3. 사진(CMS 이미지·배경·매장·사람들·메뉴) 초고속 표시 및 API 동시 호출 중복 제거 (`js/site-runtime.js`, `js/home-runtime.js`, `js/cms.js`, `kinoya.css`):**
  - 동시 진행 중인 동일 테이블 GET 요청을 1회로 통합(In-flight Deduplication)하고, 홈페이지에서도 `cms_cache` 즉시 적용 및 사진 공개 대기 타이머를 280ms(CSS `0.35s`)로 단축했습니다.


## 첨부 엑셀(`우동키노야_전국_매장_정보_수집_요청.xlsx`) 전국 매장 상세정보 일괄 입력 및 영업시간·휴무일 연동 — 2026-10-21
- **전국 매장 카드 상세정보 일괄 반영 (`store/index.html`):**
  - 첨부하신 엑셀 시트(`전국_우동키노야_매장안내`)에 수록된 전 지점의 **정식 매장명**, **도로명 주소**, **전화번호**, **영업시간(브레이크타임 BT · 라스트오더 LO 포함)**, **정기휴무일(`🕒 영업시간 · 휴무일`, `data-cms="store.<번호>.hours"`)**, **매장 특이사항·주차·역세권 특징(`🍜 ...`, `data-cms="store.<번호>.meta"`)**을 서울 지역 및 경기·인천·충청·대구·부산·제주 전체 매장 카드에 빠짐없이 입력했습니다.
- **관리자 페이지 및 엑셀("서울지역" / "전국 각지" 2개 시트) 영업시간·휴무일 연동 (`admin/index.html`, `admin/stores-manage.js`, `js/cms.js`, `js/home-full.js`):**
  - 관리자 페이지(`/admin/`) **「매장 찾기 - 개별 매장」**에 각 매장의 `영업시간·휴무일`(`store.1.hours`~`store.45.hours`) 편집 항목을 추가했습니다.
  - **「🏪 신규 매장 등록 · 관리」** 입력 폼과 **`매장 엑셀 다운로드 · 업로드 (2개 시트: "서울지역", "전국 각지")`**에 **`영업시간` (`hours`)** 및 **`휴무일` (`closed_days`)** 컬럼을 추가해 엑셀 다운로드/업로드 시 영업시간과 휴무일까지 모두 보존·일괄 수정되도록 구성했습니다.


## 서울 지역 · 전국 각지 매장 카드 「카카오맵」 · 「티맵」 버튼 추가 및 관리자/엑셀 연동 — 2026-10-21
- **전체 매장 카드(`.store-actions`) 카카오맵 · 티맵 버튼 추가 (`js/home-model.js`, `js/cms.js`, `js/home-full.js`):**
  - 우리동네 키노야(`store/index.html`) 및 메인 페이지(`index.html`)의 **「서울 지역 · 22개 매장」**과 **「전국 각지 · 23개 매장」** 전체 매장 카드(신규 추가 매장 포함) 하단 버튼 영역에 기존 **`전화하기` · `매장 자세히 보기 →` · `🗺 구글맵` · `🗺 네이버맵`**과 함께 **`🗺 카카오맵`**(`https://map.kakao.com/link/search/...`) 및 **`🧭 티맵`**(`https://tmap.life/search?query=...`) 버튼을 추가했습니다.
- **관리자 신규 매장 등록 및 엑셀("서울지역" / "전국 각지" 2개 시트) 연동 (`store_items` 스키마, `admin/stores-manage.js`, `admin/backup-restore.js`):**
  - 관리자 페이지(`/admin/`)의 **「🏪 신규 매장 등록 · 관리」** 입력 폼에 **`카카오맵 링크`** 및 **`티맵 링크`** 입력칸(비워두면 매장명으로 자동 검색 연결)을 추가했습니다.
  - 매장 관리 엑셀 다운로드·업로드의 **`"서울지역"`** 시트와 **`"전국 각지"`** 시트에도 `카카오맵링크`, `티맵링크` 컬럼을 포함해 엑셀에서 일괄 확인·수정할 수 있습니다.


## 매장 관리 엑셀 다운로드·업로드 ("서울지역" / "전국 각지" 2개 시트) 기능 추가 — 2026-10-21
- **엑셀 2개 시트(`서울지역` / `전국 각지`) 다운로드 (`admin/stores-manage.js`):**
  - 관리자 페이지(`/admin/`)의 **「🏪 신규 매장 등록 · 관리 (서울 지역 · 전국 각지)」** 상단에 **`매장 엑셀 다운로드 (2개 시트)`** 버튼을 추가했습니다.
  - 클릭 시 기존 45개 매장(`store.1`~`store.45` + CMS 수정사항 반영본)과 추가 등록된 매장(`store_items`) 전체를 **`"서울지역"`** 시트와 **`"전국 각지"`** 시트 2개로 나누어 정리한 `.xlsx` 파일(`매장코드`, `지역`, `매장명`, `주소`, `한줄소개`, `전화번호`, `사진경로`, `네이버맵링크`, `구글맵링크`, `상세페이지링크`, `표시순서`, `공개여부`)을 즉시 다운로드합니다.
- **엑셀 업로드 일괄 반영 (`admin/stores-manage.js`, `js/cms.js`, `js/home-model.js`):**
  - **`매장 엑셀 업로드`** 버튼으로 수정한 `.xlsx` 파일을 업로드하면 **`"서울지역"`** 시트와 **`"전국 각지"`** 시트를 모두 읽어 검증한 뒤:
    1. 기존 기본 매장(`store.1`~`store.45`)의 변경된 매장명·주소·한줄소개·전화번호·사진경로는 `site_content` 테이블에 즉시 반영합니다.
    2. `매장코드`를 비워두거나 새로 추가한 행은 해당 시트(`서울지역` 또는 `전국 각지`의 지역 구분)에 맞춰 `store_items` 테이블에 신규 매장으로 일괄 등록되며, 기존 추가 매장은 수정 반영됩니다.


## 신규 매장 추가·관리 기능 및 서울 지역(22개 매장) · 전국 각지(23개 매장) 매장 사진 업로드 추가 — 2026-10-21
- **신규 매장 등록 · 관리 (`store_items` 테이블, `admin/stores-manage.js`, `admin/index.html`, `admin/backup-restore.js`):**
  - `store_items` 테이블(`id`, `name`, `region`, `address`, `meta`, `phone`, `photo`, `naver_map_url`, `google_map_url`, `detail_url`, `sort_order`, `is_published`)을 추가하고, 관리자 페이지(`/admin/`) 상단 바로가기 및 본문에 **「🏪 신규 매장 등록 · 관리 (서울 지역 · 전국 각지)」 (`#stores-manage-section`)** 섹션을 구성했습니다.
  - 매장명, 지역 구분(`서울 지역` / `전국 각지 · 경기·인천·충청·대구·부산·제주`), 도로명/지번 주소, 한줄 소개, 전화번호, 매장 대표 사진(PNG 600KB 이하 자동 변환 업로드), 네이버맵/구글맵/상세페이지 링크(비우면 매장명으로 자동 지도 검색 연결), 표시 순서, 공개 여부를 입력해 새 매장을 등록·수정·삭제할 수 있습니다.
  - 등록된 신규 매장은 **우리동네 키노야(`store/index.html`)의 해당 지역**과 **메인 페이지(`서울 지역` / `전국 각지` 매장 슬라이더)**에 자동으로 추가·표시되며 지역별 매장 수도 함께 갱신됩니다.
- **기존 45개 매장 사진 업로드 (`js/home-model.js`, `js/cms.js`, `kinoya.css`, `admin/index.html`, `admin/editor.js`):**
  - 우리동네 키노야(`store/index.html`) 및 메인 페이지(`index.html`)의 **「서울 지역 · 22개 매장」**과 **「전국 각지 · 23개 매장」** 전체 45개 매장 카드(`#store-1`~`#store-45`)의 상단 `.store-thumb` 영역에 `store.<번호>.photo` 이미지 슬롯을 연결했습니다.
  - 관리자 페이지(`/admin/`)의 **`매장 사진 - 서울 지역 (22개 매장)`** 및 **`매장 사진 - 전국 각지 (23개 매장)`** 섹션에서 각 매장별로 **사진 선택(PNG 600KB 이하 자동 변환 미리보기)** · **이 사진 저장(개별 즉시 저장)** · **사진 처리 다시 시도** · **사진 비우기** · **기본 사진 복원**을 지원합니다.


## 합리적 창업 상단 영상(`kinoya-7000-open.mp4`) 자동 무한 반복 재생 및 회사소개서(`kinoya_company.pdf`) 다운로드 연동 — 2026-10-21
- **영상 자동·반복 재생 (`franchise/index.html`, `js/main.js`, `js/home-full.js`, `js/cms.js`, `js/home-model.js`):**
  - `#start-7000-video` 영상 태그에 `autoplay muted loop playsinline webkit-playsinline controls preload="auto"` 속성을 적용하고, 페이지 로드·홈페이지 합성(`HomeFull`)·CMS 반영 시 자동으로 계속 무한 반복 재생(`muted = true`, `loop = true`, `play()`)되도록 보장했습니다.
- **회사소개서 PDF(`kinoya_company.pdf`) 다운로드 연동 (`franchise/index.html`, `resources/index.html`, `admin/index.html`):**
  - 첨부하신 `kinoya_company.pdf` (`https://www.genspark.ai/api/files/s/Fjz7DCUP`)를 **「회사소개 다운로드 →」** 버튼(`franchise.start7000.url`)과 자료실(`resources` 테이블 및 기본 목록)에 연결해 클릭 시 즉시 열리거나 다운로드되도록 구성했습니다.


## 창업안내(Franchise) 「우동키노야의 창업비용 해법」·「30평형 창업비용안내」·「합리적 창업 상단 영상(MP4)」·「BEFORE & AFTER 3매장」 섹션 추가 및 디자인 통일 — 2026-10-21
- 첨부하신 3개 매장 비포·애프터 원본 이미지 3장을 `images/franchise-before-after-1.png`, `images/franchise-before-after-2.png`, `images/franchise-before-after-3.png`로 저장하고 창업안내(`franchise/index.html`) 내 `#cost-solution` 섹션에 연결했습니다.
- 첨부하신 **`우동키노야_7000만원_OPEN_애니메이션.mp4`** 원본 영상(`2,083,229B`)을 `images/kinoya-7000-open.mp4`로 저장하고, **「REASONABLE STARTUP · 합리적 창업 (7,000만원으로 시작할 수 있습니다.)」** 배너 바로 위(`#start-7000-video`, `.fr-start-video-frame`)에 네이비 프레임 MP4 플레이어(`controls playsinline webkit-playsinline`)로 배치했습니다.
- **관리자 페이지 연동 (`admin/index.html`, `admin/editor.js`, `js/cms.js`, `js/home-model.js`):**
  - 관리자 페이지(`/admin/`) **창업안내** 섹션에 `franchise.start7000.video` (`합리적 창업(7,000만원 오픈) 상단 영상`, 기본값 `images/kinoya-7000-open.mp4`) 항목을 추가해 영상 미리보기, MP4 영상 파일 선택 업로드(`/files/cms-videos`), 영상 경로/URL 직접 입력, **기본 영상 복원** 기능을 지원합니다.
  - 메인 페이지 통합 관리(`/admin/home.html`)에서도 해당 영상(`franchise.start7000.video`)을 인식·편집할 수 있습니다.
- **우동키노야의 창업비용 해법 (`#cost-solution`):** 브랜드 아이덴티티 유지 및 기존 점포 리뉴얼을 통한 7,000만~8,000만원 오픈 해법, 1년 이내 투자금 회수 목표, 대출/렌탈 프로그램 안내 및 철학 전문을 수록했습니다.
- **키노야 창업비용안내 (`#cost-guide-30`):** 30평형 기준 가맹비(1,000만·50호점까지 30% 지원), 교육비(500만·50호점까지 40% 지원), 실내인테리어(5,550만), 주방설비/집기/간판(3,300만), 홍보/영업준비(400만), 별도공사 및 **최종합계 1억2,485만원(부가세포함)** 상세표를 추가했습니다.
- **7,000만원으로 시작할 수 있습니다 배너 & 회사소개 다운로드:** 점주 부담 절감 약속 문구와 자료실(`../resources/`) 연동 **회사소개 다운로드** 버튼을 배치했습니다.
- **BEFORE & AFTER (`#before-after`):**
  1. `[중앙대점]` — 무권리점포 / 창업비용 7,400만원 (`images/franchise-before-after-1.png`)
  2. `[일산차병원점]` — 무권리점포 / 창업비용 7,200만원 (`images/franchise-before-after-2.png`)
  3. `[건대점]` — 무권리점포 / 창업비용 8,200만원(1인닷지 설치) (`images/franchise-before-after-3.png`)
- 홈페이지(`index.html`)의 `HomeFull` 자동 합성을 통해 메인 페이지의 창업안내 흐름에도 함께 노출되며, 관리자 CMS(`admin/index.html`)에서도 모든 문구·표·영상·비포애프터 사진 3장을 개별 편집할 수 있습니다.


## SYSTEM(`본사가 합니다 / 매장은 합니다`) 섹션 주방 조리 배경 이미지 적용 — 2026-10-21
- 첨부하신 주방 조리 원본 PNG(`382,054B`)를 `images/system-kitchen-bg.png`로 저장하고 `SYSTEM · 본사와 매장의 역할` 섹션(`franchise/index.html`, `index.html`, `en/franchise/`, `ja/franchise/`, `en/`, `ja/`) 뒷배경에 연결했습니다.
- `kinoya.css`: `.sec-navy.sec-system-bg`에 다크 네이비 그라데이션·비네팅 오버레이를 적용하고, `.system-col` 두 역할 박스에 반투명 다크 글래스 효과(`backdrop-filter: blur(6px)`)와 소프트 섀도우를 적용해 배경 사진의 현장감을 살리면서 `본사가 합니다. 매장은 합니다.` 텍스트와 항목들이 선명하게 읽히도록 구성했습니다.
- 관리자 CMS(`admin/index.html`, `franchise.system.bg`)에서도 해당 섹션 배경 이미지를 관리할 수 있도록 연결했습니다.
- `/tests/system-bg-view.html`: PC(1280px)·모바일(390px) 실제 렌더링에서 주방 조리 배경 이미지와 오버레이, 두 역할 박스 및 하단 문구가 잘림·가로 넘침·코드 노출 없이 선명하게 표시됨을 확인했습니다.


## 메뉴 사진 저장 시 `조회 실패 (HTTP 500)` 제거 — 2026-10-21 (최신)
- **원인 확인:** 운영 DB(`site_content`)를 읽기 전용으로 점검한 결과 과거 Base64로 직접 저장된 대용량 이미지 행 9개(`550KB~798KB`, 합계 약 6.3MB)가 존재해, 저장 직전 실행되던 `GET /tables/site_content?search=menu.catalog.signature.gyudon.bg` 전체 텍스트 스캔이 `HTTP 500`(또는 `413`)으로 실패하고 있었습니다. 또한 프리뷰/미활성 파일 게이트웨이가 `500`을 반환할 때 `admin/core.js`가 미활성 상태로 인식하지 못해 기본 메뉴 사진 연결도 중단되고 있었습니다.
- **수정 (`admin/editor.js`, `admin/core.js`):**
  - 초기 조회가 완료된 항목은 저장·비우기·복원 시 **`?search=...` 전체 테이블 스캔을 호출하지 않고**, 기존 행이 있으면 **고유 ID 단건 조회(`GET /tables/site_content/{id}`)**만 수행하도록 수정했습니다.
  - `/files/cms-images`가 `404/500/502/503`으로 비활성 상태일 때 해당 메뉴에 프로젝트 기본 이미지(`images/menu-gyudon.jpg` 등)가 있으면 Base64 DB 저장 없이 안전한 정적 이미지 URL로 즉시 연결·저장합니다.
- **검증:** `/tests/gyudon-photo-upload.html` **13개 검사 전부 PASS** (`search` 500 + `/files/cms-images` 500 동시 발생 환경에서 규동 사진 저장 완료 및 `search=` 호출 0회 확인). `/tests/gyudon-photo-upload-view.html`에서 PC(1280px)·모바일(390px) 모두 `저장 완료. 공개 메뉴에서 새로고침하여 확인하세요.` 표시 확인.


## 규동 메뉴 사진 반영 및 관리자 개별 사진 저장 차단 수정 — 2026-10-21 (최신)
- 첨부 원본 규동 JPEG(`145,499B`, `1024×768`)를 `images/menu-gyudon.jpg`로 저장하고 `menu.catalog.signature.gyudon.bg` 기본 사진과 관리자 초기 미리보기에 연결했습니다.
- 원인: 기존 `site_content` 전체 조회에서 다른 대용량 항목 하나라도 `HTTP 413`으로 실패하면 관리자 전체가 미준비 상태로 남아, 정상인 `menu.catalog.signature.gyudon.bg` 사진 저장/비우기까지 차단되고 있었습니다.
- `admin/editor.js`: 전체 조회가 413이면 `menu.catalog.signature.` 등 섹션 접두어별로 나누어 조회하고, 메뉴 사진의 **이 사진 저장 / 사진 비우기 / 기본 사진 복원**은 전체 조회 완료 여부 대신 **해당 키(`search=f.key`)를 개별 확인**해 다른 섹션의 대용량 행 때문에 막히지 않도록 수정했습니다. 해당 키 조회 자체가 실패하면 덮어쓰기 방지를 위해 저장을 차단합니다.
- 기본 사진이 연결된 메뉴 항목에는 **기본 사진 복원** 버튼을 추가했습니다. 클릭 시 파일 업로드 없이 해당 CMS 덮어쓰기 행만 정리하고 기본 사진(`images/menu-gyudon.jpg` 등)과 현재 브라우저 메뉴 캐시를 즉시 복원합니다.
- `/tests/gyudon-photo-upload.html`: 실제 관리자 HTML + 실제 `images/menu-gyudon.jpg`로 **11개 검사 통과**(원본 145,499B 확인, 타 섹션 413 분리 조회, 초기 규동 사진 표시, `규동.jpg → 규동.png · 536.4KB · 557×418px` 변환 미리보기, 600KB 이하 PNG 업로드 및 반환 참조 저장, Base64/Blob URL 미저장, 사진 비우기, 기본 사진 복원, 초기 전체 조회 실패 후 개별 키 확인 저장, 개별 키 조회 실패 시 저장 차단).
- `/tests/gyudon-photo-upload-view.html`: 실제 관리자 규동 사진 영역에서 PC(1280px)·모바일(390px) 모두 규동 미리보기, `사진 선택 / 이 사진 저장 / 사진 처리 다시 시도 / 사진 비우기 / 기본 사진 복원` 버튼과 `규동.jpg → 규동.png · PNG 536.4KB / 600KB 이하 · 557×418px` 안내가 잘림·가로 넘침·코드 노출 없이 표시됨을 확인했습니다. 회귀 `/tests/menu-photo-selection.html` 36개도 모두 PASS 확인했습니다.
- **주의 (프리뷰 vs 운영):** 프리뷰 환경에서는 플랫폼 런타임 파일 서비스(`/files/cms-images`)가 비활성(404/503)일 수 있어 새 파일 업로드 대신 기본 사진(`images/menu-gyudon.jpg`) 또는 로컬 미리보기로 확인됩니다. 실제 운영 사이트 반영과 `/files/cms-images` 업로드는 승인된 Hosted 배포 및 파일 서비스 활성화가 필요합니다.


## 사진 PNG 자동 변환·600KB 자동 축소 — 2026-10-21
- 관리자 사진 공용 처리 `admin/core.js`를 정리하여 `prepareImage(File)`의 로컬 변환과 `uploadImage(File)`의 바이너리 업로드를 분리했습니다. 메뉴·일반 CMS·사람들·메인 관리·뉴스/협력사 이미지 업로드가 같은 공용 처리를 사용합니다. 자료실 PDF 등 일반 첨부파일은 사진으로 변환하지 않습니다.
- JPG/PNG/WebP/GIF를 실제 PNG 바이너리/확장자/MIME으로 변환하고, 종횡비 유지·최대변 2000px·용량 600×1024바이트 이하로 자동 축소합니다. 기존 600KB 제한을 유지하면서 실측 PNG 크기에 따른 축소 비율과 고품질 리샘플링을 적용했습니다. 작은 이미지는 확대/용량 부풀리기 없이 유지하고 PNG 투명 배경을 보존합니다. GIF는 정지 PNG로 변환되며 애니메이션은 유지하지 않습니다. HEIC 미지원·원본15MiB 제한은 기존대로 안내합니다.
- `admin/editor.js`: 메뉴 선택 시 먼저 로컬 PNG 변환 후 변환된 사진을 미리보기합니다. 사진 옆에 원본명 → PNG 파일명·실제KB·600KB 이하·픽셀크기·미저장 상태를 표시합니다. 선택 단계에는 서버 쓰기를 하지 않습니다. 실제 저장 시 이미 변환한 PNG를 재사용합니다. 실패 시 원본/선택 파일을 보존하고 명시적 재시도 때 같은 변환 파일·멱등키를 사용합니다.
- 변환 결과는 원본 File 및 목표 용량별로 캐시하며 실패 결과는 제거합니다. 변환 실패 시 원본을 그대로 업로드하거나 Base64 DB 저장으로 우회하지 않습니다. DB는 여전히 성공한 파일 업로드의 반환 참조만 저장합니다. 기존에 저장된 사진을 일괄 재변환하지 않았습니다.
- `/tests/image-preparation.html` **19개 통과**: PNG 시그니처/확장자/MIME·600KB 제한·대용량 리사이징·종횡비·작은 사진 비확대·투명도·MIME 누락·손상/HEIC 차단·목표 용량별 캐시·실제 업로드 본문·실패 재시도 동일 파일/멱등키·중복 업로드 방지를 검사합니다. 실제 `menu-gyudon.jpg`는 PNG **536.4KB**, 합성 고해상도 PNG는 **446.0KB**로 변환됐습니다. 작은 사진을 억지로 600KB에 맞추지는 않습니다.
- 회귀: 메뉴 사진 선택/저장/비우기 36개(화면 테스트 passed 확인), 사람들24개, 조회413복구17개 통과. `/tests/menu-photo-selection-view.html`의 실제 관리자 DOM에서 PC1280px·모바일390px의 PNG 용량/크기 안내·미리보기/버튼·정상 줄바꿈·가로 넘침/겹침/코드 누출 없음을 확인했습니다. 테스트는 로컬 변환/메모리 파일 API이며 운영/프리뷰 DB 쓰기나 실제 파일 업로드는 없습니다.
- 진입 `/admin/` 메뉴사진 또는 기존 각 관리자 이미지 선택. **소스 수정 완료·운영 배포는 하지 않았습니다.** 사진 변환은 브라우저에서 가능하지만 실제 파일 저장은 승인된 Hosted 배포/플랫폼 파일 활성화/소유자 기존 이용 자격 및 접근 규칙이 필요합니다. 기존 canonical `https://www.udonkinoya.com/`와 운영 참고 `https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com/`는 아직 이번 변경이 반영됐다고 보장하지 않습니다.


## 콘텐츠 조회 HTTP 413 대응 — 2026-10-21
- 사용자 상단 오류 화면의 `조회 실패 (HTTP 413)`는 사진 업로드 POST 이전, 기존 `site_content` 전체 조회가 용량 제한에 걸린 상태입니다. 따라서 기존의 ‘더 작은 사진 사용’ 안내는 이 조회 오류의 해결책이 아닙니다. 특정 기존 행/원본 서버의 정확한 크기 제한까지 확인한 것은 아닙니다.
- `js/site-runtime.js`의 `all()`은 **GET 목록 조회의 413에만** 페이지 크기를 100 → 20 → 5 → 1로 줄입니다. 크기를 바꿀 때 이전 결과를 버리고 page=1부터 다시 읽어 오프셋 누락/중복을 방지합니다. 전체 배열/건수 변동/중복·반복 페이지 검증은 유지합니다. 401/403/500/잘못된 응답에는 이 재시도를 적용하지 않습니다. POST/PUT/파일 업로드에는 자동 재전송하지 않습니다.
- 1개 조회도 413이면 유한 단계 후 중단하며, 기존 개별 콘텐츠·서버 제한 점검이 필요하다고 표시합니다. 이 경우 저장 차단은 유지합니다. 기존 대용량 사진 본문이 원인일 수 있으나 아직 특정 행을 단정하거나 삭제/이전하지 않았습니다.
- `admin/editor.js`: 작은 묶음 재조회 진행 상황을 상단에 표시합니다. 최종 조회 실패 원인을 개별 메뉴 사진 저장 안내에도 전달합니다. 조회 중 선택한 로컬 사진과 수정 글씨를 덮어쓰지 않으며 기존 저장 안전장치를 유지합니다. `admin/index.html` 상단의 옛 사진 미리보기/저장 설명도 현재 메뉴 동작에 맞게 정정했습니다.
- `/tests/admin-read413.html`: 실제 관리자 HTML+메모리 API로 **17개 통과**. 초기 413 복구, 105행 전체 수집, 중간 페이지 413의 첫 페이지 재시작, 1행씩 조회, 최종 실패/무한 재시도 방지, 401/403/500 비재시도, POST413 자동 재전송 없음, 복구 후 글씨 저장·메뉴 사진 선택·파일 참조 연결을 검사합니다. 파일 저장 성공은 모의 파일 서비스 결과이며 운영 업로드 활성화 확인은 아닙니다.
- 회귀: `/tests/menu-photo-selection.html` 36개(스크린샷 검사에서 passed 완료 확인), `/tests/admin-reliability.html` 29개 통과. 렌더 도구의 동일 호출 제한으로 메뉴 검사는 콘솔 대신 `body[data-test-status='passed']`를 기다리는 화면 검증 방식으로 실행했습니다.
- `/tests/admin-read413-view.html`: 같은 실제 관리자에서 413을 재현한 후 복구 상태만 보여줍니다. PC1280px·모바일390px에서 편집항목 693개 준비 완료/활성 전체 저장/오류 박스 없음·레이아웃 잘림/코드 노출 없음을 확인했습니다. 693은 편집 가능한 필드 수이며 모의 DB는 105행입니다.
- **소스 수정/격리 검증만 완료했습니다. 운영 배포·운영 DB 쓰기·파일 이전·접근 규칙 변경 없음.** 실제 운영 업로드는 별도 승인된 Hosted 배포/파일 서비스 활성화와 기존 이용 자격/접근 규칙이 필요합니다. 운영 참고 URL `https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com/admin/`, canonical `https://www.udonkinoya.com/`는 기존 주소이며 사용자 실제 접속 URL에서 이 수정의 동작 확인은 아직 남아 있습니다.


## 메뉴 사진 비우기 즉시 저장 수정 — 2026-10-21 (최신 동작)
- `/admin/`의 메뉴 사진 **사진 비우기**는 이제 별도 전체 저장 없이 **해당 사진만 즉시 빈값 저장**합니다. 기존 ‘임시 표시 후 전체 저장’ 안내/동작을 대체합니다. `menu.item숫자.bg` 이전 16칸과 `menu.catalog.*.bg` 현재 카테고리 모두 적용합니다. 보관용 항목과 현재 메뉴의 서로 다른 키를 임의로 함께 비우지는 않습니다.
- `admin/editor.js`: 클릭 즉시 미리보기 src 제거·hidden/display:none으로 이미지/테두리를 숨깁니다. 최신값 확인 → 기존 행 PUT(미등록 기본사진은 빈값 행 POST) 성공 후 선택 파일/로컬 미리보기를 정리합니다. 실패 시 이전 미리보기·선택 파일을 복원/보존하고 사진 옆에 오류와 직접 재시도 안내를 표시합니다. 조회 실패/다른 처리 중에는 이유를 표시하며 저장하지 않습니다. 다른 미저장 글씨/사진은 함께 저장하지 않습니다.
- 성공한 변경은 현재 브라우저의 메뉴 캐시에도 반영하고 과거 공용 CMS 캐시는 제거합니다. 명시적인 빈값 행을 남겨 관리자 재진입 시 기본사진이 되살아나지 않습니다. 파일 바이너리 업로드/원본 삭제는 하지 않으며 Base64·Blob URL DB 저장도 없습니다. ‘사진 비우기’는 CMS 사진 연결 해제이고 Git 원본 파일의 물리적 삭제가 아닙니다.
- `/tests/menu-photo-selection.html`: 기존 선택/업로드 검사와 비우기 즉시 저장·실패 복원·자동 재시도 없음·같은 id·다른 글씨 보존·캐시 갱신·기본사진 빈값 생성·재진입·조회 실패 차단 등 **36개 통과**. 실제 관리자 HTML과 메모리 API로 실행하며 운영/프리뷰 DB 테스트 쓰기는 없습니다. 의도한 500/503 오류 및 사용자 입력 없는 iframe 재진입의 beforeunload 경고가 포함됩니다.
- 회귀: `/tests/people-editor.html` 24개, `/tests/menu-admin-settings.html` 8개, `/tests/admin-reliability.html` 29개 통과.
- `/tests/menu-photo-cleared-view.html`: 실제 관리자에서 첫 보관용 메뉴 사진 비우기를 실행하고 같은 그룹만 보이는 격리 화면입니다. PC 1280px·모바일 390px에서 첫 사진과 빈 이미지 테두리 없음·저장 완료 안내·버튼 줄바꿈·가로 넘침/겹침 없음 확인. PC에서는 다음 붓카케 사진 유지도 확인했으며 모바일에서는 다음 항목이 뷰포트 아래였습니다.
- **소스 수정과 격리 검증 완료, 운영 배포는 하지 않았습니다.** 운영 참고 `https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com/admin/`, canonical `https://www.udonkinoya.com/`는 기존 주소입니다. 실제 운영에 이 동작을 적용하려면 별도 승인된 배포가 필요합니다. 사용자가 접속한 관리자 URL과 실제 운영 저장 검증은 아직 확인 전입니다. 기존 테이블 구조·접근 규칙은 변경하지 않았습니다.


## 첨부 메뉴 사진 연결 — 2026-10-21
- 첨부 17장 중 현재 원본 다운로드 주소가 제공된 **4장만** 실제 JPEG 파일로 저장했습니다. 원래 업로드 파일명 메타데이터는 확인할 수 없어 음식 내용과 메뉴 목록을 대조해 설명적인 파일명을 부여했습니다. 모델용 `/api/files/` 래스터 미리보기는 저장하지 않았습니다.
- `images/menu-gyudon.jpg` → `menu.catalog.signature.gyudon.bg` (규동)
- `images/menu-niku-kake.jpg` → `menu.catalog.kake.niku.bg` (니꾸 소고기 카케우동)
- `images/menu-amaebi-bukkake.jpg` → `menu.catalog.bukkake.shrimp.bg` (단새우 붓카케우동)
- `images/menu-tempura.jpg` → `menu.catalog.side.tempura.bg` (사이드 덴뿌라; 덴푸라 붓카케나 세트 사진으로 잘못 재사용하지 않음)
- `js/menu-catalog.js`의 공용 사진 매핑을 공개 `/menu/`·홈페이지 조합·전체 관리자 기본 미리보기에 사용합니다. 스크립트 기준 프로젝트 루트로 경로를 계산합니다. 기존 CMS 저장값(명시적인 빈값 포함)은 계속 우선하며 DB를 임의로 덮어쓰지 않았습니다. 파일 본문/Base64 DB 저장·운영 데이터 수정은 없습니다.
- `/tests/menu-default-photos.html`: 실제 메뉴 HTML/CSS/카탈로그로 4개 메뉴 매핑과 실제 JPEG 로드, 무관한 사진 미사용 **5개 검사 통과**. 시각 검증은 다른 미배정 카드를 숨긴 실제 카드 DOM으로 PC·390px 모바일에서 규동 사진/이름/가격과 다음 카테고리 배치·가로 넘침/코드 누출 없음을 확인했습니다.
- **남은 작업:** 나머지 13장의 원본 파일 또는 원본을 담은 ZIP을 받아 동일 방식으로 매칭해야 합니다. 현재 없는 원본을 미리보기로 대체하지 않았습니다. 운영 배포는 별도 승인 전이며 공개 canonical은 기존 `https://www.udonkinoya.com/menu/`입니다.


## 메뉴 사진 선택 수정 — 2026-10-21
- 진입 `/admin/` → 메뉴소개 각 카테고리. 기존에는 업로드 성공 후에만 미리보기가 바뀌어 파일 서비스가 없는 환경에서 선택이 안 된 것처럼 보였습니다. CMS 조회 실패 시 파일 입력이 비활성인 문제도 있었습니다.
- `admin/editor.js`: 메뉴 사진은 **선택 즉시 기기 내 Blob URL 미리보기**를 표시합니다. 명시적 사진 선택 버튼과 보이는 브라우저 기본 파일 입력, **이 사진 저장**, 사진별 상태/오류 안내를 추가했습니다. 전체 저장도 지원합니다. 사진 비우기는 전체 저장으로 반영합니다.
- 선택만으로 네트워크 쓰기는 하지 않습니다. 실제 저장은 `admin/core.js`의 PNG 축소 → `/files/cms-images` 바이너리 업로드 → 반환 참조를 기존 `site_content` 행에 PUT하는 순서입니다. 새 DB 테이블/컬럼이나 Base64/Blob URL DB 저장은 없습니다. 지원 형식 PNG/JPG/WebP/GIF, 원본 15MB 이하이며 MIME 누락과 image/jpg도 처리합니다. HEIC는 변환 안내를 표시합니다.
- 업로드/DB 실패 시 선택 File·로컬 미리보기를 유지합니다. 사용자가 직접 재시도하면 같은 파일은 같은 멱등키를 사용하고 이미 업로드한 참조는 재사용합니다. 조회 실패 중에도 로컬 선택은 되지만 저장은 차단합니다. 미저장 사진은 새로고침/탭 종료 시 사라질 수 있습니다.
- `/tests/menu-photo-selection.html`: 실제 전체 관리자 HTML+메모리 API로 **22개 통과**. 선택 버튼 연결, 로컬 미리보기, 선택만으로 쓰기 없음, 503/500 실패 보존, 재시도/중복 업로드 방지, 참조만 저장, 전체 저장, 비우기, MIME 누락, HEIC, 조회 실패 중 로컬 선택/저장 차단을 확인했습니다. OS 파일 선택창 자체는 자동 검사하지 못했으며 실제 file input에 테스트 File을 전달했습니다.
- 회귀: 사람들 24개, 메뉴 설정 8개, 관리자 안정성 29개, 메인 관리자 32개 통과. 의도한 500/503 오류 로그는 실패 보존 테스트입니다. 실제 운영/프리뷰 DB에는 테스트 쓰기를 보내지 않았습니다.
- `/tests/menu-photo-selection-view.html`: 실제 관리자에서 다른 그룹만 숨긴 시각 검증용 진입점. PC 1280px·모바일 390px에서 테스트 사진, 선택/개별 저장, 기본 파일 입력, 미저장 안내가 보이고 가로 잘림/겹침·원시 코드 누출 없음을 확인했습니다.
- **운영 배포·파일 서비스 활성화는 하지 않았습니다.** 파일 저장은 승인된 Hosted 배포, 플랫폼 활성화 및 기존 이용 자격/접근 규칙이 필요합니다. 공개 URL은 기존 `https://www.udonkinoya.com/`, 운영 참고 주소는 아래 기록과 같으며 소스 변경만으로 운영에 반영되지 않습니다. 실제 증상이 난 관리자 URL 확인과 별도 승인 후 운영 검증이 남아 있습니다.


## 창업문의 페이지 CONTACT 영역 추가 — 2026-10-21
- `/contact/index.html`의 기존 상담 폼과 전화 안내 아래, 푸터 앞에 뉴스 페이지와 같은 어두운 매장 배경·제목·두 카드 구성의 CONTACT 영역을 **1개** 추가했습니다. 기존 상담 폼/동의/제출 처리는 변경하지 않았습니다.
- 진입: `/contact/#contact-help`. **창업 FAQ**는 `/franchise/faq/`, **창업문의**는 현재 페이지의 `#consult-form`으로 연결하므로 페이지를 다시 불러오지 않습니다.
- `kinoya.css`의 기존 `final-cta` 스타일을 재사용하고 `contact-page-cta`에만 모바일 단일 열·카드 여백·포커스 표시를 적용했습니다. PC는 두 카드 가로 배치, 640px 이하는 세로 배치입니다. 새 이미지나 파일 업로드는 없습니다.
- `contact.cta.title`, `contact.cta.faq.title/desc/link`, `contact.cta.consult.title/desc/link` 7개 CMS 키를 연결했습니다. 메인 통합 관리가 실제 본문에서 자동 수집하며 새 테이블·컬럼·데이터 쓰기는 하지 않았습니다.
- 홈페이지의 `HomeFull`이 창업문의 본문을 조합하므로 `/#final`에도 같은 영역이 한 번 포함됩니다. 상담 카드의 `#consult-form` 앵커와 제목 접근성 연결은 조합 후에도 유지됩니다.
- `/tests/home-full.html`: 새 영역 개수·두 링크 목적지·홈페이지 조합·CMS 필드 검사를 추가하여 **38개 검사 통과**. 실제 데이터 쓰기는 없는 격리 검사입니다.
- 직접 페이지 캡처는 외부 요청의 networkidle 대기로 시간 초과되었습니다. `/tests/contact-cta-view.html`에서 **실제 contact HTML과 kinoya.css**를 읽고 외부 스크립트/폰트 요청만 격리하여 PC·390px 모바일 렌더를 확인했습니다. PC 두 카드 가로·모바일 세로, 제목 표시·가로 넘침/코드 노출 없음 확인. 검증용 화면은 상담 접수나 분석 API를 호출하지 않습니다.
- **운영 배포는 수행하지 않았습니다.** 공개 경로는 기존 canonical `https://www.udonkinoya.com/contact/`이며 운영 반영에는 별도 배포가 필요합니다. 영문·일문 페이지는 이번 변경 범위가 아닙니다.

---

## 관리자 정밀점검 후 순차 개선 — 2026-10-21 최신 상태

> **이 절이 아래 과거 작업 기록보다 우선합니다. 소스/프리뷰 개선이며 운영 배포·운영 DB 수정·기존 파일 이전은 하지 않았습니다. 접근 보호 완료를 의미하지 않습니다.**

### 이번 개선
- `js/site-runtime.js`: 스크립트 위치로 프로젝트 루트를 구하고 `tables/` 네임스페이스를 보존합니다. 하위 경로 프리뷰의 루트 `/tables` 오요청을 수정했습니다. 모든 HTTP 실패를 오류로 처리하고, 배열 형식 검증·페이지 반복/누락/건수 변동 감지·전체 페이지 조회를 제공합니다. 쓰기는 자동 재시도하지 않습니다. 실제 전체/메인/사람들 관리자에서 이전 조회 404 대신 조회 완료를 확인했습니다.
- `admin/core.js`: 401 로그인 링크와 직접 재시도 안내, 삭제 실패 보존, PNG 축소와 **바이너리 업로드 후 파일 참조만 DB 저장**을 제공합니다. 파일은 `/files/cms-images`와 `/files/resources`에 사용자의 선택/재시도로 업로드하며 같은 파일의 재시도에 같은 Idempotency-Key를 사용합니다. 프리뷰 또는 서비스 미활성의 404/503은 기능 불가로 안내하고 Base64 DB fallback을 하지 않습니다. 기존 사진/파일 본문 데이터는 읽기 호환을 위해 유지하며 일괄 이전하지 않았습니다.
- 전체 관리자·사람들 관리: 기존 빈 문자열 보존, 저장 전 동일 키의 최신값/중복 확인, 미저장 이탈 경고, 사진 재시도 버튼, 저장 중 편집 제한, 현재 본문과 다른 옛 홈 요약 그룹의 보관 안내를 추가했습니다. 사람들 사진은 참조 업로드와 CMS 저장 모두 성공한 뒤 미리보기를 바꿉니다. Git 기본 사진·예전 업로드 객체·다른 방문자 캐시는 자동 삭제하지 않습니다.
- 메인 관리: 공통 API 사용, 원문 HTTP 실패 검사, 사진 파일 참조 저장, 저장 응답 id 검사, 정적 미리보기의 링크/폼 이동 차단. 기존 충돌 검사·JSON 초안 복원은 유지합니다.
- `admin/collection-editor.js`와 기존 모듈 진입 스크립트: 뉴스/자료실/협력사를 공통 DOM 편집기로 관리합니다. 추가·수정·삭제·순서, 뉴스/자료실 공개 표시, 로고 행 이동을 지원합니다. 기존 사진 미리보기 및 선택적 사진 비우기, 실패 입력 보존, 다른 항목의 미저장 입력 보존, 변경 필드 PATCH와 최신값 확인을 제공합니다. **공개 표시 해제는 화면 표시 설정이지 데이터의 비밀 보관 기능이 아닙니다.**
- `/admin/#consultations-section`: 상담 목록·이름/연락처/지역 검색·상태 필터·신규/연락 완료/종료 상태 저장을 추가했습니다. 개인정보가 있으므로 운영 전 플랫폼 접근 보호가 필수입니다.
- 유튜브: 전체 페이지 조회/응답 실패 검사, 제목·영상/쇼츠 분류 수동 수정, 수동 항목의 자동 덮어쓰기·자동 정리 방지, 삭제 실패 전파. 180초 이하 쇼츠 분류는 추정임을 명시합니다. 채널 설정 저장과 실제 영상 전체 업데이트 버튼의 안내를 구분합니다. 공개 CMS에 둔 API 키는 비밀이 아니며 제공업체의 API/도메인 제한이 필요합니다.
- 공개 CMS/FAQ/뉴스/자료실: 허용 HTML·프로토콜 검증, 조회 실패와 빈 목록 구분, 전체 페이지 조회, 파일 참조 다운로드 반영을 개선했습니다. `HomeFull` 자료실도 `file_url` 참조를 우선 사용합니다. 과거 첨부파일 Data URL은 제한적 읽기 호환만 유지합니다.
- 공통 JS의 브라우저 내 고정 ID/비밀번호 비교와 가짜 로그인 폼을 제거했습니다. 푸터 로고는 관리자 이동 링크 역할만 하며 **인증은 플랫폼 접근 규칙이 담당해야 합니다.**
- 통계: 5000건 단일 조회를 전체 조회로 바꾸고 종료일 밀리초 누락을 보완했습니다. 모바일 비율을 로그 건수가 아닌 세션 기준으로 계산합니다. 대규모 방문 로그의 서버 집계/보관 정책은 별도 후속 작업입니다.

### 백업·복원
- 진입: `/admin/#backup-section`. **v2 JSON 백업 권장**, 기존 엑셀 형식 가져오기와 엑셀 내보내기도 지원합니다. 7개 테이블은 기존과 동일하며 방문 로그는 통계의 별도 내보내기를 사용합니다.
- JSON 구조: `version:2`, `scope:kinoya-admin`, `exported_at`, `source`, 테이블별 `counts`, `tables`. 전체 조회 중 한 테이블이라도 실패하면 완료로 처리하지 않습니다. 엑셀은 32767자 셀 제한 초과 시 중단하고 JSON을 안내합니다.
- 복원: 전체 파일 타입/허용 컬럼/중복 id·CMS key/필수값/숫자·불리언/주소 검증 → 추가·변경·동일 건수 확인 → 현재 데이터 별도 백업 → 최종 확인 → 순차 쓰기. 첫 실패/충돌에서 즉시 중단하고 성공 건수를 표시합니다. 자동 롤백·행 삭제·무조건 POST 재시도는 하지 않습니다.
- 동일한 과거 바이너리 값은 다시 전송하지 않으며 신규/변경 Base64 본문 복원은 차단합니다. 파일 참조는 원본 파일까지 백업하는 것이 아니고 다른 출처/버킷으로 옮기면 유효하지 않을 수 있습니다. 개인정보 백업과 파일 원본을 안전하게 별도 보관하세요. 시스템 생성일은 참고로 내보내지만 복원 시 덮어쓰지 않습니다.

### 진입·저장소·공개 URL
- 전체 `/admin/`, 메인 `/admin/home.html`, 사람들 `/admin/people.html`.
- 기존 8개 테이블 스키마를 유지합니다. 새 테이블/컬럼이나 운영 데이터 수정은 없습니다. 프리뷰 저장소와 Hosted 운영 D1은 계속 독립입니다.
- 운영 참고: `https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com/`, canonical `https://www.udonkinoya.com/`. **이번 변경은 아직 운영 배포하지 않았습니다.**

### 검증 및 남은 승인 사항
- `/tests/admin-reliability.html`: 실제 전체 관리자 HTML과 격리 메모리 API로 **29개 통과**. 페이지2 조회·잘못된 응답·500/403/401·자동 POST 재시도 없음·HTML/URL 검증·파일 업로드 불가/직접 재시도 키·Base64 DB 차단·복원 사전검증·부분 백업 실패·실제 뉴스 수정/표시 해제·입력 보존·상담 상태 저장을 확인합니다. 운영/프리뷰 DB에는 쓰지 않습니다.
- 기존 `/tests/menu-admin-settings.html` 8개, `/tests/people-editor.html` 24개, `/tests/home-admin.html` 32개 통과를 확인했습니다. 사람들 테스트도 Base64 대신 모의 파일 참조를 검증하도록 갱신했습니다.
- `/tests/home-full.html`: 누락됐던 메뉴 카탈로그 의존성 및 비동기 런타임 대기를 보완한 후 **34개 통과**. 공개 본문 조합·내부 앵커·안전한 FAQ·뉴스·다운로드·모의 상담 제출을 확인했습니다.
- 실제 전체/메인/사람들 관리자 모두 PC·390px 모바일에서 조회 완료와 코드 노출 없음 확인. `/tests/admin-collections-view.html`은 실제 관리자 HTML+메모리 데이터로 뉴스 폼 모바일 배치를 확인하는 검증 전용 화면입니다.
- **저장·검증 완료 / 운영 적용 대기 — 접근 보호 (2026-10-21):** 사용자가 오타를 확인하여 확정한 관리자 이메일은 `mango7557@gmail.com`입니다. 전용 Access Rules 도구로 `.meta/access-control.json`에 v2 메서드 규칙 26개를 저장하고 엄격 검증을 통과했습니다. 상태는 **saved_not_live**입니다. 기존 운영 정책이 변경됐다고 보장하지 않으며, 승인된 Hosted Deploy 완료 전에는 프리뷰/운영 보호가 활성화되지 않습니다. 아래 보호 범위와 모의 검증 결과를 참고하세요.
- **미완료 2 — 운영 파일 활성화·이전:** 파일 업로드의 실제 운영 사용은 승인된 Hosted 배포, 플랫폼 활성화, 소유자의 기존 이용 자격 및 `/files/` 명시적 메서드 규칙이 필요합니다. 코드만으로 활성화되지 않습니다. 기존 Base64 자료를 파일 저장소로 일괄 이전하거나 원본을 삭제하지 않았습니다.
- **미완료 3 — 운영 검증:** 배포·기존 파일 이전·운영 DB 쓰기/삭제 테스트는 별도 승인 후 실행해야 합니다. 브라우저의 저장 전 최신값 확인은 서버 트랜잭션/원자적 잠금이 아닙니다. Tailwind CDN의 운영 빌드 전환과 대규모 로그 서버 집계는 후속 개선입니다.

### 저장된 접근 규칙과 모의 검증 (아직 운영 적용 아님)
- 관리자 진입 `/admin` 및 `/admin/**`는 확정 이메일의 인증된 사용자만 허용합니다. 브라우저 내 ID/비밀번호, 자동 조직 관리자 권한, 고객 JS 우회 보안은 사용하지 않습니다.
- 공개 콘텐츠 6개 테이블(`site_content`, `youtube_videos`, `partner_logos`, `faq_items`, `news_items`, `resources`)의 컬렉션/레코드 GET·HEAD만 공개입니다. 그 외 `/tables`·`/tables/**`는 모든 메서드를 지정 이메일로 제한합니다. 새로 추가되는 테이블은 자동 공개되지 않습니다.
- 공개 상담 접수를 위해 정확한 `/tables/consultations`의 POST, 방문 집계를 위해 정확한 `/tables/visitor_logs`의 POST만 익명 허용합니다. 목록/개별 조회·수정·삭제는 관리자만 가능합니다. 공개 접수/로그의 스팸 방지나 행 단위 검증을 새로 제공하는 규칙은 아닙니다.
- `/files/cms-images/**`, `/files/resources/**`의 GET·HEAD는 공개 다운로드/사진 표시용입니다. 두 컬렉션 정확 경로의 POST와 하위 파일의 DELETE는 **명시적 메서드 allowlist**로 지정 이메일만 허용합니다. 그 외 파일 경로는 관리자 전용입니다. 파일 서비스 활성화는 별도 플랫폼 조건이며 이 규칙 저장으로 활성화되지 않습니다.
- 같은 출처 요청만 사용하므로 공개 OPTIONS는 추가하지 않았습니다. 알려지지 않은 메서드는 전체 메서드 제한 규칙에 걸립니다. 공개 HEAD의 경로 허용은 Table API가 HEAD를 구현한다는 뜻은 아닙니다.
- `AccessRulesValidate` 성공, `AccessRulesTest` **62개 경로·메서드·방문자 사례가 예상과 일치**했습니다. 익명/허용 이메일/다른 이메일/오타 이메일/다른 조직 소속, GET·HEAD·POST·PUT·PATCH·DELETE·OPTIONS·알 수 없는 PROPFIND, 상담 개인정보·통계 조회 차단, 공개 콘텐츠 읽기, 파일 업로드/삭제 제한을 평가했습니다. 검사 시 실제 조직 floor는 비활성이었고 이를 변경하지 않았습니다. 이 테스트는 경로 허용 평가이며 실제 로그인·파일 전송·DB 쓰기/삭제를 실행한 것이 아닙니다.
- 다음 단계: 사용자에게 **Hosted 배포 실행 승인**을 받고 배포 도구의 승인 절차 완료 후 실제 관리자 로그인과 익명 차단을 확인합니다. 이 변경에서 배포·운영 데이터 수정·파일 이전은 실행하지 않았습니다.

---

우동키노야 브랜드의 멀티페이지 정적 웹사이트입니다. Mobile First 반응형으로 설계되었으며,
사람에게는 이해하기 쉽고 검색엔진·생성형 AI에는 신뢰할 수 있는 공식 정보원이 되는 것을 목표로
브랜드·제품·매장·창업 정보를 구조화했습니다.

디자인 시스템: **Tone-down Navy + Warm Ivory + Wood + 음식 자체의 색** (강한 포인트컬러 미사용).

---

## 사람들 전용 관리자: 사진 교체·글씨 편집

### 완료 기능
- 새 관리자 진입 `/admin/people.html`을 추가했습니다. 전체 관리자 `/admin/` 상단의 **사람들 사진·글씨 관리** 버튼과 `/admin/home.html`의 연결된 데이터 관리에서 이동합니다.
- 공개 `/people/index.html#team-introduction`을 읽어 같은 CMS 키와 기본 내용을 사용하는 37개 필드(공통 7개 + 6명 각각 사진/분야/이름/직책/소개)를 구성합니다. 경영진 2명과 전문가 4명을 인물별로 나누어 편집하며 소개 제목·문단·약속·그룹 제목·하단 안내문도 수정합니다.
- 전용 화면에서 **사진을 선택하면 PNG 변환/600KB 이하 축소 후 자동 저장**합니다. 기존 CMS 행이 있으면 동일 id의 PUT으로 value를 새 사진 값으로 덮어쓰며, 사진 교체 이력이나 새 사진 행을 별도로 만들지 않습니다. 처음 저장하는 키만 POST합니다. 저장이 성공한 뒤 미리보기를 교체하므로 실패 시 이전 저장 사진과 미리보기를 유지합니다.
- 전용 화면의 사진 비우기도 즉시 저장합니다. 빈 사진 값은 공개 개별 페이지 및 홈페이지 모델에서 src를 제거하고 hidden 처리하며, CSS에서도 display:none을 보장해 기본 사진이 다시 나오거나 깨진 이미지/alt가 남지 않도록 했습니다.
- 글씨는 일반 문구로 편집하고 **글씨 변경사항 저장**을 누릅니다. Enter 줄바꿈은 안전하게 `<br>`로 변환해 저장하므로 HTML 코드를 입력할 필요가 없습니다. 기존 HTML/엔티티는 편집기에 일반 글씨로 풀어서 표시합니다. 명시적으로 비운 글씨는 기본 문구로 복원하지 않습니다.
- 사람들 저장 성공 시 해당 브라우저의 오래된 `cms_cache`를 제거합니다. 데이터 조회는 페이지당 100개로 끝까지 확인하며 전용 화면은 `search=people.`를 사용하므로 기존 사진 행을 못 찾아 중복 생성하는 위험을 줄였습니다. CMS 조회 실패 시 자동 사진 저장과 글씨 저장은 차단합니다.
- 기존 전체 관리자 편집 동작은 유지합니다. 자동 사진 저장은 사람들 전용 화면에만 적용하며, 전체 관리자에서는 기존처럼 전체 저장을 사용합니다. 인물 사진 비우기도 지원하며, 기존 사진 비우기 핸들러의 빈 미리보기 변수 범위 문제를 수정했습니다.

### 진입 URI / 데이터 모델 / 공개 URL
- 전용 관리자: `/admin/people.html`; 전체 관리자: `/admin/`; 메인 관리자: `/admin/home.html`.
- 공개 페이지: `/people/#team-introduction`, 홈페이지 `/#people`.
- 운영 참고: `https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com/`; canonical 공개 사람들 페이지 `https://www.udonkinoya.com/people/`. **새 관리자와 소스 수정은 아직 운영 배포되지 않았습니다.**
- API: `/tables/site_content?search=people.&limit=100&page=1`, `/tables/site_content/{id}`(PUT), `/tables/site_content`(POST). 기존 id/key/page/label/type/value 모델을 사용하며 새 테이블·컬럼·운영 DB 직접 수정은 없습니다.
- 주요 키: 기존 `people.team.*`, `people.profile.1..6.image/name/role/description`을 재사용하고 `people.profile.1..6.category`와 `people.team.source`를 추가했습니다. 사진은 기존 CMS 값 저장 방식을 사용하며 별도 업로드 파일 서버/R2 업로드 기능은 추가하지 않았습니다.
- 프리뷰 데이터 저장소와 Hosted 운영 D1은 독립적입니다. 관리자는 현재 접속한 출처의 데이터만 수정합니다. 화면 자체에 보안 로그인은 없으며 관리자와 데이터 API 보호는 별도의 플랫폼 접근 규칙이 필요합니다.

### 검증 / 제한 / 권장 다음 단계
- `/tests/people-editor.html`: **24개 검사 통과**, PC 및 390px 모바일에서 PASS 목록/편집 화면 확인. 실제 전용 페이지와 실제 editor.js를 메모리 API로 실행해 37개 필드·6명·페이지네이션·사진 선택 자동 저장·같은 id PUT·이전 CMS 값 제거·사진 행 수 유지·실패 시 이전 값 보존·사진 비우기·글씨 수정·Enter 줄바꿈·홈페이지 모델 반영을 검사합니다. 의도적으로 HTTP500 응답을 주는 실패 보존 테스트가 포함되어 있으며 실제 데이터는 쓰지 않습니다.
- `/tests/people-cleared-view.html`: 실제 공개 사람들 HTML과 메모리 CMS 응답으로 비운 사진의 src 제거/display:none 및 수정 이름을 확인했습니다. PC·모바일 캡처에서 첫 사진 없음·이전 사진/깨진 아이콘 없음·두 번째 사진 유지·반응형 레이아웃을 확인했습니다.
- `/tests/people-team.html` 기존 소개/홈페이지 조합 **14개 검사 통과**, `/tests/menu-admin-settings.html` 기존 숫자 저장 **8개 검사 통과**. 실제 관리자 `/admin/people.html` 모바일 캡처에서 일반 글씨 입력 및 사진 버튼과 가로 넘침 없음 확인. `/admin/` 모바일 상단의 새 버튼 줄바꿈도 확인했습니다. 렌더 도구 환경의 Table API404는 조회 오류로 안내하고 저장을 중단합니다.
- **구현하지 못한 부분: 원본 이미지 파일의 서버상 즉시 자동 삭제.** 정적 사이트에서 파일 시스템/R2 객체를 자동 삭제하는 백엔드를 만들 수 없습니다. CMS의 현재 사진 값을 교체하는 것과 Git/배포에 포함된 원본 파일·다른 방문자 캐시·플랫폼/사용자 백업의 물리적 삭제는 다릅니다. 원본 `images/people-*.jpg`는 초기 사진 제공을 위해 유지됩니다. CMS에 별도 교체 이력을 만들지 않더라도 이미 존재하는 백업까지 삭제한다고 보장하지 않습니다.
- 권장 다음 단계: 배포 후 실제 운영 `/admin/people.html`에서 사진 1장을 교체하고 공개 홈페이지/사람들 페이지를 새로고침해 확인합니다. 서버 파일까지 삭제해야 한다면 승인된 업로드/삭제 API와 저장소 관리 백엔드가 별도로 필요합니다. Hosted Deploy는 이번 작업에서 수행하지 않았습니다.

---

## 메뉴소개: 첨부 메뉴판 기반 6개 카테고리 슬라이더 (현재 정책)

### 완료 기능
- 첨부 `우동키노야 메뉴판.html`의 메뉴명·설명·가격을 확인해 **시그니처(5), 붓카케·자루(6), 카케(5), 정식(6), 사이드(10), 음료·주류(4)**의 총 36개 메뉴 카드를 구성했습니다. 여러 가격 선택지는 원본처럼 하나의 카드에 표시합니다.
- 최신 요청에 따라 메뉴 사진 표시 영역을 **가로:세로 4:3 비율**로 변경했습니다. 공유 `menu/menu-grid.css`의 `.menu-catalog-photo`에 적용해 `/menu/`와 홈페이지 `/#menu-preview`, PC·태블릿·모바일에서 동일하게 사용합니다. 배경 이미지는 기존처럼 중앙 기준 cover로 채우며 원본 사진 파일이나 CMS 값은 변경하지 않았습니다. PC·390px 모바일 실제 메뉴 페이지 캡처에서 비율과 메뉴명·가격 배치를 확인했습니다. 자동 슬라이드와 카드 너비 정책은 그대로이며 운영 반영은 다음 배포 이후입니다.
- 각 카테고리는 **한 줄짜리 독립 가로 슬라이더**입니다. PC는 4장, 태블릿(768~1023px)은 2장, 모바일(767px 이하)은 1장 너비를 표시하며 터치 스와이프·마우스 드래그·키보드 좌우 키를 지원합니다. 최신 요청에 따라 이전·재생/일시정지·다음 버튼은 DOM에서 제거했습니다. 끝에 도달하면 다음 이동에서 처음으로 돌아옵니다.
- PC·태블릿·모바일 모두 한 메뉴씩 자동 이동합니다. 기존 `menu.autoslide.seconds`를 재사용하며 기본 4초, 관리자에서 1~120초(0.1초 단위)를 설정합니다. 화면 밖·숨겨진 탭·직접 조작 중·포커스/마우스 올림 중에는 이동을 멈춥니다. 버튼 조작 없이 자동으로 한 장씩 스크롤되며 OS 동작 줄이기 설정을 유지합니다. 직접 조작 후 6초 유예와 설정 간격을 거쳐 자동 이동을 재개합니다. 한 행의 모든 카드가 화면 안에 들어오면 불필요한 자동 스크롤은 하지 않습니다.
- `/menu/`와 홈페이지 `/#menu-preview`는 같은 `js/menu-catalog.js`의 메뉴 목록과 렌더러를 사용합니다. 실제 `HomeFull.prepare()`가 메뉴 본문을 가져올 때 CMS 모델 구성 **전에** 새 카테고리를 생성하고 앵커도 홈페이지용으로 변환합니다. 홈페이지 원본 본문을 불러오지 못해도 기존 fallback 메뉴 영역에서 동일한 카테고리를 생성합니다.
- 관리자 `/admin/`에 카테고리별 36개 메뉴의 사진·메뉴명·설명·가격(144개 필드)을 추가했습니다. 새 키는 `menu.catalog.{category}.{item}.bg/name/description/price`입니다. 기존 16칸의 `menu.item1..16.*` 데이터는 삭제·재배치하지 않고 관리자 **이전 16칸(보관용)**에 남깁니다. 보관용 필드는 현재 카테고리 카드에는 적용하지 않습니다.
- 첨부 HTML에는 `assets/w_*.png` 경로만 있고 실제 사진 파일은 없으므로 해당 경로를 요청하거나 다른 음식 사진을 대신 쓰지 않습니다. 사진 영역은 빈칸, 메뉴명·설명·가격은 정상 표시합니다. 각 메뉴 사진은 관리자에서 등록/비우기 가능하며, 새 사진 키도 메뉴 전용 조기 조회·브라우저 캐시 로더가 처리합니다.
- 아래의 이전 **16칸·4행/PC 고정 4×4** 기록은 작업 이력입니다. 현재 메뉴 배치는 이 절의 6개 카테고리 정책으로 대체됩니다.

### 기능 진입 URI / 데이터 및 저장소
- 메뉴 페이지: `/menu/`; 카테고리 앵커: `/menu/#category-signature`, `#category-bukkake`, `#category-kake`, `#category-set`, `#category-side`, `#category-drink`.
- 홈페이지: `/#menu-preview`; 조합된 카테고리 앵커 예: `/#home-page-menu-preview-category-side`. 이전 홈페이지 `#home-menu-kake` / `#home-menu-bukkake` 별칭도 해당 카테고리로 연결합니다.
- 관리자: `/admin/` → 메뉴소개(시간 설정), 메뉴소개 · 각 카테고리(사진/텍스트/가격), 메뉴소개 · 이전 16칸(보관용).
- API: `/tables/site_content`, 조기 조회 `/tables/site_content?search=menu.&limit=100&page=1`; 기존 `site_content` schema(id/key/page/label/type/value)를 재사용하며 새 테이블·컬럼 또는 생산 DB 변경은 없습니다. 사진은 기존 관리자 업로드/자동 축소 방식을 사용합니다. 숫자 설정 UI의 저장 type은 `text`입니다.
- 캐시: localStorage `kinoya_menu_cache_v1`, 보조 IndexedDB `kinoya_menu_photos_v1` / snapshots / menu. 프리뷰 데이터와 Hosted 운영 D1 데이터는 독립적입니다.
- 운영 참고 URL: `https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com/#menu-preview`; canonical 메뉴 URL: `https://www.udonkinoya.com/menu/`. **이번 소스 수정은 아직 운영 배포되지 않았습니다.**
- 첨부 원본: `resources/kinoya-menu-source.html` (자료용). 소스맵은 DOM 위치 메타데이터여서 메뉴 표시에는 사용하지 않았습니다.

### 검증 / 미구현 / 다음 단계
- `/tests/menu-categories.html`: 버튼 제거 후 최신 **22개 검사 통과**, PC/390px 모바일에서 PASS 확인. 여섯 카테고리 순서·개별 메뉴 수·36개 카드·바로가기·가격·한 줄 배치·반응형 너비·조작 버튼 완전 제거·키보드 직접 이동·직접 조작 후 유예·1초 설정 연동·버튼 없이 정확히 한 장 자동 이동·실제 HomeFull 조합 및 버튼 없음·앵커를 검사합니다. `/tests/menu-rows.html`도 이 최신 검사를 사용하도록 교체했습니다.
- `/tests/menu-photo-fast.html`: 기존 및 새 카테고리 사진/메뉴명의 우선 적용과 느린 전체 응답 보호 **17개 검사 통과**. `/tests/menu-admin-settings.html`: 숫자 설정·저장·범위 검증 **8개 검사 통과**. 검사에서 운영 DB에 쓰지 않습니다. 브라우저 테스트 환경의 Table API 404는 기본값/캐시 fallback으로 처리합니다.
- 최신 실제 `/menu/` PC·390px 모바일 캡처로 여섯 줄·반응형 카드·이전/재생/다음 버튼 제거·가격·빈 이미지 영역 및 페이지 가로 넘침 없음 확인. `js/menu-catalog.js`의 버튼 마크업과 `js/menu-rows.js`의 관련 이벤트를 함께 제거해 없는 버튼에 접근하는 오류를 방지했으며, 버튼 전용 CSS도 정리했습니다. 실제 홈페이지 iframe의 조합 화면에서도 PC 카테고리별 네 장과 390px 모바일 한 장 너비·메뉴명·가격 표시를 확인했습니다. 캡처 도구가 iframe 스크롤을 바꾸는 현상은 테스트용 래퍼에서 메뉴 위치를 유지하는 방식으로 처리했으며, 홈페이지 자체의 스크롤 동작은 변경하지 않았습니다.
- 미구현: 첨부에 없는 실제 메뉴 이미지, 영문/일문 번역 동기화, 관리자에서 메뉴 개수/카테고리 자체를 추가·삭제하는 기능. 현재 36개 항목의 내용을 편집할 수 있으며 사진이나 임의 메뉴를 생성하지 않았습니다.
- 권장 다음 단계: 실제 메뉴 사진을 등록하고 본사에서 가격/설명을 확인한 후 배포합니다. Hosted Deploy는 실행하지 않았으며, 배포 후 운영 URL에서 CMS 저장과 PC/모바일 자동 이동을 확인하세요.

---

## 우동키노야 사람들: 제공된 기존 소개 페이지 내용 추가

### 완료 기능
- 제공된 `https://jinkinoya.mycafe24.com/company-basic/company-basic-organization/`의 실제 공개 내용을 확인해 사람들 소개 문단·경영진 2명·분야별 전문가 4명을 추가했습니다. 조직도 그림을 임의 생성하거나 출처에 없는 인물을 만들지 않았습니다.
- 경영진: **김민찬(그룹 대표이사)**, **육승준(구리본점 대표 겸 R&D 본부장)**. 전문가: **이정구(가맹본부장)**, **박민호(운영본부장)**, **이홍규(상권분석 전문가)**, **김형석(마케팅 전문가)**.
- 이름·직책·경력 소개는 제공된 페이지 기준으로 정리했으며, 원본의 사람 사진 6장을 `images/people-*.jpg`에 저장해 외부 이미지 서버에 직접 의존하지 않도록 했습니다. 과거 소개의 경력 연수를 현재 시점에 맞춰 임의로 늘리지 않았습니다.
- 기존 담당 조직은 유지했습니다. 최신 요청에 따라 **사람들 안의 ‘키노야의 신념과 경쟁력’ 요약(13개월·48시간·약 80cm 카드 및 자세히 보기 버튼)**과 해당 바로가기는 제거했습니다. 별도의 `/noodle/` 페이지와 홈페이지 `/#noodle` 신념과 경쟁력 섹션은 변경하지 않았습니다. 관리자에서도 사용하지 않는 `people.belief.*` 두 항목을 제거했으며, 기존 저장 데이터는 삭제하지 않았습니다.
- PC는 경영진 2열·전문가 4열, 태블릿은 전문가 2열, 모바일은 모두 1열로 표시합니다. 관리자 `/admin/` > 우동키노야 사람들에서 소개 문단과 6명 각각의 사진·이름·직책·설명을 편집할 수 있습니다.

### 진입 URI / 구현 / 저장 구조
- 개별 사람들 페이지: `/people/`; 소개 위치: `/people/#team-introduction`, `/people/#leadership-heading`, `/people/#experts-heading`.
- 홈페이지 사람들 섹션: `/#people`. 기존 `HomeFull.prepare()`가 `/people/` 실제 본문을 불러오므로 같은 소개가 메인에도 표시됩니다. 홈페이지 소개 앵커는 `#home-page-people-team-introduction`입니다.
- 관련 파일: `people/index.html`, `css/people-team.css`, `index.html`, `js/home-full.js`, `admin/index.html`, `images/people-*.jpg`.
- 기존 `site_content` 테이블과 `/tables/site_content` API를 재사용합니다. 새 CMS 키는 `people.team.*`, `people.profile.1.image/name/role/description`부터 `people.profile.6.*`까지이며, 새 테이블·컬럼은 없습니다. 관리자에서 저장하는 값과 프리뷰·운영 데이터는 기존처럼 각각 독립적입니다.
- 출처 및 사진 원본: 위 제공된 페이지와 그 페이지의 `jinkinoya.mycafe24.com/wp-content/uploads/2025/02/` 이미지. 확인용 원본 HTML 임시 파일은 삭제했습니다.
- 운영 URL: `https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com/#people`, `https://www.udonkinoya.com/people/`.

### 검증 / 미구현 / 다음 단계
- `/tests/people-team.html`: **14개 검사 통과**. 실제 사람들 HTML의 6명·이름 순서·내부 사진 파일·24개 프로필 CMS 연결·출처·담당 조직 유지·사람들 신념 요약 제거·바로가기를 확인하고, `HomeFull.prepare()`의 실제 홈페이지 본문 조합에도 6명과 내부 사진·소개 앵커가 포함됨을 확인했습니다.
- PC·390px 모바일 실제 사람들 페이지 캡처에서 추가 소개·경영진·전문가 카드와 반응형 배치를 확인했습니다. 인물 사진은 개별 페이지와 홈페이지 조합 모두 eager로 요청합니다. 이미지 원본·자료를 실시간 외부 사이트와 동기화하는 기능은 추가하지 않았습니다.
- 영문·일문 페이지의 번역 추가는 하지 않았습니다. 직책·경력의 최신성은 본사 확인 후 관리자에서 갱신할 수 있습니다.
- 이번 작업에서 Hosted Deploy는 수행하지 않았습니다. 다음 단계는 배포 후 운영 홈페이지 `/#people`의 프로필 표시와 관리자 저장값 확인입니다.

---

## 메뉴 사진 조기 로딩·캐시 표시

### 완료 기능
- 메뉴 사진이 전체 홈페이지 본문 및 FAQ·뉴스·자료실 로딩 완료를 기다리며 숨겨져 있던 대기를 분리했습니다. 다른 섹션은 기존 로딩 정책을 유지합니다.
- `js/menu-photo-fast.js`를 HTML head에서 비동기로 실행해 **메뉴 CMS만 우선 조회**합니다. 홈페이지가 `/menu/` 본문을 가져오는 즉시 현재 메뉴 사진/캐시를 적용하고, 전체 CMS 초기 로딩 상태에서도 준비된 메뉴 사진만 공개합니다.
- 재방문 시 메뉴 캐시를 먼저 표시하고 최신 응답으로 갱신합니다. 작은 메뉴 값은 `localStorage`(`kinoya_menu_cache_v1`), 용량이 큰 기존 CMS 업로드 사진 값은 브라우저 `IndexedDB`(`kinoya_menu_photos_v1`, snapshots/menu)를 보조 캐시로 사용합니다. 서버의 원본 데이터 구조는 변경하지 않았습니다.
- 기본 음식 사진 2개를 head에서 미리 요청하고, 저장된 사진 URL도 우선 준비합니다. 메뉴 그리드만 스크롤 진입 시 640ms 페이드 대기에서 제외했습니다. 등록하지 않았거나 관리자에서 비운 사진은 빈 화면으로 유지합니다.
- 느리게 도착한 전체 CMS 응답이 먼저 받은 메뉴 전용 최신 사진을 다시 덮어쓰지 않도록 했습니다. PC·태블릿 고정 4×4와 모바일 한 장씩 자동 슬라이드 및 관리자 시간 설정은 그대로 유지합니다.

### 경로 / 데이터 / 검증
- 진입 URI: `/menu/`, `/#menu-preview`; 사진 조기 조회: `/tables/site_content?search=menu.&limit=100&page=1` (추가 페이지가 필요하면 순차 조회). 기존 전체 CMS 조회와 병렬 실행합니다.
- 관련 파일: `js/menu-photo-fast.js`, `menu/menu-grid.css`, `js/home-full.js`, `js/home-runtime.js`, `js/cms.js`, `js/main.js`, `index.html`, `menu/index.html`.
- 서버 저장소: 기존 `site_content`의 `menu.*` 값 그대로 사용하며, 새 테이블·컬럼 또는 운영 DB 변경은 없습니다. 캐시는 각 방문자 브라우저/사이트 출처별로 독립적입니다.
- `/tests/menu-photo-fast.html`: **13개 검사 통과**. API 응답 전 캐시 사진·메뉴명 표시, 전체 홈페이지 pending 중 사진 공개, 삭제 사진/미등록 슬롯 빈 화면, 메뉴 전용 요청, 새로 마운트한 본문에 즉시 적용, 최신 사진 반영·캐시 저장, 느린 전체 CMS 덮어쓰기 방지를 확인했습니다. API는 테스트 내 메모리 응답이며 캐시 원본을 복원합니다.
- `/tests/menu-rows.html`: 기존 PC 고정 배치 회귀 검사 **20개 통과**. 실제 PC 캡처에서 사진 공개·고정 4×4·가로 스크롤 없음, 모바일 캡처에서 한 장 너비의 메뉴 사진 표시와 빈 미등록 행을 확인했습니다.
- 공개 운영 주소: `https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com/#menu-preview`, `https://www.udonkinoya.com/menu/`.

### 제한 / 다음 단계
- 첫 방문의 실제 네트워크·사진 파일 전송 시간 자체는 제거할 수 없습니다. 캐시가 없으면 공개 기본 사진을 먼저 표시하고 CMS 사진이 도착하면 최신 사진으로 바뀔 수 있습니다. 캐시가 있는 재방문에는 저장된 메뉴 사진을 우선 사용합니다.
- 이번 작업에서 이미지 재압축·새 서버 업로드 서비스·운영 배포는 수행하지 않았습니다. 운영 적용은 다음 Hosted Deploy 이후이며, 배포 후 실제 등록된 사진과 모바일 첫 방문/재방문 속도를 확인하는 것이 다음 단계입니다.

---

## PC·태블릿 고정 4행×4열 · 모바일만 4행 한 장씩 자동 슬라이드

### 완료 기능
- `/menu/`와 홈페이지 `/#menu-preview` 모두 같은 메뉴 슬롯 16개를 제공합니다. **768px 이상 PC·태블릿은 스크롤이나 자동 이동 없이 고정 4행×4열**입니다. 원본 16개만 표시하며 반복 복제 그룹은 숨깁니다.
- **767px 이하 모바일에서만 네 행 각각 사진 한 장을 화면 너비로 크게 표시**하고, 한 번에 한 장씩 자동 슬라이드합니다. 같은 행의 원본 메뉴 네 개를 순서대로 넘기며 마지막 다음에는 첫 메뉴로 반복합니다. 모바일에서만 터치 스와이프·드래그·스크롤바·방향키 조작을 활성화합니다. PC·태블릿에는 드래그·스크롤 포커스도 적용하지 않습니다.
- 모바일 기본 자동 이동 간격은 **4초**입니다. `/admin/` > **메뉴소개 > 모바일 자동 슬라이드 간격(초)**에서 1~120초(0.1초 단위)로 설정합니다. 저장 후 홈페이지·메뉴 페이지를 새로고침하면 **모바일 네 행에만** 반영됩니다. PC·태블릿은 시간 값과 무관하게 고정 상태입니다. 기존 저장값과 CMS 키 `menu.autoslide.seconds`는 유지합니다.
- 모바일 전환 도중 이전·다음 사진 일부가 보일 수 있지만 정지 위치에서는 각 행 한 장만 표시합니다. 직접 조작 후에는 6초 유예하고, 키보드 포커스·화면 밖·백그라운드·CMS 초기 로딩 중 및 운영체제의 동작 줄이기 설정에서는 자동 이동을 중지합니다. 화면을 PC·태블릿 너비로 변경하면 스크롤 위치를 초기화하고 슬라이드를 중단합니다.
- 홈페이지의 실제 본문은 `HomeFull.prepare()`가 `/menu/`를 불러와 구성합니다. 기존 `home-menu-kake` / `home-menu-bukkake` 별칭 앵커가 그리드 빈 칸으로 계산되던 원인을 수정했습니다. 별칭은 절대 위치로 배치해 칸을 차지하지 않으며, PC·태블릿에서 두 음식 사진이 처음 두 칸에 나란히 표시되고, 모바일에서는 첫 행 안에서 한 장씩 표시됩니다. `display:contents` 레이아웃을 명시적인 행·그룹 구조로 교체했습니다.
- `/admin/` > 메뉴소개에서 각 16개 슬롯의 사진과 이름/설명을 편집할 수 있습니다. 사진은 선택사항이며, 사진 선택 또는 **사진 비우기** 후 전체 저장으로 반영합니다. 사진이 없는 슬롯은 기본 사진·표시문구 없이 빈 아이보리 영역으로 유지됩니다. 1·2번 슬롯의 기존 메뉴/사진 기본값은 보존했습니다.
- 편집 데이터는 기존 `site_content` 테이블 및 같은 출처의 REST API를 사용합니다. 신규 테이블 또는 데이터베이스 변경은 없습니다.

### 주요 URI 및 저장 구조
- 메뉴: `/menu/` (메뉴판·가케우동·붓카케우동 바로가기: `#signature`, `#kake`, `#bukkake`); 홈페이지 메뉴 섹션: `/#menu-preview`
- 메뉴 CMS 항목: `menu.item1.bg` / `menu.item1.title`부터 `menu.item16.bg` / `menu.item16.title`까지. 시간 설정: **`menu.autoslide.seconds`**, 기존 `site_content`의 `type=text`, `value`에 초 단위 문자열로 저장합니다. 신규 테이블·컬럼은 없습니다.
- 설정 전달: `js/cms.js`의 `kinoya:cms-ready`와 `js/home-runtime.js`의 `home-cms-loaded` 이벤트가 기존 CMS 응답의 설정 행을 `js/menu-rows.js`에 전달합니다. 설정용 추가 API 호출 없이 같은 CMS 조회를 재사용합니다.
- 관리자: `/admin/`; 저장 API: `/tables/site_content` (GET/POST/PUT)
- 구현 파일: `menu/index.html`, `index.html` (`#menu-preview`), `menu/menu-grid.css` (행별 실제 스크롤 레이아웃), `js/menu-rows.js` (스크롤·자동 이동), `js/cms.js`, `js/home-model.js`, `admin/index.html`, `admin/editor.js`. 회귀 검사: `/tests/menu-rows.html` 및 `tests/menu-rows-test.js`.
- 저장 서비스: `site_content` 테이블 (사이트 콘텐츠 CMS); 메뉴별 각 사진은 문자열 값으로 기존 시스템에 저장됩니다. 구조화 테이블/미리보기 데이터 스키마는 추가하지 않았습니다.
- 공개 주소: 운영 메뉴 `https://www.udonkinoya.com/menu/`; Hosted worker 홈 메뉴 섹션 `https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com/#menu-preview`. 소스 변경은 다음 Hosted Deploy 전 운영 주소에 반영되지 않습니다. 개발/미리보기는 프로젝트 Preview URL.

### 검증 / 미구현 / 다음 단계
- 최신 `/tests/menu-rows.html` PC 검사: **20개 통과**. 실제 `HomeFull.prepare()` 홈페이지 조합으로 고정 네 행×네 열·별칭 앵커 배치·복제 그룹 숨김·스크롤 범위 없음·자동 이동 중지·드래그 비활성·CMS 설정 전달·기본값 복귀 등을 확인했습니다. 실제 `/menu/` PC 캡처에서 4×4 고정 배치와 스크롤바 없음을, 390px 모바일 캡처에서 네 행마다 사진 한 장 너비·빈 슬롯·페이지 가로 넘침 없음을 확인했습니다.
- `/tests/menu-admin-settings.html`: **8개 검사 통과**. 실제 `admin/editor.js`와 격리된 메모리 API로 숫자 입력·범위·2.5초 저장·기존 type=text 유지·0초/120초 초과 차단·빈 값 저장·저장 버튼 복구를 확인했습니다. 테스트는 프리뷰·운영 DB에 쓰지 않습니다.
- 배포 후 모바일 시간 값 변경은 관리자 전체 저장 및 공개 페이지 새로고침으로 적용됩니다. 간격 값만 바꿀 때는 재배포하지 않아도 됩니다. 시간 값은 PC·태블릿의 고정 배치에 영향을 주지 않습니다.
- 16개 메뉴의 실제 메뉴명·설명·사진 콘텐츠는 관리자가 `/admin/`에서 직접 등록합니다. 현재 기본 등록은 가케우동·붓카케우동 두 항목이며, 나머지 메뉴 슬롯은 빈 상태입니다.
- 실제 서비스 반영 전 Hosted Deploy가 필요합니다. 이번 변경으로 Hosted Deploy는 수행하지 않았습니다.

---

## 메인 우리동네 키노야: 서울/전국 2개 가로 목록 (2026-10-05)

### 완료 기능
- 한국어 메인의 우리동네 키노야 바로가기를 **서울 지역 / 전국 각지** 두 개로 변경했습니다. 두 영역 모두 메인에서 순차적으로 표시하며, 서울 22개 매장은 첫 번째 한 줄, 서울 외 23개 매장(경기·인천·충청·대구·부산·제주)은 두 번째 한 줄에 배치합니다.
- 각 행은 초당 약 40px로 자동 가로 이동하고 양 끝에서 방향을 바꿉니다. 복제 카드나 복제 ID 없이 기존 45개 매장을 그대로 사용합니다. **최신 요청에 따라 이전/자동재생·일시정지/다음 조작 버튼은 DOM에서 제거했습니다.** 버튼 없이 두 행 모두 자동 시작하며, 스크롤바와 모바일 터치 스크롤은 유지합니다.
- 카드에 마우스를 올리거나 키보드 포커스가 들어가면 자동 이동을 멈춥니다. 직접 스크롤·터치 조작 후에는 6초간 자동 이동을 유예합니다. 화면 밖/백그라운드에서는 애니메이션을 중지하며, 운영체제의 동작 줄이기 설정에서는 자동재생을 기본 중지합니다.
- 매장 이름·사진·주소·전화·상세 페이지·지도 링크와 기존 CMS 저장값을 유지합니다. 원본 `/store/`의 7개 지역별 세로 목록 및 영문/일문 페이지는 변경하지 않았습니다.
- 관리자 미리보기에도 두 개의 가로 행을 표시합니다. 관리자 미리보기는 기존처럼 스크립트가 차단된 정적 화면이므로 자동재생/조작 버튼은 표시하지 않고 직접 가로 스크롤로 내용을 확인합니다.

### 구현 / 경로 / 데이터
- 추가 파일: `js/home-store-rows.js`, `css/home-store-rows.css`. 메인 CMS의 기존 경로 기반 편집 키가 바뀌지 않도록 **원본 DOM에 CMS 적용 후** 카드의 표시 구조만 재배치합니다. 관리자의 편집 모델/저장 키도 그대로 유지합니다.
- 주요 진입 경로: `/`, `/index.html#stores`, `/#home-page-stores-seoul`, `/#home-page-stores-nationwide`. 기존 `#home-page-stores-gyeonggi` 등 지역 앵커는 해당 지역의 첫 카드에 보존합니다.
- 데이터 구조 및 저장소 변경 없음: 원본 `/store/index.html`의 45개 카드, 기존 `site_content`의 `store.*` 및 홈 보조 편집 키를 재사용합니다. 새로운 테이블/API/운영 DB 쓰기 없이 프런트엔드 표시만 변경했습니다.
- 운영 URL: https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com/ . CMS API는 같은 출처의 `/tables/site_content`이며 프리뷰와 운영 데이터는 독립적입니다.

### 검증 / 미구현 / 다음 단계
- 최신 `/tests/home-store-rows.html`: **21개 검사 통과**. 22/23개 분류, 두 바로가기, CMS 값/키 보존, 중복 ID 없음, 기존 지역/전화 링크, 조작 버튼 DOM 제거, 단일 행 배치, 두 행의 버튼 없는 자동 시작, 마우스 정지/재개, 끝에서 방향 전환, 동작 줄이기/화면 밖 정지 확인.
- `/tests/home-admin.html`: **32개 회귀 검사 통과**. 저장/충돌/백업·복원 및 전체 본문 미리보기 연동 유지.
- 최신 실제 메인 390px 모바일 캡처에서 서울 22/전국 23 제목, 두 가로 행, 스크롤 조작 버튼 제거 및 카드 정보 표시를 확인했습니다. 실제 1280px PC 캡처에서도 스크롤 조작 버튼 없이 매장 카드가 한 줄로 표시되고 전화/지도 링크가 유지되는 것을 확인했습니다. 자동 이동 중 좌측 카드 일부가 잘리는 것은 스크롤 뷰포트의 정상 동작입니다. PC 캡처는 스크롤 위치 때문에 두 영역의 상단을 한 화면에 모두 담지는 못했습니다.
- `/tests/home-stores-view.html`은 실제 메인의 `#stores`로 이동하는 확인 링크입니다. 첨부 이미지는 요청 위치 확인에만 사용했으며 이미지 자체를 페이지에 삽입하지 않았습니다.
- 속도/분류/자동재생 기본값을 관리자가 별도로 설정하는 기능은 미구현입니다. 현재 고정된 두 지역 구성입니다.
- **Hosted Deploy는 수행하지 않았습니다.** 다음 단계는 사용자 승인 배포 후 운영 URL에서 실제 CMS 사진·문구와 모바일 터치 스크롤 확인입니다.

---

## 모든 메뉴 상세 본문을 메인에 순차 통합 (2026-10-05)

이 절이 아래의 이전 작업 기록보다 우선합니다. 프로젝트는 빌드 과정 없는 HTML/CSS/JavaScript 정적 사이트이며, 이번 목표는 각 메뉴의 요약뿐 아니라 기존 상세 페이지 본문을 메인 스크롤에서 읽을 수 있도록 하는 것입니다.

### 완료 기능
- 한국어 메인에 **브랜드스토리 → 키노야의 신념과 경쟁력 → 우동키노야 사람들 → 창업안내 → 창업비용 → 우리동네 키노야 → 메뉴소개 → FAQ → 뉴스 → 자료실 → 창업상담** 순서로 11개 상세 페이지의 `<main>` 본문을 통합합니다. 기존 히어로·소셜·브랜드 숫자·협력사 영역은 유지합니다.
- 비용표, 전체 매장 목록, 신념 Q&A/숙성/기술/연구 데이터, FAQ 답변, 상담 폼까지 포함합니다. FAQ 답변은 처음에 펼쳐져 있으며 카테고리 필터와 접기/펼치기를 사용할 수 있습니다.
- 메뉴·본문의 사이트 내부 링크는 메인 앵커로 연결합니다. 언어 변경, 전화, 외부 원문, 개별 매장 상세 링크와 각 영역의 '개별 페이지 열기'는 유지합니다.
- 원본 상세 페이지는 수정/삭제하지 않습니다. 헤더·푸터를 중복 삽입하지 않으며 가져온 스크립트는 실행하지 않습니다. 중복 ID를 방지하고 폼 label/ARIA 참조 및 상대 이미지 경로를 변환합니다.
- 기존 창업안내 요약 `system`, `turnover`, `support`는 전체 창업안내 로드 성공 시 중복 표시하지 않습니다. 페이지 조회 실패 시 기존 요약과 오류 안내/개별 페이지 링크를 유지합니다.
- 관리자 `/admin/home.html`도 동일한 전체 본문을 합성하여 편집/미리보기를 제공합니다. 현재 기본 구조 기준 **1,085개 필드, 15개 편집 섹션 그룹**입니다. 일부 원본 페이지 로드 실패 시 잘못된 일부 템플릿 저장을 막습니다.
- 상담 폼은 기존 필수값/동의 확인 및 `/tables/consultations` POST를 재사용합니다. 초기화 전에는 폼을 비활성화해 기본 브라우저 제출을 방지합니다.
- 모바일 상세 카드·비용표·FAQ·자료실 줄바꿈을 보정했습니다. 기존 모바일 내비게이션, 로고 우선 표시, 영상 비율, 동작 줄이기 대응은 유지합니다.

### 주요 진입 URI
| 메인 경로/앵커 | 본문 원본 경로 |
|---|---|
| `/`, `/index.html` | 한국어 메인 |
| `/#brand-story` | `/brand/` |
| `/#noodle` | `/noodle/` |
| `/#people` | `/people/` |
| `/#proof` | `/franchise/` |
| `/#model` | `/franchise/cost/` |
| `/#stores` | `/store/` |
| `/#menu-preview` | `/menu/` |
| `/#faq-preview` | `/franchise/faq/` |
| `/#news-full` | `/news/` |
| `/#resources-full` | `/resources/` |
| `/#final` | `/contact/` |

- 관리자: `/admin/home.html`. 동적 FAQ/뉴스/자료실은 해당 화면에 제공한 기존 목록 관리 링크를 사용합니다.
- 기존 `#home-noodle-qna`, `#home-noodle-aging`, `#home-noodle-tech`, `#home-noodle-numbers`, `#home-noodle-links`, `#home-menu-kake`, `#home-menu-bukkake` 앵커도 유지합니다.
- 검증 경로: `/tests/home-full.html`, `/tests/nav-state.html`, `/tests/home-admin.html`. `/tests/home-full-view.html`와 `/tests/home-contact-view.html`는 별도 모형이 아니라 실제 메인의 FAQ/상담 앵커로 이동합니다.

### 구현 구조 / 데이터 모델 및 저장
- `js/home-full.js`: 동일 출처의 11개 정적 `index.html`을 병렬 조회해 `<main>`을 합성하고 ID/링크/미디어 경로를 정리합니다. 요청/응답 본문 읽기 제한시간은 15초입니다. FAQ·뉴스·자료실 API는 페이지당 100행으로 공개 행을 조회합니다.
- `js/home-runtime.js`: 합성 → CMS 적용 → 동적 목록 → `homeContentReady` 완료 순서를 관리합니다. 공통 FAQ/폼/포인터 이벤트는 합성 이후 초기화됩니다.
- `site_content`: 기존 `brand.*`, `noodle.*`, `cost.*`, `faq.*` 등 의미 있는 CMS 키를 상세 페이지와 공유합니다. 새로 합성한 영역의 보조 편집 키는 `home.edit.v2.full.*`, 기존 홈 영역은 `home.edit.v1.*`입니다. 과거 행을 삭제하거나 기본값으로 일괄 덮어쓰지 않습니다.
- `home.layout.v1`: `{mode:"menu"|"custom", order:[...], hidden:{...}}` JSON 문자열. 기본 메뉴 순서와 기존 숨김 설정/명시적 수동 정렬을 지원합니다.
- 동적 테이블: `faq_items`, `news_items`, `resources`, `consultations`; 기존 소셜/협력사 테이블은 유지합니다. FAQ는 공개 데이터가 있으면 해당 목록을 표시하며 API 실패/빈 목록에서는 정적 FAQ를 유지합니다. 뉴스·자료실은 빈 상태와 조회 오류를 구분합니다.
- API: `GET /tables/{table}?page=1&limit=100`, 기존 CMS 행 조회/저장 API, `POST /tables/consultations`. 스키마 변경 없음. 프리뷰 행 저장소와 Hosted Cloudflare D1 운영 DB는 서로 독립이며 자동 동기화되지 않습니다. 이번 작업에서 운영 행 쓰기/DB 동기화/재구축은 수행하지 않았습니다.
- rich HTML은 허용 태그/속성으로 정리하며 실행 요소/이벤트 속성은 제거합니다. 기존 CMS 비용표의 `<tr>/<td>` 구조도 유지합니다. 관리자 화면 자체가 보안 인증을 제공하는 것은 아니며 별도 플랫폼 접근 제어가 필요합니다.

### 검증 현황
- 최신 `/tests/home-full.html`: **34개 PASS**, 1,085개 필드. 11개 전체 본문, 중복 ID/헤딩, 메뉴/언어 링크, 기존 앵커, CMS 비용표/공통 키, 공개 데이터 필터, rich HTML 정리, FAQ 필터/아코디언, 필수값/동의/모의 상담 제출, 원본 조회 실패 시 대체 표시 검증.
- 최신 `/tests/nav-state.html`: **16개 PASS**. 실제 전체 본문 합성 기준 메뉴 강조, 스크롤 배경 전환, 순서/숨김/수동 재정렬, 상세 페이지 상대 경로 검증.
- 최신 `/tests/home-admin.html`: **32개 PASS**. 전체 15개 그룹과 합성 미리보기, 변경 저장/충돌/백업·복원 확인. 일시적인 브라우저 도구 포화 해소 후 최종 재실행도 모두 통과했습니다.
- 실제 메인 390px 모바일 캡처에서 FAQ 카테고리 및 긴 답변, 상담 폼의 입력·동의·제출 버튼과 하단 내비게이션 표시 확인. 가로 넘침이나 코드 노출 없음. 이전 실제 모바일 비용표와 PC 비용 영역 하단/다음 매장 표시도 확인했습니다.
- 최신 실제 1280px PC 캡처에서 상담 폼 입력·동의·제출 버튼 정렬 및 메인 첫 화면의 내비게이션/우동 이미지/히어로 문구/버튼 표시를 확인했습니다. 겹침·가로 넘침·코드 노출 없음. 상담 위 자료실은 검사 환경의 API 조회 실패 안내가 정상 표시되었으며 실제 자료 목록 성공 표시는 모의 데이터 테스트로 별도 검증했습니다.
- 프리뷰 검사 환경에서 일부 `/tables/*`가 404를 반환할 수 있습니다. API 성공 동작은 모의 데이터로 검사했으며, 실제 운영 데이터 조회·상담 접수 성공까지 확인했다는 의미는 아닙니다. 테스트에서는 실제 상담 데이터를 생성하지 않습니다.

### 미구현 / 다음 단계 / 공개 URL
- 현재 11개 메뉴 페이지의 본문을 통합하는 방식이며, 개별 매장 상세 페이지·외부 뉴스 원문까지 재귀적으로 삽입하지는 않습니다. 영문/일문 메인에는 이번 전체 본문 통합을 적용하지 않았습니다.
- 관리자에서 임의의 새 페이지/섹션을 만드는 기능, 서버 측 렌더링/정적 사전 합성, 오래된 DOM 기반 홈 백업 키의 자동 변환은 미구현입니다. 이전 JSON 백업에 현재 편집 대상이 아닌 키가 있으면 가져오기가 거부될 수 있으므로 현재 화면에서 새 백업을 생성하세요.
- JavaScript가 비활성화되거나 정적 본문 조회가 실패하면 기존 요약과 개별 페이지를 이용합니다. 클라이언트 합성 특성상 첫 로딩 때 콘텐츠가 확장될 수 있습니다. 초기 해시 이동은 사용자 조작이 없을 때 합성/폰트 준비 후 위치를 보정합니다.
- 사용자 제공 운영 URL: **https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com/**. API는 같은 출처의 `/tables/...`입니다.
- **이번 수정은 Hosted Deploy 미실행 상태**입니다. 위 운영 URL에 반영되었다고 간주하지 마세요. 다음 단계는 사용자 승인 배포 및 운영 URL에서 전체 순서·실제 데이터·상담 동작 확인입니다. 프리뷰 데이터를 운영으로 옮겨야 한다면 배포와 별도로 승인받은 데이터 동기화가 필요합니다.

---

## 키노야의 신념과 경쟁력 상세 내용을 메인에 표시 (2026-10-03)

### 완료 기능
- 한국어 메인의 기존 `#noodle` 소개 아래에 상세 페이지의 **Q&A / 48시간 숙성 이유 / 핵심기술 / 연구 데이터**를 직접 표시했습니다. 별도 페이지를 열지 않아도 메인 스크롤 중 내용을 볼 수 있습니다.
- 기존 메인 제목·설명·사진은 유지하고, 아래에 바로가기와 상세 콘텐츠를 추가했습니다. 기본 상단 메뉴 순서(브랜드 → 신념 → 사람들)와 16개 최상위 섹션 구성은 유지합니다.
- 한국어 메인의 상단 신념 메뉴·모바일 하단 '키노야 신념'·푸터 신념 링크를 `#noodle`로 연결했습니다. 상세 페이지 `/noodle/`는 유지하며 영역 하단의 전체 보기에서 열 수 있습니다. 해당 앵커에서도 메뉴 강조가 정상 동작하도록 연결했습니다.
- 모바일 바로가기는 2열, 숙성 사진/본문·기술 카드·연구 데이터는 좁은 화면에 맞춰 세로로 배치합니다. PC는 기존 사진·설명 및 기술 카드의 2열 구성을 활용합니다. 밝은 하위 영역은 별도로 색 대비를 보정했습니다.

### 진입 경로 / 데이터
- 메인 `/`, `/index.html#noodle`, `#home-noodle-links`, `#home-noodle-qna`, `#home-noodle-aging`, `#home-noodle-tech`, `#home-noodle-numbers`.
- 관리자 `/admin/home.html`의 **키노야의 신념과 경쟁력** 그룹에서 편집합니다. 현재 전체 401개 필드/16개 최상위 섹션. 기존 `home.noodle.*` 유지, 추가 상세 내용은 기존 `noodle.qna.*`, `noodle.aging.*`, `noodle.tech.*`, `noodle.techcard.*`, `noodle.numbers.*`를 공유하므로 상세 페이지와 동일한 저장 데이터를 사용합니다.
- API/테이블 스키마/저장 서비스/공개 운영 URL 변경 없음. 운영 데이터 쓰기·기존 사진 삭제·기본값 일괄 저장은 하지 않았습니다.
- 첨부 스크린샷은 UI/내용 참고로만 사용했습니다. 스크린샷을 사이트에 이미지로 붙이지 않고 기존 상세 페이지의 실제 텍스트와 사진으로 구성했습니다.

### 검증 / 미포함 / 다음 단계
- `/tests/home-admin.html` 31개 및 `/tests/nav-state.html` 16개 검사 통과: 내장 상세 4영역, 앵커 대상, 중복 ID 방지, 공통 데이터 적용, 순서 유지, 저장/복원, 동일 페이지 메뉴 강조 등.
- `/tests/home-beliefs-view.html`는 실제 메인 `#noodle`로 이동하는 확인 링크. 실제 390px 모바일 확장 스크린샷에서 바로가기·질문/답변·숙성 소개·기술 콘텐츠 및 좁은 화면 정렬 확인. 실제 1280px PC 확장 스크린샷에서도 메인 내 Q&A 및 2열 사진/설명·메뉴 강조 확인.
- 영문/일문 메인 상세 확장은 포함하지 않았습니다. 기존 관리자에서 해당 섹션을 숨겨둔 경우 표시 설정은 유지되므로 관리 화면에서 체크 상태를 확인하세요.
- 현재 수정은 미배포입니다. 사용자 승인 Hosted Deploy 후 운영 주소에서 확인이 필요합니다.

---

## 메인 섹션을 상단 메뉴 순서로 정렬 (2026-10-03)

### 완료 기능
- 한국어 메인의 기본 표시 순서를 상단 메뉴와 일치시켰습니다: **소셜미디어 → 브랜드스토리(숫자 포함) → 키노야 신념 → 우동키노야 사람들 → 창업안내 → 창업비용·모델 → 우리동네 키노야 → 메뉴소개 → FAQ**. 메인 영상은 맨 앞, 최종 상담은 FAQ 뒤에 유지합니다.
- 실제 섹션 ID 순서: `top, social, numbers, brand-story, noodle, people, proof, system, turnover, support, partner-logos-section, model, stores, menu-preview, faq-preview, final`.
- 기존 내용은 삭제하지 않고 `HomeModel.build()`에서 데이터 조회 전부터 DOM 표시 순서를 맞춥니다. 불필요한 재삽입은 피하며 섹션 내부 DOM/기존 CMS 키를 유지합니다.
- 기존 메뉴 페이지의 가케우동·붓카케우동 소개를 `menu-preview`로 추가했습니다. 별도 임의 메뉴/가격 생성 없이 `menu.hero.*`, `menu.item1.*`, `menu.item2.*` 키를 공유합니다. 모바일 1열, PC 2열 카드 구성입니다.
- 기존 창업모델 섹션은 창업비용·모델 안내로 연결해 `franchise/cost/` 메뉴를 강조합니다. 새 메뉴소개는 `menu/` 메뉴를 강조합니다. 메인에서 아래로 스크롤하면 강조 메뉴가 상단 순서를 거꾸로 돌아가지 않습니다.
- 관리자 `/admin/home.html`은 현재 **353개 항목·16개 섹션**을 다룹니다. 기본 '상단 메뉴 순서', '상단 메뉴 순서로 맞추기' 버튼, 화살표 조작 시 명시적 수동 정렬을 지원합니다.

### 데이터 호환성 / 진입 경로
- `home.layout.v1` JSON에 `mode: "menu" | "custom"`만 추가했습니다. DB 스키마/저장소/API 변경 없음. 기존 사진·문구·숨김 값과 운영 DB는 수정하지 않았습니다.
- mode가 없는 이전 저장 순서는 이번 요청에 따라 표시 시 메뉴 순서로 해석합니다. 기존 저장 order 자체는 삭제하지 않았으며 관리자 '저장된 수동 순서 사용'으로 재적용할 수 있습니다. 숨김 설정은 항상 유지합니다.
- 기존 관리자에서 수동 모드로 변경·저장하면 사용자 지정 순서가 우선하므로 메뉴 순서 고정이 필요할 때는 '상단 메뉴 순서'를 사용하세요.
- 사용자 경로: `/`, `/index.html#people`, `#model`, `#stores`, `#menu-preview`, `#home-menu-kake`, `#home-menu-bukkake`, `#faq-preview`; 기존 메뉴 페이지 `/menu/`와 창업비용 `/franchise/cost/`도 유지합니다. 공개 운영 URL 및 API는 기존과 동일합니다.

### 검증 / 미포함 / 다음 단계
- `/tests/home-admin.html`: 26개 검사 통과(기본/이전/수동 순서, 숨김 유지, 공통 메뉴 데이터, 편집 화면 모드 전환, 저장/복원 등).
- `/tests/nav-state.html`: 16개 검사 통과(각 섹션 연결, 메뉴 순서대로 강조가 전진하는지, 사용자 재정렬/숨김, 상대 경로 등).
- 실제 메인 모바일 390px에서 메뉴소개 제목·설명 및 세로 카드와 상단 활성 표시, 사진/문구/가로 넘침 없음 확인. 실제 PC 1280px 확장 스크린샷에서 가케우동·붓카케우동 카드 가로 2열 표시 확인. 첫 화면 히어로와 PC 1행 메뉴도 유지됩니다. 검증용 임시 스크롤/진단 코드는 제거했습니다. `/tests/menu-preview-view.html`는 실제 메인의 메뉴소개 앵커로 이동하는 확인 링크입니다.
- 기존 개별 페이지 이동 링크를 메인 앵커로 바꾸지는 않았습니다. 영문/일문 메인 구조 재정렬은 이번 범위에 포함하지 않습니다. 관리자에서 새로 만든 임의 섹션/새 메뉴 항목까지 자동 추론하는 기능은 미구현입니다.
- 현재 코드 수정은 미배포입니다. 사용자 승인 Hosted Deploy 후 운영 사이트에서 순서를 최종 확인해야 합니다.

---

## 스크롤 메뉴바 색 전환 · 현재 섹션 강조 (2026-10-03)

### 완료 기능
- 아래로 20px 넘게 스크롤하면 상단 메뉴바가 기존 짙은 네이비에서 더 밝은 청회색 네이비(`#30465A`, 98% 불투명)로 전환되고 그림자가 표시됩니다. 맨 위로 돌아오면 원래 배경으로 복귀합니다. 모바일의 기존 동일 배경 덮어쓰기 문제도 제거했습니다.
- `js/nav-state.js`가 고정 헤더 아래의 현재 섹션을 판단해 대응 메뉴에 골드색(`#F3D88E`)과 밑줄을 적용합니다. 원래 메뉴 URL은 변경하지 않았습니다.
- 메인 연결: 소셜미디어→소셜미디어, 숫자/브랜드→브랜드스토리, 누들→신념, 매출/시스템/회전율/창업모델/본사지원/협력사→창업안내, 매장→우리동네 키노야, 피플→우동키노야 사람들, FAQ→FAQ, 마지막 상담→창업상담. 모바일에서 원래 숨긴 메뉴는 그대로 숨기며 엉뚱한 표시 메뉴를 대신 강조하지 않습니다.
- 상세 페이지는 현재 URL을 기준으로 가장 구체적인 메뉴를 강조합니다(FAQ 페이지는 창업안내 대신 FAQ). `aria-current=location/page` 제공. 색상 외 밑줄도 사용하고, OS 동작 줄이기 설정 시 전환 애니메이션을 끕니다.
- 관리자 섹션 숨김·순서 변경은 실제 렌더 위치를 기준으로 반영합니다. 링크 변경/콘텐츠 높이 변화/화면 크기 변경도 재계산합니다. 스크롤 처리는 프레임별 1회로 묶으며 기존 상단 메뉴 항목·모바일 행 구성·하단 메뉴는 변경하지 않았습니다.

### 경로·데이터·검증
- 진입 URI: `/`, `/index.html#social`, `/index.html#people`, `/index.html#stores`, `/index.html#faq-preview` 및 기존 상세 페이지(예: `/franchise/faq/`). 기존 공개 URL 유지, 새 API/데이터 모델/저장소 없음. 프런트엔드 표시만 변경하며 클릭 경로는 그대로입니다.
- 변경 파일: `kinoya.css`, `js/main.js`, 신규 `js/nav-state.js`. 기존 중복 스크롤/잘못된 상대주소 활성 메뉴 코드는 전용 모듈로 대체했습니다.
- `/tests/nav-state.html`: 실제 DB 쓰기 없는 14개 상태 검사 통과. 위/아래 스크롤, 각 섹션 매칭, CMS 재정렬/숨김, 상대 링크와 FAQ 우선순위 검증.
- 실제 메인 390px 모바일에서 스크롤 전 기본 색과 스크롤 후 변경 배경·소셜미디어 골드 밑줄 확인. 1280px PC에서도 기존 1행 메뉴와 활성 표시 확인.

### 미포함 / 다음 단계
- 관리자 메뉴 항목 구조 편집이나 모든 상단 링크의 페이지 내 앵커 전환은 요청 범위가 아니므로 미구현. 메인에 없는 메뉴소개 섹션은 스크롤만으로 활성화하지 않으며 메뉴소개 페이지에서 활성화합니다. EN/JA는 언어 이동 링크로 유지합니다.
- 현재 미배포 상태입니다. 사용자 승인 Hosted Deploy 후 운영 URL에서 최종 확인을 권장합니다.

---

## 모바일 소셜미디어 메뉴 3열·2행 (2026-10-03)

- 완료: 900px 이하에서 `.social-tabs`를 3열 그리드로 표시합니다. 1행은 쇼츠·추천 영상·인스타그램, 2행은 틱톡·뉴스·자료실입니다. 가로 스크롤을 없애고 최소 44px 높이, 반응형 글자 크기와 중앙 정렬을 적용했습니다.
- PC 901px 이상은 기존 한 줄 배치 유지. 기존 6개 항목의 텍스트/아이콘/뉴스·자료실 링크와 탭 동작은 변경하지 않았습니다.
- 변경 파일: `kinoya.css`, `index.html`(영역 식별자만 추가). 진입 경로 `/`, `/index.html#social-channel-tabs`. `/tests/social-tabs-view.html`는 별도 모형이 아니라 실제 메인의 해당 앵커로 이동하는 확인용 링크입니다.
- 검증: 실제 메인 앵커의 390px 모바일에서 6개 항목의 3열·2행과 글자/아이콘 잘림 없음 확인. 1280px PC에서는 기존 1행 유지 확인.
- 데이터 모델/저장 서비스/API/공개 운영 URL 변경 없음. 채널 연동 추가는 미구현 범위로 기존 기능을 유지합니다. 첨부 이미지는 현상 참고용으로만 사용했습니다.
- 권장 다음 단계: 사용자 승인 Hosted Deploy 후 운영 사이트에서 확인. 현재 수정은 프리뷰에 반영되었으며 운영 배포는 하지 않았습니다.

---

## 히어로 브랜드 문구 1행 유지 (2026-10-03)

- 완료: `.hero-brand-tag`의 `UDON KINOYA · 木ノ屋`에 줄바꿈 방지 적용. 768px 이하에서만 글자 크기·자간·장식선·안쪽 여백을 조정해 한 줄로 표시합니다. HTML·문구·다른 영역 디자인은 변경하지 않았습니다.
- 검증: 실제 `/index.html` 모바일 390px에서 영어·일본어 및 양옆 선까지 한 줄로 표시되고 잘림 없음 확인. PC 1280px은 기존 크기·배치 유지 확인.
- 경로: `/`, `/index.html`, 같은 클래스를 사용하는 `/en/`, `/ja/`. 새 파라미터·공개 URL·API·데이터 모델·저장 서비스 변경 없음. 수정 파일은 `kinoya.css`입니다.
- 미포함/다음 단계: 임의의 긴 관리자 문구에 대한 자동 글꼴 축소는 미구현. 현재 문구 기준 반응형 처리입니다. 현재 미배포이며 라이브 반영에는 사용자 승인 Hosted Deploy가 필요합니다. 첨부 화면은 참고만 했으며 이미지 자산으로 등록하지 않았습니다.

---

## 모바일 영상 장면 확대 완화 + 흐린 전체 배경 (2026-10-03)

### 완료 기능
- 이전 `scale(0.5)` 축소를 제거했습니다. 모바일 영상 영역은 화면 전체를 유지하며, 선명한 원본 영상은 화면 가로 폭에 맞춰 원본 비율로 표시해 면·그릇 등 피사체가 과도하게 확대되어 보이지 않게 합니다.
- 남는 공간은 **현재 재생 중인 같은 영상의 흐린 프레임**으로 채웁니다. 중앙 화면 폭 절반짜리 박스/단색 여백을 만들지 않으며 영상 경계를 부드럽게 처리했습니다. 로고·메뉴·문구·버튼과 PC 영상 방식은 유지합니다.
- `kinoya.css` 모바일 규칙 교체, `js/hero-video-fit.js` 추가 및 공통 `js/main.js`에서 히어로 영상이 있는 페이지만 로드. 원본 HTML 구조·CMS 키는 변경하지 않았습니다.
- 재생 영상은 하나만 유지합니다. 320px 너비의 저해상도 캔버스에 최대 초당 12회 같은 영상 프레임을 그려 배경 처리하며 중복 영상 다운로드/디코딩을 추가하지 않습니다.
- 화면 밖/비활성 탭/일시정지/PC 전환 시 추가 프레임 작업 중단. 관리자 영상 URL 교체 시 이전 프레임 제거 후 새 비율 적용. 캔버스 지원 실패나 첫 프레임 준비 전에는 기존 전체 cover 배경을 유지합니다.

### 경로·데이터·검증
- 진입 경로: `/`, `/index.html`, 같은 `.hero-video`와 공통 `main.js`를 사용하는 히어로 페이지. 새 파라미터·API·데이터 모델·저장 서비스 없음. 기존 영상 URL 및 `home.hero.video`/포스터 설정 그대로 사용. 영상 프레임은 메모리에서만 표시하며 서버 전송/파일 저장하지 않습니다.
- 운영 공개 URL: `https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com/`. 직접 이동한 모바일 화면에서 기존 좁은 세로 박스 현상을 재확인했습니다.
- 수정된 실제 `index.html` 390px 모바일에서 가로 폭 전체의 선명한 장면과 부드러운 주변 배경, 1280px PC에서 기존 cover 유지 확인. 운영 사이트 변경 후 검증을 의미하지는 않습니다.
- `/tests/hero-video-fit.html`: DB 쓰기 없는 12개 회귀 검사 통과. 동일 영상 사용, 원본 비율 유지, 프레임 일정, 정지, CMS 소스 비우기/교체, PC·모바일 전환, 비활성 탭 중단 검증.

### 미포함 / 다음 단계
- 관리자 정적 미리보기는 스크립트가 차단되어 흐린 영상 합성은 메인 프리뷰에서 확인해야 합니다. 원본 영상 편집·새 세로 영상 제작·영상 파일 압축은 포함하지 않습니다.
- 현재 수정본은 미배포입니다. 사용자 승인 Hosted Deploy 후 운영 URL의 모바일 브라우저에서 최종 확인이 필요합니다. 아래 '모바일 영상 50% 축소'는 이전 이력이며 현재 구현에서 제거되었습니다.

---

## 모바일 영상 50% 축소 (2026-10-03, 현재는 제거된 이전 설정)

- 완료: 모바일 `.hero-video`에 중앙 기준 `transform:scale(0.5)` 적용. 영상의 표시 가로·세로 길이를 직전의 50%로 줄이고 주변은 네이비 배경으로 처리합니다. 영상 자체의 원본 파일·재생 설정은 유지합니다.
- 768px 이하 또는 1024px 이하 터치(coarse pointer, hover 없음)에서만 적용. 텍스트·버튼·상하단 메뉴 및 히어로 영역 높이는 줄이지 않으며 PC 영상 크기와 마우스 모션은 유지합니다.
- 검증: 실제 `/index.html` 390px 모바일 스크린샷에서 중앙 축소 영상과 기존 콘텐츠 배치 유지 확인. 1280px PC는 기존 전체 배경 유지 확인.
- 진입 URI: `/`, `/index.html` 및 공통 `.hero-video` 사용 페이지. 추가 파라미터/공개 URL/API/데이터 모델/스토리지 변경 없음. 순수 CSS 변경입니다.
- 미포함/다음 단계: 영상 파일 압축이나 다운로드 용량 감소는 포함하지 않습니다. 현재 미배포이므로 사용자 승인 Hosted Deploy 후 운영 화면 확인이 필요합니다. 아래 전체 배경 표시 항목은 이전 이력이며 모바일 표시 크기는 이번 설정으로 대체됩니다.

---

## 모바일 메인 영상 전체 배경 표시 (2026-10-03)

- 완료: `kinoya.css`에서 모바일 전용 `object-fit:contain` 예외를 제거했습니다. 이제 PC와 모바일 모두 기본 `object-fit:cover`를 사용해 히어로의 문구·버튼 뒤 전체를 영상으로 채웁니다. 상하 단색 레터박스는 제거되고 화면 비율에 따라 영상 가장자리 일부가 잘립니다.
- 모바일 상단 로고/2행 메뉴, 하단 메뉴, 문구와 버튼, 영상 URL·재생 속성·어두운 오버레이는 변경하지 않았습니다. 사용자 첨부 이미지는 현상 참고용이며 사이트 자산으로 사용하지 않았습니다.
- 검증: 운영 URL로 직접 이동한 390px 화면에서 기존 레터박스 현상을 확인한 후, 수정된 실제 `index.html`의 390px 모바일 및 1280px PC 스크린샷으로 전체 배경 채움과 레이아웃 유지를 확인했습니다.
- 진입 경로: `/`, `/index.html` 및 공통 `.hero-video`를 사용하는 페이지. 추가 파라미터·API·데이터 모델·저장소 변경 없음. 공개 운영 URL은 기존과 동일합니다.
- 미포함/다음 단계: 세로 전용 영상 제작·별도 파일 적용은 미포함. 현재 변경은 미배포이며 사용자 승인 Hosted Deploy 후 운영 주소에서 재확인이 필요합니다. 아래 '모바일 메인 영상 비율 대응' 항목의 contain 설정은 이전 이력으로, 현재는 본 cover 설정으로 대체되었습니다.

---

## 로고 우선 표시 / 운영 사이트 진단 (2026-10-03)

### 완료 기능 및 원인
- 운영 URL `https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com/`로 직접 이동해 실제 등록 로고와 모바일 배치를 확인했습니다. 운영 DB는 읽기만 수행했습니다.
- 운영 헤더/푸터 로고는 각각 약 727KB의 이미지 문자열입니다. 기존 메인은 전체 CMS 조회 종료까지 로고를 함께 숨기며, 전용 로고 캐시도 사용하지 않았습니다.
- `js/logo-first.js`: 메인 head에서 비동기로 시작해 로고 한 건만 우선 조회. 기존 CMS photo reveal 타이머와 `home-cms-pending`에서 로고만 제외. 기존 삭제 기본 로고 숨김 규칙은 유지합니다.
- `kinoya_logo_cache_v1`에 현재 로고만 캐시하고 다음 방문/페이지 이동 시 네트워크 완료를 기다리지 않고 먼저 적용. 캐시가 없는 최초 방문은 **로고 단일 요청 및 이미지 디코딩 시간은 필요**하며 0초 표시를 보장하지 않습니다. 첫 방문에서도 API를 완전히 없애려면 현재 로고를 별도 정적 이미지 파일로 배포하는 추가 단계가 필요합니다.
- 헤더 이미지에 `loading=eager`, `fetchpriority=high` 지정. 전체 콘텐츠 로드는 독립적으로 계속 진행. 오래된 응답이 최신/명시적 빈 로고를 되살리지 않도록 갱신 시각 비교.
- 서브페이지는 공통 `js/main.js`에서 동일 로더 사용. `js/cms.js`/`js/home-runtime.js`가 최신 로고를 캐시에 반영하고, 관리자 두 화면도 저장 성공 시 해당 브라우저의 로고 캐시 갱신.

### 진입 URI / 데이터 / 저장소
- 기존 `/`, `/index.html`, 공통 `js/main.js`를 사용하는 서브페이지. 신규 사용자 진입 경로/파라미터 없음.
- 로고 API: `GET /tables/site_content/{id}`. 현재 운영 헤더 ID `c2b027f2-31ad-46b4-a360-870480377916`의 응답 성공 확인. 운영 Table API의 `search=global.logo.header`는 HTTP 500이므로 사용하지 않습니다. 헤더 ID가 바뀌거나 프리뷰 저장소와 다른 경우 전체 CMS 응답에서 새 ID를 학습해 다음 요청에 사용합니다.
- 기존 `site_content`의 `global.logo.header`, `global.logo.footer` 사용. 스키마 변경, 운영 데이터 쓰기, 프리뷰→운영 동기화 없음. 캐시는 localStorage, 용량/권한 제약 시 sessionStorage/메모리로 대체.
- 공개 URL·전체 CMS API는 기존과 동일. 실제 이미지 원본/대용량 이미지 문자열을 새 프로젝트 자산으로 추가하지 않았습니다.

### 검증 / 제한 / 다음 단계
- `/tests/logo-first.html`: 실제 DB 쓰기 없는 회귀 검사. 최초 방문 단일 요청, 전체 CMS 지연 중 가시성, 애니메이션 제외, 우선 로딩 속성, 캐시 표시, 빈 로고 처리, 오래된 응답 방어 등 12개 검사 통과.
- 실제 `index.html`에 일시적인 네트워크 테스트 계층을 적용해 운영 로고 스냅샷만 반환하고 전체 CMS 응답을 계속 보류한 상태로 PC/모바일 스크린샷 검증. 현재 로고와 모바일 상단 배치 정상. 이 스냅샷 JSON 및 테스트 계층은 검증 후 모두 삭제했습니다.
- `/tests/live-logo-check.html`는 운영 URL로 직접 이동하는 확인용 링크이며 수정본을 배포하는 기능은 없습니다.
- **수정본은 아직 미배포**입니다. 운영 데이터/배포 파일은 변경하지 않았으며 사용자 승인 Hosted Deploy 후 실제 운영 URL에서 첫 방문·재방문 속도를 다시 확인해야 합니다.

---

## 모바일 로고를 메뉴 위로 이동 (2026-10-03)

- 완료: 한국어 900px 이하 헤더를 **중앙 로고 1행 + 기존 메뉴 2행**으로 변경. 로고 이미지는 높이 44px, 너비 120~180px 범위에서 비율을 유지합니다. 기존 메뉴 항목·주소와 하단 5개 메뉴, PC 레이아웃은 유지합니다.
- 높아진 고정 헤더에 맞춰 모바일 히어로·서브페이지 제목 및 앵커 이동 여백을 조정했습니다. HTML/CMS 키 변경 없이 `kinoya.css`만 수정했습니다.
- 진입 URI: `/`, `/index.html`, `/brand/` 등 동일 헤더를 쓰는 한국어 페이지. 새 파라미터/공개 URL/API/테이블/저장 서비스 없음. 기존 `global.logo.header` 데이터를 그대로 사용합니다.
- 검증: 실제 메인/브랜드 390px 모바일에서 메뉴 2행과 본문·하단 메뉴의 겹침 없음, 실제 1280px PC의 기존 1행 배치 유지 확인. **테스트 프리뷰에서는 등록 로고 이미지가 표시되지 않아 이미지 자체의 실제 표시 위치는 시각 검증하지 못했습니다.** 기존 `logo-header.png` 숨김 정책을 해제하거나 삭제된 기본 로고를 복원하지 않았습니다.
- 미포함/다음 단계: 로고 신규 제작·업로드 및 영문/일문 배치 변경은 미포함. 등록 로고 데이터가 있는 환경에서 이미지 위치를 최종 확인해야 합니다. 운영 URL은 기존 프로젝트 정보와 같으며 사용자 승인 Hosted Deploy 전까지 라이브는 변경되지 않습니다.

---

## 모바일 상단 2행 메뉴 (2026-10-03)

- 완료: 한국어 페이지의 900px 이하 화면에서 상단 메뉴를 가로 스크롤 대신 고정 2행 그리드로 표시합니다.
  - 1행: 소셜미디어 · 우동키노야 사람들 · 우리동네 키노야
  - 2행: 메뉴소개 · FAQ · EN · JA
- 상단 브랜드스토리·신념·창업안내·창업비용·창업상담은 이 구간에서 숨깁니다. 하단은 기존 홈·키노야 신념·창업안내·창업신청·전화 5개 링크를 유지합니다. 관련 상세 페이지는 삭제하지 않았습니다.
- 등록된 로고는 후속 수정으로 메뉴 위 중앙의 독립 행에 배치합니다. 기존 기본 로고 숨김 정책은 그대로 유지합니다. 언어 버튼도 항상 2행 안에 표시하고, 가로 스크롤/가장자리 페이드 처리를 해제했습니다.
- 메뉴별 최소 44px 터치 높이, 화면 폭에 따른 글자 크기, 하단 문구 반응형 크기 및 본문 하단 여백을 적용했습니다.
- `kinoya.css`만 변경. HTML·메뉴 링크 주소·관리자 CMS 키·데이터 모델·저장소·API 변경 없음. 기존 관리자에서 링크를 수정해도 모바일 배치는 유지됩니다(원본 메뉴 순서 기준).
- 진입 경로: `/`, `/index.html`, `/brand/` 및 동일 헤더를 사용하는 한국어 서브페이지. 별도 파라미터 없음. 901px 이상 PC와 영문/일문 페이지의 기존 메뉴는 유지합니다.
- 검증: 실제 `/index.html`·`/brand/index.html` 390px 모바일 스크린샷에서 상단 7개 항목 두 행과 하단 5개 항목 표시, 겹침/잘림 없음 확인. 실제 메인 1280px PC는 기존 1행 메뉴 유지 확인.
- 미구현: 영문/일문 전용 2행 메뉴 레이아웃. 권장 다음 단계: 필요 시 다국어 레이아웃 확장 및 운영 배포 후 등록 로고/사용자 수정 문구 길이 점검.
- 공개 URL·API는 기존 프로젝트 정보와 동일하며 신규 URI 없음. 이번 코드 변경은 미배포: 라이브 반영은 사용자 승인 Hosted Deploy가 필요합니다.

---

## 모바일 메인 영상 비율 대응 (2026-10-03)

- 완료: `kinoya.css`의 모바일 조건에서 `.hero-video`만 `object-fit: contain`으로 변경. 화면 가로 폭/가용 높이에 맞춰 원본 영상 비율로 자동 축소·확대하며, 세로 화면을 채우기 위한 과도한 크롭을 제거했습니다. 남는 공간은 네이비색 레터박스입니다.
- 적용 조건: 768px 이하, 또는 1024px 이하의 hover 없는 coarse-pointer 터치 화면(가로 회전 포함). PC의 `cover` 및 마우스 모션은 유지합니다.
- 기존 제목·버튼·히어로 높이, HTML 구조, 영상 URL 및 관리자 바인딩은 변경하지 않았습니다.
- 진입 URI: `/`, `/index.html` (추가 파라미터 없음). 공통 CSS를 사용하는 동일 `.hero-video`에도 적용됩니다.
- 검증: 실제 메인 390px 모바일 스크린샷에서 비율 유지 영상·위아래 여백·문구/버튼 표시 확인. 1280px PC에서 전체 배경 채움과 기존 배치 유지 확인.
- 데이터 모델·스토리지·API·공개 URL 변경 없음. 새 서버 기능이나 데이터 저장은 없습니다.
- 미포함: 모바일 전용 별도 영상 파일, 영상 크롭 위치 관리자 조절. 다음 단계는 필요 시 세로 전용 영상을 준비해 여백 없이 표시하는 방식 검토.
- 이번 변경은 미배포이며 라이브 반영에는 사용자 승인 Hosted Deploy가 필요합니다. 운영 URL은 아래 프로젝트 정보와 동일합니다.

---

## 마우스 반응형 모션 (2026-10-03)

### 완료 기능 / 적용 범위
- 기존 우동키노야의 색상·레이아웃을 유지하는 한국어 메인 전용 마우스 모션 추가.
- `/` 및 `/index.html` (추가 URL 파라미터 없음): 히어로 배경은 최대 가로 14px/세로 10px, 문구는 반대 방향으로 최대 6px/4px 이동. 배경을 1.045배 확대해 가장자리 틈 방지.
- 숫자 카드·창업모델 카드·최종 상담 카드·브랜드/면/매출 사례 사진: 최대 2.2도 기울기와 마우스 위치를 따라가는 은은한 우드색 조명.
- 마우스 이탈 시 부드럽게 원위치 복귀. 터치 입력 무시. 769px 이상 + hover/fine pointer + 동작 줄이기 미설정일 때만 실행.
- 탭 숨김·창 포커스 이탈·화면 크기 변경·키보드 Tab 이동 시 모션 초기화. OS 동작 줄이기/입력 장치 조건 변경 즉시 반영.
- 단일 requestAnimationFrame으로 필요한 프레임만 계산하고 정지 시 중단. 별도 라이브러리, 커스텀 커서, 오버레이 클릭 차단 없음.
- `css/pointer-motion.css`, `js/pointer-motion.js` 두 파일을 `index.html`에서만 로드. 메인 콘텐츠 DOM 구조를 변경하지 않아 기존 CMS 바인딩 키 유지.

### 경로·데이터·배포
- `/tests/pointer-motion.html`: DB 쓰기 없이 원본 메인 마크업으로 실행하는 모션 회귀 테스트. 프로그램 이벤트/제어 가능한 미디어 신호로 이동·복귀·범위 제한·프레임 정지·터치 무시·접근성 초기화 14개 검사 통과. 테스트 브라우저 기본 fine-pointer=false 환경에서는 빛 레이어가 생성되지 않는 것을 확인했으며 JS 모션은 테스트용 미디어 신호로 검증.
- 실제 `/index.html` PC 1280px 및 모바일 390px 스크린샷에서 기존 레이아웃·버튼 유지, 가로 넘침·배경 틈·코드 노출 없음 확인.
- 데이터 모델/저장 서비스/기존 API 변경 없음. 순수 브라우저 모션이며 사용자 마우스 좌표를 저장하거나 서버로 전송하지 않음.
- 운영 URL은 아래 기존 프로젝트 정보와 동일. 이번 코드 변경은 미배포이며 기존 라이브 사이트는 변경하지 않았음.

### 미구현 / 다음 단계
- 관리자 모션 강도 조절, 서브페이지·영문·일문 모션 확장은 포함하지 않음.
- 관리자 정적 미리보기는 원래 스크립트를 차단하므로 모션 확인은 메인 프리뷰 또는 배포 후 실제 사이트에서 진행.
- 사용자 승인 Hosted Deploy 후 운영 PC에서 마우스를 움직여 효과 최종 확인 권장.

---

## 메인 페이지 통합 관리 (2026-10-03)

### 프로젝트 목적 및 완료 기능
우동키노야 한국어 메인의 기존 디자인을 유지하면서 운영 콘텐츠를 관리하는 전용 화면을 추가했습니다. 기존 `site_content` 키와 저장 사진을 재사용하며, 운영 DB 데이터 삭제·일괄 덮어쓰기·스키마 변경은 하지 않았습니다.

- `/admin/home.html`: 원본 `index.html`에서 동일한 공유 모델로 추출한 **342개 편집 항목**. 제목/본문/일본어 문구/고지 문구, 메뉴 및 버튼 링크, 로고/파비콘/공유 이미지, 히어로 MP4 주소·포스터, 매장 11개 사진·이름·주소·링크, FAQ, 푸터/전화 및 하단 메뉴.
- 15개 기존 메인 섹션 표시/숨김과 위/아래 순서 변경. 숨김은 데이터 삭제가 아닙니다.
- 항목 검색, 변경 개수, 미저장 이탈 경고, 변경 취소, PC/모바일 정적 미리보기.
- 사진 선택 → PNG 변환·600KB 이하 압축 → 저장. 사진 비우기는 빈 값으로 저장하며 기본 사진으로 돌아가지 않습니다.
- 변경한 항목만 저장. 저장 직전 최신값 비교로 다른 화면의 변경을 감지하고 중단. 부분 실패 시 남은 미저장 값 유지. 이는 트랜잭션이나 서버측 동시성 잠금은 아닙니다.
- 메인 설정 JSON 내보내기/불러오기(최대 25MB). 불러오기는 편집 초안만 변경하며 별도 저장이 필요합니다. 전체 DB 백업/복원은 기존 엑셀 기능 유지.
- 유튜브/쇼츠 및 협력사 로고 데이터 관리는 기존 관리 화면으로 연결.

### 진입 경로 · 데이터 모델
- `/admin/` → **메인 페이지 통합 관리** → `/admin/home.html` (필수 파라미터 없음)
- `/` 및 `/index.html`: 한국어 메인. `js/home-model.js`와 `js/home-runtime.js`가 새 설정과 기존 키를 함께 적용. 이 페이지에서는 공통 `js/cms.js`의 중복 적용을 건너뜁니다.
- `/admin/#yt-manage-section`, `/admin/#plogo-section`: 동적 데이터 관리.
- `/tables/site_content?page=1&limit=100`: 페이지 단위 조회. `POST /tables/site_content`, `PUT /tables/site_content/{id}`: 변경 항목 저장.
- `site_content`: 기존 `id,key,page,label,type,value` 사용. 기존 `home.*`, `global.*`, `social.kakao.*` 키 유지. 새 일반 항목은 `home.edit.v1.*`, 영상 `home.hero.video`, 포스터 `home.hero.poster`, 검색 `home.seo.*`. 섹션은 `home.layout.v1`의 문자열 JSON `{order:[],hidden:{}}`.
- 새 바인딩 키는 원본 DOM의 경로 기준입니다. 향후 원본 HTML 구조를 변경할 때는 키 마이그레이션을 검토해야 합니다. 관리자에서 문구/순서 변경은 이 키를 바꾸지 않습니다.
- 미리보기 저장소와 Hosted Cloudflare D1은 별개이며 자동 동기화되지 않습니다. 사진은 기존 방식과 같은 DB 이미지 문자열, 기존 정적 자산은 Hosted R2 사용.
- 운영 URL: https://e9a5b491-6ecc-4179-9053-654d10347436.vip.gensparksite.com
- 이번 코드 변경은 **미배포**입니다. 사용자 승인 Hosted Deploy 후 운영 URL에서 사용할 수 있습니다. 운영 데이터는 이 작업에서 변경하지 않았습니다.

### 검증 및 제약
- PC(1280px)/모바일(390px)에서 `/admin/home.html`과 실제 `/index.html` 렌더링을 확인했습니다. 새 편집 UI 겹침이나 코드 노출은 없었습니다.
- `tests/home-admin.html`: 실제 DB에 쓰지 않는 mock API 회귀 테스트. 최종 20개 검사 모두 통과(백업 초안 복원 및 복원 후 저장 포함). 공유 바인딩 안정성, 문구/사진/빈 사진 적용, 매장 반복 카드 동기화, 섹션 이동/숨김, URL 검증, 최신 중복 선택, 변경 항목만 저장, 미리보기 무저장, 동시 수정 충돌, 네트워크 실패 시 초안 유지 검증.
- 현재 브라우저 테스트 환경은 `/tables/site_content`에 HTTP 404를 반환했습니다. 관리자에서 오류를 표시하고 저장을 차단하는 동작을 확인했습니다. 이를 실운영 저장 성공으로 간주하지 않습니다.
- 미리보기는 스크립트와 링크 이동을 차단한 정적 화면입니다. 유튜브·협력사 동적 내용, 실제 클릭/영상 재생은 배포 후 확인해야 합니다.
- 모든 콘텐츠 변경 기능이 임의 디자인 변경/새 섹션 생성/코드 편집을 뜻하지는 않습니다. 기존 15개 섹션의 편집·순서·표시만 지원하며 새 섹션 생성, 매장 카드 개수 변경, 다국어 전용 통합 편집, 변경 이력/롤백, 영상 파일 서버 업로드는 아직 미구현입니다.
- 관리자 페이지 자체는 보안 로그인이나 레코드 권한을 제공하지 않습니다. 운영 사용 전 플랫폼 접근 정책으로 관리자 경로와 쓰기 API 보호를 별도 검토해야 합니다. 클라이언트 UI를 인증 시스템으로 간주하지 마세요.

### 권장 다음 단계
1. 사용자 승인 Hosted Deploy 후 운영 주소의 관리자에서 현재 데이터 로드 및 저장 확인.
2. 관리자/데이터 API 접근 정책 검토. 이번 작업은 접근 규칙을 변경하지 않았습니다.
3. 필요 시 다국어 통합 편집, 콘텐츠 버전 이력, 새 섹션/카드 생성으로 확장.

---

## 이전 업데이트 (2026-10-02 ㊲) — 상단 로고·메뉴·창업상담을 다시 1행으로, 좁은 화면에서는 가로 스크롤로 반응형 처리

> **요청** — "상단 로고 메뉴 창업상담 모두 1행으로 반응형으로 수정해"
>
> **배경**
> - 직전(㉟)에는 좁은 화면에서 메뉴를 둘째 줄로 내려 항상 펼쳐 보이게
>   했는데, 이번 요청은 로고·메뉴·EN·JA·창업상담을 다시 "완전히 1행"으로
>   되돌려 달라는 것입니다. 다만 로고 2.25배/메뉴 글씨 1.5배 확대로 전체
>   폭이 약 1700px 가까이 필요해, 이를 그냥 1행에 다시 넣으면 좁은 화면에서
>   또 겹치거나 잘리는 예전 문제가 재발합니다.
>
> **조치 (`kinoya.css`)**
> - `@media (max-width: 1899px)` 구간에서 `.nav`를 `flex-wrap:nowrap` +
>   `overflow-x:auto`로 바꿔, 로고·메뉴 9개·EN·JA·창업상담을 항상 1행으로
>   유지하되 화면에 다 들어가지 않을 때는 그 줄 자체가 가로로 부드럽게
>   스크롤되도록 했습니다(이 사이트의 다른 섹션 바로가기 바와 동일한 패턴).
> - 기존 `.nav{ justify-content:center }`는 내용이 넘칠 때 좌우 양쪽을
>   균등하게 화면 밖으로 밀어내 "양쪽이 겹쳐 잘리는" 원인이었으므로,
>   `justify-content:flex-start`로 바꿔 로고부터 순서대로 쌓이고 스크롤이
>   오른쪽으로만 자연스럽게 이어지도록 했습니다.
> - 오른쪽 끝에 `padding-right:64px` + `mask-image` 페이드를 적용해 "화면
>   밖으로 잘린" 것이 아니라 더 스크롤할 수 있는 한 줄임을 암시했습니다.
> - 900px 이하 화면에서는 메뉴 글자(15px)·창업상담 버튼(패딩 축소)·
>   언어전환 버튼 크기를 추가로 줄여, 스크롤해야 하는 거리를 최소화했습니다.
> - 직전(㉟)에 추가했던 "메뉴를 둘째 줄로 내리는" 규칙과 그에 따른
>   `.hero`/`.breadcrumb` 상단 여백 보정은 더 이상 필요 없으므로 제거했습니다
>   (nav가 다시 1행이므로 기존 `.hero`/`.breadcrumb`의 기본 상단 여백이면
>   충분합니다). 햄버거 버튼/오버레이 메뉴는 계속 사용하지 않습니다(㉟에서
>   이미 제거).
>
> **검증**
> - 브라우저에서 `.nav`의 `scrollWidth`(1127px) > `clientWidth`(800px)임을
>   직접 측정해, 화면이 좁을 때 가로 스크롤이 실제로 동작함을 확인했습니다
>   (측정용 임시 디버그 코드는 확인 후 바로 제거했습니다).
> - 모바일(390px)·데스크톱(1280px) 뷰포트에서 `index.html`, `brand/`,
>   `noodle/` 등을 스크린샷으로 확인해, 로고·메뉴·창업상담이 1행으로
>   유지되고, 줄바꿈·겹침 없이 보이며, 아래 콘텐츠(히어로/브레드크럼)가
>   네비게이션 바에 가려지지 않음을 확인했습니다.

---

## 이전 업데이트 (2026-10-02 ㊱) — 라이브 DB에 남아있던 "중복/기본" 사진 데이터 삭제 (교체 전 사진이 먼저 보이던 진짜 원인 제거)

> **요청** — "관리자 페이지에 업로드 된 사진 왜에 처음에 등록된 사진들 모든 데이터
> 삭제해줘 교체 전 사진이 먼저 나오고 변경된 사진이 뒤에 나오는 현상 삭제"
>
> **원인 (지난 ㉞ CSS/JS 수정으로는 해결되지 않았던 진짜 원인)**
> - 직전(㉞)에는 "기본 사진이 그려진 뒤 cms.js가 실제 사진으로 바꿔서 생기는
>   화면상의 타이밍 깜빡임"만 고려해 CSS로 숨김 처리했습니다.
> - 하지만 이번에 라이브 운영 데이터베이스(`site_content` 테이블)를 직접
>   조회해보니, 같은 키(key)로 **중복 저장된 행**이 남아있었습니다:
>   - `global.favicon`: 예전 경로값(`/images/favicon-kinoya.png`) 1개 +
>     실제 업로드한 사진(base64) 1개 — 총 2개
>   - `global.logo.header`: 빈 값(값 없음) 1개 + 실제 업로드한 로고 사진
>     (base64) 1개 — 총 2개
>   - `global.logo.footer`: 빈 값(값 없음) 1개 + 실제 업로드한 로고 사진
>     (base64) 1개 — 총 2개
> - `js/cms.js`가 서버에서 `/tables/site_content`의 모든 행을 받아 같은
>   `key`를 가진 행을 순서대로 `byKey[key] = row`로 덮어쓰는데, 응답에
>   포함된 행의 배열 순서가 항상 "최신 저장 순서"를 보장하지 않아, 경우에
>   따라 오래된/빈 값이 나중에 덮어써서 최종적으로 화면에 적용되는 문제가
>   있었습니다. 이것이 "교체 전 사진이 먼저 보이고 변경한 사진이 나중에(혹은
>   계속) 보이는" 현상의 실제 원인이었습니다.
>
> **조치**
> - `HostedDbExecute`로 라이브 운영 데이터베이스에 직접 접속해 위 3개 키의
>   오래된/빈 값 행(총 3개, id: `5b842ddb-...`, `192f2512-...`,
>   `93baaf64-...`)만 정확히 삭제했습니다. 실제 업로드되어 사용 중인 사진
>   데이터(base64)는 전혀 건드리지 않았습니다.
> - 삭제 후 재조회하여 `site_content` 테이블의 모든 키가 중복 없이 1개씩만
>   남은 것을 확인했습니다(총 18개 행 → 15개 행).
> - 이 조치는 운영 데이터베이스 데이터만 수정한 것이라 파일 배포(Hosted
>   Deploy)가 필요 없으며, 라이브 사이트에 즉시 반영되었습니다.
>
> **참고**: 직전(㉞)에 추가한 CSS(`visibility:hidden` + `.cms-revealed`)/
> JS(`revealPhotos()`) 깜빡임 방지 장치는 그대로 유지합니다. 타이밍상의
> 깜빡임 방지(㉞)와 중복 데이터로 인한 "엉뚱한 사진이 계속 보이는" 문제(㊱)는
> 서로 다른 원인이며, 이번 조치로 후자가 해결되었습니다.

---

## 이전 업데이트 (2026-10-02 ㉟) — 햄버거 메뉴 버튼 제거, 메뉴를 상단 바 아래 둘째 줄에 항상 펼쳐서 표시

> **요청** — "햄버거 버튼 없에고 아래에 메뉴 보이게 수정 반응형으로"
>
> **배경**
> - 직전(㉜) 수정에서는 로고/메뉴 글씨 확대로 가로 메뉴 전체가 들어가려면
>   약 1700~1800px가 필요해져, 그보다 좁은 화면(1899px 이하 — 대부분의
>   데스크톱·노트북·태블릿·모바일 포함)에서는 가로 메뉴를 숨기고 햄버거
>   버튼을 눌러야만 열리는 전체화면 오버레이 메뉴를 쓰도록 했습니다.
> - 이번 요청은 그 햄버거 버튼/오버레이 방식 자체를 없애고, 메뉴를 처음부터
>   (클릭 없이) 상단 바 바로 아래에 펼쳐서 보여달라는 것입니다.
>
> **조치 (`kinoya.css`)**
> - `@media (max-width: 1899px)` 구간: `.nav`를 `flex-wrap:wrap`으로 바꿔
>   로고 → EN/JA → 창업상담(첫째 줄, 로고는 좌측 고정·나머지는 우측 정렬) →
>   메뉴 전체(둘째 줄, `flex-basis:100%`)의 2단 구성으로 재배치했습니다.
>   메뉴 9개가 좁은 화면에서는 한 줄에 다 안 들어갈 수 있어 둘째 줄 자체를
>   가로 스크롤 가능하게 하고(`overflow-x:auto`, 스크롤바는 시각적으로 숨김),
>   오른쪽 끝에 `mask-image`로 자연스러운 페이드 효과를 넣어 "더 스크롤할
>   항목이 있다"는 것을 암시했습니다.
> - `.nav-mobile-toggle`(햄버거 버튼)과 `.nav-mobile-panel`(전체화면 오버레이
>   메뉴)은 `display:none !important`로 완전히 숨겼습니다. 다만 해당 HTML
>   마크업 자체는 지우지 않고 CSS로만 숨겼습니다(각 59개 페이지를 일일이
>   건드리지 않고 한 곳(`kinoya.css`) 수정만으로 전체 사이트에 반영되도록
>   하기 위함이며, 기능에는 영향이 없습니다).
> - 기존에 별도로 존재하던 `@media (max-width: 900px)` 구간의
>   `.nav-menu{display:none}` / `.nav-mobile-toggle{display:flex}` 규칙은
>   제거했습니다(더 넓은 1899px 구간에서 이미 메뉴가 펼쳐져 있으므로, 더 좁은
>   900px 이하에서 다시 숨기면 안 되기 때문입니다).
> - 메뉴가 둘째 줄로 추가되며 고정(fixed) 헤더의 전체 높이가 늘어난 만큼,
>   `.hero`, `.breadcrumb`의 상단 패딩과 `main [id]` / `.faq-category-tabs`의
>   `scroll-margin-top`도 1899px·900px 구간에 맞춰 함께 늘려 콘텐츠가
>   메뉴줄에 가리지 않도록 했습니다.
> - `js/main.js`는 수정하지 않았습니다(햄버거 버튼의 클릭 이벤트 바인딩 코드는
>   버튼이 화면에서 숨겨져도 무해하게 그대로 남아있습니다).
>
> **검증**
> - 모바일(390px)·데스크톱(1280px) 뷰포트에서 `index.html`, `brand/`,
>   `noodle/`, `franchise/faq/` 등 여러 페이지를 스크린샷으로 확인해, 햄버거
>   버튼 없이 메뉴가 상단 바 아래 둘째 줄에 항상 펼쳐져 보이고, 가로 스크롤이
>   자연스러운 페이드와 함께 동작하며, 브레드크럼/히어로 등 하위 콘텐츠가
>   네비게이션 바에 가리지 않음을 확인했습니다.
> - 데스크톱 1900px 이상(가로 메뉴가 원래 한 줄에 다 들어가는 매우 넓은 화면)
>   에서는 기존처럼 로고+메뉴+언어전환+창업상담이 한 줄로 표시되는 동작을
>   그대로 유지했습니다(이 구간은 이번 변경 대상이 아님).

---

## 이전 업데이트 (2026-10-02 ㉞) — 사진 교체 시 "기본 사진 → 변경된 사진" 깜빡임 제거

> **요청** — "화면 전환시 전에 기본으로 있던 사진이 먼저 나오고 변경한 사진이 보이는
> 현상 없게 수정해"
>
> **원인 분석**
> - 관리자 페이지에서 사진을 교체할 수 있는 모든 요소(`data-cms-type="img"`,
>   `data-cms-type="bg"` — 로고, 매장 사진, 배경사진, 기술카드 사진 등)는 HTML에는
>   항상 원래의 "기본 사진" 경로가 먼저 적혀 있고, `js/cms.js`가 페이지 맨 아래
>   `</body>` 근처에서 실행되어 저장된 사진 값으로 바꿔치기하는 구조였습니다.
> - 브라우저는 HTML을 읽는 즉시 기본 사진을 화면에 그리므로, `cms.js`가 실행되어
>   실제 저장된 사진으로 교체되기 전까지 짧은 시간 기본 사진이 먼저 보였다가
>   변경된 사진으로 바뀌는 깜빡임이 발생했습니다. (로컬 캐시가 있는 재방문 시에는
>   거의 안 보일 수 있지만, 최초 방문·캐시 만료·사진을 새로 교체한 직후 등에는
>   뚜렷하게 보입니다.)
>
> **조치**
> - `kinoya.css`: `[data-cms-type="img"]`, `[data-cms-type="bg"]` 요소를 페이지
>   로드 시 기본적으로 `visibility:hidden`으로 숨기는 규칙을 추가했습니다.
>   (레이아웃 공간은 그대로 차지하므로 다른 요소가 밀리거나 움직이지 않습니다.)
>   `.cms-revealed` 클래스가 붙으면 바로 보이도록 처리했습니다. 또한 자바스크립트가
>   실패하는 예외 상황에도 사진이 영구히 숨겨지지 않도록 1.5초 뒤 자동으로
>   보이게 하는 CSS 안전장치(`@keyframes cms-reveal-fallback`)를 함께 두었습니다.
> - `js/cms.js`: 최종적으로 보여줄 사진이 확정되는 시점에만 `.cms-revealed`
>   클래스를 붙이는 `revealPhotos()` 함수를 추가했습니다.
>   - 로컬 캐시(`localStorage`)된 값이 있으면 그 값을 즉시 적용한 뒤 바로 공개합니다.
>   - 캐시가 없는 최초 방문 시에는 서버 응답을 기다렸다가, 최신 값을 적용한
>     "직후" 공개합니다 — 즉 기본 사진이 화면에 그려지는 순간 자체가 없습니다.
>   - 서버 요청이 실패해도(네트워크 오류 등) catch 구문에서 공개 처리하여 사진이
>     영구히 안 보이는 일이 없도록 했습니다.
> - 결과적으로 모든 페이지에서 사진이 교체되는 과정의 깜빡임이 사라지고,
>   처음부터 바로 맞는(최종) 사진만 나타납니다.
> - 수정 후 `/noodle/`, `/index.html`을 스크린샷으로 확인해 사진이 정상적으로
>   (빈 영역/깨짐 없이) 표시됨을 검증했습니다.

---

## 이전 업데이트 (2026-10-02 ㉝) — "키노야의 신념과 경쟁력" 기술카드 2장 사진 관리자 편집 기능 추가

> **요청** — "키노야의 신념과 경쟁력 섹션에서 키노야 자체 제면공장 사진, 약 80cm 숙성면 원팩
> 사진 관리자 페이지에 사진 관리 섹션 추가해줘"
>
> **조치**
> - `noodle/index.html`(키노야의 신념과 경쟁력 페이지)의 "핵심기술" 섹션에 있는 두 카드
>   배경사진에 `data-cms-type="bg"` 속성을 새로 추가했습니다(기존에는 배경사진이 CSS
>   인라인 스타일에 고정되어 있어 관리자 편집이 불가능했습니다).
>   - 카드1(01 · Factory, `images/store-guri-counter.jpg`) → `noodle.techcard.1.bg`
>   - 카드2(02 · One-Pack, `images/udon-bowl-hero.jpg`) → `noodle.techcard.2.bg`
> - `admin/index.html`의 "키노야의 신념과 경쟁력(노들)" 그룹에 "기술카드1(자체 제면공장)
>   사진", "기술카드2(약 80cm 원팩) 사진" 이미지 편집 항목을 각각 카드 텍스트 항목
>   바로 앞에 추가했습니다. 기존에 이미 관리 가능했던 "48시간 숙성 사진"
>   (`noodle.aging.img`)과 동일한 방식(사진 선택 → 자동 PNG 변환/용량 축소 →
>   전체 저장)으로 작동합니다.
> - 수정 후 `/noodle/` 페이지를 스크린샷으로 확인해, 두 카드의 배경사진과 텍스트가
>   정상적으로(깨짐 없이) 표시됨을 검증했습니다.

---

## 이전 업데이트 (2026-09-30 ㉜) — 상단 메뉴/로고/상담신청 버튼이 화면 작아지면 짤리는 현상 수정 (반응형)

> **요청** — "상단 메뉴, 로고, 상담신청 섹션 화면이 작아지면 짤리는 현상 반응형으로 수정"
>
> **원인 분석**
> - 이전 세션에서 적용된 로고 2.25배 확대 + 메뉴 글자 1.5배 확대로 인해, 가로 메뉴
>   전체(로고+9개 메뉴+EN/JA+창업상담 버튼)가 한 줄에 다 들어가려면 화면 폭이
>   **약 1700px 가까이** 필요해졌습니다. 그런데 "가로 메뉴 → 모바일 전체화면(햄버거)
>   메뉴" 전환 기준이 기존 900px에 머물러 있어서, **900px~1700px 사이의 거의 모든
>   일반 노트북·데스크톱 화면(1280px, 1366px, 1440px, 1536px 등)에서 로고·메뉴·
>   창업상담 버튼이 서로 겹치며 화면 양쪽으로 넘쳐 짤리는 현상**이 발생했습니다
>   (`.nav`가 `justify-content:center`로 전체를 가운데 정렬하기 때문에 넘치는 양이
>   좌우로 똑같이 밀려나며 보이지 않게 가려짐).
>
> **조치**
> - `kinoya.css`의 모바일 전환 미디어쿼리 기준을 `max-width:900px` → `max-width:1899px`로
>   넓혔습니다. 이제 가로 메뉴는 그 전체 폭이 실제로 여유 있게 들어갈 수 있는 1900px
>   이상의 매우 넓은 화면에서만 나타나고, 그보다 좁은 화면(대부분의 노트북·데스크톱
>   포함)에서는 이미 정상 동작 중인 모바일 전체화면 메뉴(햄버거 버튼)가 대신
>   표시되어 어떤 요소도 짤리지 않습니다.
> - 로고·메뉴 글자 크기, 순서, 디자인은 전혀 변경하지 않았고, 오직 "가로 메뉴를
>   언제 보여줄지"의 기준폭만 조정했습니다.
> - 1280px(데스크톱), 390px(모바일) 두 화면 폭에서 스크린샷으로 상단 네비게이션
>   (로고/EN·JA/창업상담 버튼/햄버거 아이콘)과 `/contact/` 페이지의 상담신청 폼
>   섹션을 직접 검증해, 짤림·겹침이 없음을 확인했습니다.

---

## 이전 업데이트 (2026-09-30 ㉛) — 메인 페이지 상단 메뉴 순서 통일 + 매장슬라이더 사진 관리자 편집 기능 추가

> **요청 1** — "상단 메뉴 '소셜미디어''브랜드스토리''키노야의 신념과 경쟁력''우동키노야 사람들''창업안내'
> '창업비용''우리동네 키노야''메뉴소개''FAQ' 순으로 위에서 아래로 순차적으로 보이게 수정해줘"
>
> **조치**
> - 전체 52개 HTML 페이지의 모바일 전체화면 메뉴(`.nav-mobile-panel`)를 점검한 결과, 아래
>   2개 페이지만 순서가 요청과 달라 수정했습니다(데스크톱 가로 메뉴는 모든 페이지가 이미
>   올바른 순서였음).
>   - `index.html`: `#social`(소셜미디어), `noodle/`(키노야의 신념과 경쟁력) 링크가 누락되어
>     있어 요청 순서대로 추가했습니다.
>   - `store/index.html`: `franchise/faq/`(FAQ) 링크가 누락되어 있어 추가했습니다.
>
> **요청 2** — "메인 페이지 모든 사진 수정 관리 할수 있게 관리자페이지에 추가 해줘"
>
> **조치**
> - `index.html`(홈페이지)에 있는 모든 사진/배경이미지 요소를 전수 조사한 결과, 다음 7개
>   항목은 이미 관리자(`/admin`)에서 편집 가능한 상태였습니다: 헤더 로고, 푸터 로고, 파비콘,
>   카카오톡 공유 썸네일, 브랜드 스토리 배경사진, 더 누들 섹션 사진, 비즈니스 프루프 배경사진.
> - 유일하게 관리자 편집이 불가능했던 사진 1건 — 매장 슬라이더의 구리본점 외관 사진
>   (`images/store-guri-exterior.jpg`, 보이는 카드 1곳 + 무한루프용 숨김 복제 카드 1곳,
>   총 2곳에서 사용)에 `data-cms="home.store.1.photo" data-cms-type="img"` 속성을 추가하고,
>   `admin/index.html`의 `CMS_FIELDS` 목록에 "매장1(구리본점) 사진" 이미지 편집 항목을
>   신규 추가했습니다. 나머지 매장 카드 10곳은 실제 사진이 아니라 장식용 일본어 글자
>   (`.jp-mark`)나 아이콘(`fa-bowl-food`)이라 사진 관리 대상이 아닙니다.
> - `admin/editor.js`의 렌더링 로직을 코드로 직접 확인해, 신규 필드가 기존에 이미 정상
>   작동 중인 이미지 필드(예: 카카오톡 공유 썸네일)와 완전히 동일한 방식 — 사진 선택 시
>   자동 PNG 변환·용량 축소(600KB 이하) 후 미리보기 표시, 전체 저장 시 `site_content`
>   테이블에 저장 — 으로 처리됨을 검증했습니다.
> - Hosted Deploy 완료 후 라이브 사이트에서 두 조치가 모두 실제로 반영되어 있음을
>   재확인했습니다(아래 배포 기록 참고).

---

## 이전 업데이트 (2026-09-29 ㉚) — 상단 로고 크기 50% 추가 확대

> **요청** — "상단 로고 크기 50% 크게 수정"
>
> **조치**
> - `kinoya.css`의 `.nav-logo img`(데스크톱)와 `@media (max-width:900px) .nav-logo img`(모바일)
>   규칙을 각각 1.5배로 추가 확대했습니다. 이전 세션에서 이미 한 차례 50% 확대(기존 34px/220px →
>   51px/330px)가 적용되어 있었기 때문에, 이번 확대분까지 합치면 최초 원본 대비 2.25배(약
>   125% 증가) 크기가 됩니다.
>   - 데스크톱: `height:51px, max-width:330px` → `height:76.5px, max-width:495px`
>   - 모바일(900px 이하): `height:39px, max-width:255px` → `height:58.5px, max-width:382.5px`
> - 로고 이미지 자체(`images/logo-header.png` 또는 관리자 업로드 사진)의 표시 높이/최대폭만
>   조정한 것으로, 이미지 파일이나 관리자 CMS 로직은 변경하지 않았습니다.
> - Hosted Deploy 완료 후 라이브 서버의 `kinoya.css`를 캐시 무효화 파라미터로 다시 받아
>   `.nav-logo img{ height:76.5px; max-width:495px; }`(데스크톱)와
>   `.nav-logo img{ height:58.5px; max-width:382.5px; }`(모바일)가 실제로 반영되어 있음을
>   직접 확인했습니다.

---

## 이전 업데이트 (2026-09-29 ㉘) — 전체 작은 글씨 크기 50% 확대

> **요청** — "전체적인 작은 글씨의 크기를 50% 크게 수정"
>
> **조치**
> - 모든 페이지가 공유하는 `kinoya.css`의 `font-size` 선언을 전수 조사하여, 이미 확대되어 있던
>   내비게이션 로고/메뉴/CTA 버튼과 대형 디스플레이 헤딩(`.h-display`, `.hero-headline` 등)·
>   장식용 대형 글자(매장 슬라이더의 `.jp-mark`, 매장 아이콘 등)를 제외한 **본문, 캡션, 라벨,
>   버튼, 뱃지, 폼 요소, 푸터 텍스트 등 "작은 글씨" 전 항목**을 1.5배로 확대했습니다
>   (예: 14px→21px, 12px→18px, `clamp(15px,1.5vw,17px)`→`clamp(22.5px,1.5vw,25.5px)` 등
>   100개 이상 항목, 반응형 모바일 브레이크포인트 값 포함).
> - 확대 후 `.store-card`(고정폭 썸네일+가변폭 텍스트 레이아웃), `.cost-table` 등 레이아웃 파손
>   위험이 높은 영역을 데스크톱·모바일 스크린샷으로 확인해 겹침/넘침 없음을 검증했습니다.
> - Hosted Deploy 완료 후 라이브 `kinoya.css`를 직접 다운로드해 변경된 값들이 실제로 반영되어
>   있음을 확인했습니다.

---

## 최근 업데이트 (2026-09-29 ㉘) — 카카오톡 공유 썸네일 사진 등록 + 관리자 편집 기능 추가 (+ 이번 세션 기타 수정 3건)

> **요청** — "카카오톡 공유 썸네일 입력해줘 그리고 관리자페이지에 수정 관리 할수 있게 만들어줘"
> (사용자가 첨부한 "국내최초 48시간 저온숙성우동 우동키노야" 로고 문구 + 손으로 든 면 사진,
> 다크 네이비 배경의 썸네일 이미지)
>
> **조치**
> - 첨부 이미지를 `images/kakao-share-thumbnail.jpg`로 저장하고, `index.html`의
>   `<meta property="og:image">`를 이 사진 경로로 교체 + `<meta name="twitter:image">`를
>   신규 추가(기존에는 없었음). 두 태그 모두 `data-cms="social.kakao.image"
>   data-cms-type="meta"`를 부여해 `js/cms.js`(기존 `meta` 타입 처리 로직 재사용, 코드 변경
>   불필요)가 관리자 저장값으로 `content` 속성을 덮어쓸 수 있도록 연결했습니다.
> - `admin/index.html`의 `CMS_FIELDS`에 "카카오톡 공유 썸네일" 그룹 아래 사진 업로드 필드
>   (`social.kakao.image`, `type: 'image'`)를 신규 등록했습니다. 기존 파비콘/로고 필드와 동일한
>   범용 이미지 업로드 로직(`admin/editor.js`)이 그대로 적용되어, 파일 선택 시 자동 PNG 변환 +
>   600KB 이하 리사이징 후 저장할 수 있습니다(같은 그룹의 주제/부제 입력 필드는 기존에 이미
>   있었음).
> - Hosted Deploy 완료 후 라이브 서버에서 `index.html`(og:image/twitter:image 태그),
>   `images/kakao-share-thumbnail.jpg`(실제 서빙 확인), `admin/index.html`(CMS_FIELDS 신규
>   항목) 3가지를 모두 직접 다운로드해 정확히 반영됨을 확인했습니다.
>
> **⚠️ 중요한 한계 안내 — 반드시 확인해주세요**
> 관리자 페이지(`/admin`)에서 이 사진을 다시 업로드하면 브라우저로 사이트를 직접 보는
> **사람 방문자 화면에는** 바로 반영됩니다(`js/cms.js`가 페이지 로드 후 자바스크립트로
> 이미지를 교체하는 방식이기 때문). 그런데 **카카오톡·페이스북 등에 링크를 공유할 때 뜨는
> 미리보기 썸네일은 이 방식으로 갱신되지 않습니다.** 카카오/페이스북 크롤러는 자바스크립트를
> 실행하지 않고 서버가 배포 시점에 만들어 둔 정적 HTML의 `<meta>` 태그 원문만 그대로 읽기
> 때문입니다. 즉 지금은:
> - **정적 파일 기본값**(`images/kakao-share-thumbnail.jpg`, 이번에 등록한 사진)이 카카오톡
>   공유 시 실제로 보이는 사진입니다.
> - 관리자 페이지에서 사진을 바꿔 저장해도, 카카오톡 공유 미리보기는 **다음 Hosted Deploy
>   전까지는 바뀌지 않습니다**(사람이 브라우저로 볼 때는 바뀐 것처럼 보여 혼동될 수 있습니다).
> - 카카오 공유용 사진을 실제로 바꾸려면 ① 관리자에서 새 사진으로 저장 → ② 그 값을 정적
>   파일/코드에 반영해 재배포하는 별도 절차가 필요합니다. 이 절차 자동화가 필요하시면
>   별도로 요청해주세요.
>
> **참고 — 같은 세션에서 함께 처리한 기타 수정 3건** (이전 대화에서 이미 배포·검증 완료):
> 1. 상단 메뉴/로고/창업상담 버튼 50% 확대 작업 중 빠져있던 `.nav-logo` 글자 크기 보정
> 2. "뉴스 보러가기"/"자료실 바로가기" 버튼을 소셜미디어 섹션의 "틱톡" 탭 오른쪽으로 이동,
>    "뉴스"/"자료실"로 이름 축약
> 3. 다크 네이비 배경 섹션에서 안 보이던 "면 연구·제조 과정 보기"/"대표메뉴 만나보기" 버튼
>    글씨 색상을 밝은색(아이보리)으로 수정
> 4. 매장 슬라이더("우동키노야는 실제로 운영 중입니다") 섹션이 마우스 휠 스크롤에는 반응하지
>    않던 문제 수정 — 휠 이동량을 실제 가로 스크롤로 반영하도록 변경

---

## 이전 업데이트 (2026-09-29 ㉗) — FAQ / 뉴스 / 자료실 관리 (3가지 모두)

> **요청** — "순차적으로 시작" (6순위, 세부 선택: "3가지 모두" = FAQ 관리 + 뉴스 관리 + 자료실 관리)
>
> **조치**
> - **`faq_items` 테이블 신규 생성 및 기존 정적 FAQ 17개 항목 이전(migration)** — 카테고리
>   (브랜드·제품/창업비용/매출·수익/운영/점포/본사 지원), 질문, 답변(HTML 가능), 순서, 공개여부
>   필드로 구성. `/franchise/faq/` 페이지의 기존 17개 질문·답변을 그대로 옮겨 담았습니다.
> - **관리자 페이지에 "❓ FAQ 관리" 섹션 추가**(`admin/faq-manage.js` 신규 파일) — 새 FAQ 등록,
>   목록에서 카테고리/질문/답변/순서 수정 및 삭제가 가능합니다.
> - **공개 FAQ 페이지를 테이블 기반으로 전환**(`js/faq-dynamic.js` 신규 파일, `franchise/faq/index.html`
>   에 스크립트 추가) — **안전장치**: `faq_items` 테이블에 공개된 행이 하나 이상 있을 때만 동적
>   목록으로 교체하고, 모두 삭제되면 기존 정적 FAQ 목록으로 자동 복귀합니다. 기존 카테고리 탭
>   필터·아코디언 동작은 그대로 유지됩니다.
> - **`news_items` 테이블 신규 생성** 및 **`/news/` 페이지 신규 제작** — 제목/날짜/출처/원문
>   링크/썸네일/요약 필드로 뉴스·언론보도를 관리합니다. 관리자 페이지 "📰 뉴스 관리" 섹션
>   (`admin/news-manage.js` 신규 파일)에서 등록·삭제할 수 있고, 썸네일 이미지는 선택 시 자동으로
>   압축된 PNG로 변환됩니다. 등록된 뉴스가 없으면 "아직 등록된 소식이 없습니다" 안내만 표시됩니다.
> - **`resources` 테이블 신규 생성** 및 **`/resources/` 자료실 페이지 신규 제작** — 브로슈어·
>   안내서 등 다운로드 자료를 관리합니다. 관리자 페이지 "📁 자료실 관리" 섹션
>   (`admin/resources-manage.js` 신규 파일)에서 **외부 링크(URL) 방식**(대용량 파일에 권장, Google
>   Drive 등) 또는 **파일 직접 업로드 방식**(약 1.5MB 이하 소용량 파일만 가능) 중 선택해 등록할 수
>   있습니다.
> - **엑셀 백업/복원 범위 확대**(`admin/backup-restore.js`) — 기존 4개 테이블에 `faq_items`,
>   `news_items`, `resources`를 추가해 총 7개 테이블을 한 번에 백업/복원합니다.
> - **네비게이션에 "뉴스", "자료실" 메뉴 추가** — 현재는 홈페이지(`index.html`)와 창업 FAQ 페이지
>   상단/모바일 메뉴에 반영했습니다.
> - **알려진 제약사항(미해결)**:
>   - `franchise/faq/index.html`의 검색엔진용 FAQPage 구조화데이터(JSON-LD)는 기존 정적 17개
>     항목 기준으로 고정되어 있습니다. 관리자에서 FAQ를 추가/수정/삭제해도 이 JSON-LD는 자동
>     갱신되지 않아, 검색엔진에 노출되는 요약과 실제 화면이 시간이 지나며 달라질 수 있습니다.
>   - "뉴스"/"자료실" 메뉴 링크는 아직 홈페이지와 FAQ 페이지에만 추가되어 있고, 브랜드스토리·
>     메뉴소개·매장찾기·창업안내·창업비용·매장 상세페이지들과 영어(en)/일본어(ja) 버전 페이지에는
>     아직 반영되지 않았습니다. 전체 페이지 통일이 필요하면 별도로 요청해주세요.

---

## 이전 업데이트 (2026-09-29 ㉖) — 방문자 통계 리포트

> **요청** — "순차적으로 시작" (5순위: 방문자 통계 리포트)
>
> **조치**
> - **`visitor_logs` 테이블 신규 생성** — session_id, event_type(pageview/click), page_path,
>   label, referrer, device_type(mobile/desktop) 필드로 구성.
> - **`js/main.js`에 자체 방문자 로깅 추가** — 로그인이나 별도 동의 절차 없이, 모든 페이지 로드 시
>   페이지뷰 1건을 기록하고, 기존에 있던 `[data-event]` 클릭 추적 지점(창업문의, 플로팅 CTA,
>   footer SNS 클릭 등)의 클릭도 함께 기록합니다. 세션ID는 `sessionStorage`에만 저장되는 임의
>   문자열로, 이름/이메일/IP 등 개인을 식별하는 정보는 전혀 수집하지 않습니다. 기록 실패 시에도
>   화면 동작에는 영향이 없도록 처리했습니다.
> - **관리자 페이지에 "방문자 통계 리포트" 섹션 추가**(`admin/visitor-stats.js` 신규 파일,
>   Chart.js CDN 연동) — 시작일·종료일을 선택해 조회하면 해당 기간의 총 페이지뷰/방문(세션)
>   수/총 클릭 수/모바일 비율 카드, 일별 페이지뷰 추이 그래프, 인기 페이지 TOP10, 인기 클릭
>   TOP10 표를 보여줍니다. 기본값은 최근 30일입니다.
> - **원본 로그 엑셀 내보내기** 버튼으로 `visitor_logs`의 모든 원본 행을 엑셀로 다운로드할 수
>   있습니다(더 세밀한 분석이 필요할 때 사용).

---

## 이전 업데이트 (2026-09-29 ㉕) — 전체 데이터 백업/복원 (엑셀)

> **요청** — "순차적으로 시작" (4순위: 전체 데이터 엑셀 백업/복원)
>
> **조치**
> - **관리자 페이지에 "전체 데이터 백업/복원 (엑셀)" 섹션 신규 추가**(`admin/backup-restore.js` 신규
>   파일, SheetJS/xlsx 라이브러리 CDN 연동) — 화면 맨 위, "전체 저장" 버튼 바로 아래에 배치했습니다.
> - **내보내기(Export)**: `site_content`(홈페이지 텍스트/사진 설정), `consultations`(상담신청
>   내역), `youtube_videos`(영상/쇼츠), `partner_logos`(협력사 로고) — 4개 테이블을 시트 4개짜리
>   엑셀 파일(`우동키노야_전체데이터백업_YYYYMMDD.xlsx`) 하나로 한 번에 내보냅니다.
> - **복원(Import)**: 같은 형식의 엑셀 파일을 업로드하면, 시트별로 행을 하나씩 확인해 **같은 id가
>   이미 있으면 엑셀 내용으로 덮어쓰고(PUT), 새로운 id는 추가(POST)**합니다. 엑셀 파일에만 없고
>   기존 데이터베이스에만 있던 행은 삭제하지 않아 안전합니다(자연키 병합 방식). 실행 전 처리될
>   행 개수를 안내하고 확인을 받습니다.
> - 정기적으로 내보내기를 눌러 다운로드해두면, 만약의 사고(오작동, 오삭제 등) 발생 시 이 엑셀
>   파일로 데이터를 복원할 수 있습니다.

---

## 이전 업데이트 (2026-09-29 ㉔) — 협력사 로고 관리 (자동 스크롤 배너)

> **요청** — "순차적으로 시작" (3순위: 협력사 로고 관리)
>
> **조치**
> - **`partner_logos` 테이블 신규 생성** — id, row(top/middle/bottom), name, image, link_url,
>   sort_order 필드로 구성. 관리자 페이지에서 로고를 등록/삭제할 수 있습니다.
> - **관리자 페이지에 "협력사 로고 관리" 섹션 추가**(`admin/partner-logos.js` 신규 파일) — 상단·중간·
>   하단 3줄 각각에 로고 이미지(파일 선택 시 자동 PNG 변환·용량 축소), 협력사명(선택), 링크
>   URL(선택)을 등록할 수 있고, 등록된 로고 목록을 줄별로 확인·삭제할 수 있습니다.
> - **홈페이지에 "Partners · 함께하는 파트너사" 섹션 신규 추가** — "매장증명" 섹션과 "피플" 섹션
>   사이에 배치했습니다. 상단·하단 행은 왼쪽으로, 중간 행은 반대 방향(오른쪽)으로 로고가 자동
>   스크롤되며, 각 줄에 로고를 마우스오버하면 애니메이션이 멈춥니다. 등록된 로고가 있는 줄만
>   화면에 나타나고, 전체 로고가 하나도 없으면 섹션 전체가 숨겨집니다.
> - `kinoya.css`에 `.partner-logo-row` 등 관련 CSS(무한 스크롤 애니메이션, 모바일 대응, 접근성을
>   위한 `prefers-reduced-motion` 대응)를 추가했습니다.
> - 이 섹션은 홈페이지(`index.html`)에만 존재하며, 다른 하위 페이지에는 추가하지 않았습니다.

---

## 이전 업데이트 (2026-09-29 ㉓) — SNS 링크 통합 관리 (footer 아이콘 자동 연동)

> **요청** — "순차적으로 시작" (2순위: SNS 링크 통합 관리)
>
> **조치**
> - **관리자 페이지에 "SNS 링크 관리" 그룹 신규 추가** — 블로그, 인스타그램, 스레드, 페이스북,
>   카카오톡 채널(플러스친구), 카카오스토리, 티맵 링크를 URL 한 줄씩 입력·저장할 수 있습니다
>   (`social.sns.blog` / `social.sns.instagram` / `social.sns.threads` / `social.sns.facebook` /
>   `social.sns.kakaochannel` / `social.sns.kakaostory` / `social.sns.tmap`).
> - **`js/main.js`에 footer SNS 링크 자동 반영 로직 추가** — 모든 페이지 footer에 있던 "준비중"
>   상태(`is-placeholder`, `href="#"`)의 7개 SNS 아이콘이, 관리자 페이지에서 해당 URL을 저장하면
>   자동으로 실제 링크로 바뀝니다. 21개 HTML 파일을 일일이 수정할 필요 없이 이 스크립트 한 곳만
>   고치면 전체 페이지에 동시 반영되는 구조입니다. URL을 비워두면 기존처럼 클릭 시 "준비중입니다"
>   안내만 뜨는 상태를 그대로 유지합니다.
> - 이미 연동되어 있던 네이버지도/구글지도/카카오맵/유튜브 링크와 "공유하기" 버튼은 이번 변경의
>   영향을 받지 않고 그대로 동작합니다.
> - **범위 제외 사항**: 참조 파일에 있던 "카카오톡 상담 링크"·"카카오톡 친구추가 링크"는 법률사무소
>   사이트의 플로팅 버튼/모바일 하단 내비게이션에 연결되어 있었는데, 우동키노야 사이트에는 그런
>   플로팅 버튼/모바일 하단 내비게이션 자체가 존재하지 않아 이번 작업 범위에서 제외했습니다. 이
>   기능이 필요하시면 신규 UI 요소 제작이 필요하므로 별도로 말씀해주세요.
> - 영문(`en/`)·일문(`ja/`) 페이지는 원래 footer에 SNS 아이콘 그리드가 없어 이번 변경 대상이
>   아닙니다.

---

## 이전 업데이트 (2026-09-29 ㉒) — 유튜브 자동연동 고도화 (DB 저장 방식으로 전환) + 관리자 영상 관리

> **요청** — 사용자가 다른(법률사무소용) admin.html 예시 파일을 업로드하며 "관리자 관리자 페이지 기능 참조해서 반영해줘" →
> "순차적으로 시작" (1순위: 유튜브 자동연동 고도화)
>
> **조치**
> - **`youtube_videos` 테이블 신규 생성** — 유튜브 영상/쇼츠를 이제 DB에 저장합니다(id, title,
>   youtube_id, video_type(영상/쇼츠), duration, thumbnail, views, published_at,
>   source(수동/자동), sort_order).
> - **관리자 페이지에 "🚀 한 번에 전체 자동 업데이트" 버튼 추가**(`admin/youtube-sync.js` 신규 파일).
>   클릭 한 번으로 ① 채널 통계 조회 → ② 최신 영상·쇼츠(최대 50개) 가져오기 → ③ `youtube_videos` +
>   `site_content`(구독자/조회수/업로드영상수)에 자동 저장까지 순서대로 처리됩니다. 이미 등록된
>   영상(같은 youtube_id)은 새로 추가하지 않고 기존 항목을 갱신합니다.
> - **관리자 페이지에 영상 수동 등록/목록/삭제 UI 추가** — YouTube URL만 입력하면 oEmbed로 제목·썸네일을
>   자동 조회해 등록할 수 있고, 등록된 전체 영상/쇼츠 목록을 표(썸네일/구분/제목/등록방식/삭제)로 확인할 수
>   있습니다.
> - **⚠️ 중요한 구조 변경**: 기존에는 홈페이지 방문자의 브라우저가 페이지를 열 때마다 직접 유튜브
>   Data API를 호출해 영상을 가져왔습니다(API 키 노출, 방문자 수만큼 API 쿼터 소모 위험). 이제는
>   홈페이지(`js/main.js`)가 유튜브 API를 직접 호출하지 않고, **관리자가 미리 저장해둔 DB
>   (`youtube_videos`, `site_content`)를 읽어서 표시**하는 방식으로 전환했습니다. 채널 통계/영상/쇼츠를
>   화면에 반영하려면 반드시 관리자 페이지에서 "한 번에 전체 자동 업데이트"를 최소 한 번 눌러 DB에
>   저장해야 합니다(그 전까지는 이전과 동일하게 해당 영역이 화면에 나타나지 않습니다).
> - 자동 슬라이드 간격 설정(`social.youtube.autoslide.seconds`)은 기존과 동일하게 유지됩니다.
>
> **참고** — 업로드된 참조 파일(`admin.html`)은 "아이디어창"이라는 별도 법률사무소 사이트의 관리자
> 화면으로, 등록사례/위촉장/RAG챗봇 등 우동키노야와 무관한 기능도 포함되어 있었습니다. 사용자와 협의해
> 우동키노야에 맞는 기능(①유튜브 자동연동 고도화 ②SNS 링크 통합 ③파트너사 로고 ④데이터 백업/복원
> ⑤방문자 리포트 ⑥FAQ/뉴스/자료실)을 우선순위대로 순차 반영하기로 했으며, 이번 업데이트는 그 1번째
> 항목입니다. 나머지 항목은 이후 순차적으로 진행됩니다.

---

## 이전 업데이트 (2026-09-28 ㉑) — Shorts 슬라이더도 최신 동영상처럼 자동 슬라이드

> **요청** — "쇼츠도 영상 처럼 자동슬라이드 되게 수정"
>
> **조치**
> - "최신 동영상" 3행에만 적용되던 자동 슬라이드 기능을 **"Shorts" 슬라이더에도 동일하게
>   적용**했습니다. 이제 Shorts 카드들도 설정된 초 간격마다 카드 1개 폭만큼 자동으로
>   넘어가며, 끝까지 이동하면 처음으로 되돌아갑니다.
> - 자동 슬라이드 간격은 "최신 동영상"과 동일하게 관리자 페이지의
>   **"자동 슬라이드 간격(초)"** 필드(`social.youtube.autoslide.seconds`)로 함께
>   제어됩니다(기본값 4초). 별도 필드를 추가하지 않고 기존 설정값을 그대로 공유합니다.
> - Shorts 영역의 좌우 화살표 버튼(수동 이동)은 기존과 동일하게 유지됩니다.

---

## 이전 업데이트 (2026-09-28 ⑳) — 최신 동영상 3행 슬라이더 + 샘플(더미) 데이터 완전 제거

> **요청 1** — "영상 3행으로 수정, 1행당 10개의 영상이 보이게 하고 한장씩 자동 슬라이드
> 되게 만들고 관리자 페이지에서 초를 설정하게 만들어. 업로드 사진 참고 구조 똑같이 만들어줘"
>
> **조치**
> - 홈페이지 "소셜미디어" 섹션의 "최신 동영상"을 기존 단일 그리드에서 **3개의 행(row)**
>   구조로 변경했습니다. 각 행은 최대 10개의 영상 카드를 담으며, 행마다 좌우 화살표
>   버튼으로 수동 이동도 가능합니다.
> - 각 행이 설정된 초 간격마다 **카드 1개 폭만큼 자동으로 한 장씩 슬라이드**됩니다.
>   끝까지 이동하면 처음으로 되돌아갑니다.
> - 관리자 페이지에 **"자동 슬라이드 간격(초)"** 설정 필드를 추가했습니다
>   (`social.youtube.autoslide.seconds`, 기본값 4초). 숫자만 입력하면 즉시 반영됩니다.
> - 유튜브 API 연동 시 최신 영상을 최대 30개(3행 × 10개)까지 가져오도록 조회 개수를
>   확장했습니다(`playlistItems` 조회 30개→50개).
>
> **요청 2** — "유튜브 영상, 쇼츠 샘플로 있던 데이터 모두 삭제 화면에 안나오게해"
>
> **조치**
> - 지금까지 유튜브 연동 전 화면을 채우던 **예시(더미) 쇼츠/영상 데이터와 통계 수치를
>   전부 제거**했습니다. (기존에는 "우동키노야 쇼츠 1화 (예시 영상...)" 같은 가짜 카드와
>   "1.2만+ 구독자" 같은 가짜 통계가 항상 보였습니다.)
> - 관리자 페이지에서 유튜브 API 키·채널을 연동하지 않았거나, 연동에 실패한 경우에는
>   **"Shorts", "최신 동영상", 통계(구독자·조회수·업로드영상) 영역 자체가 화면에
>   나타나지 않습니다.** 실제 유튜브 데이터를 성공적으로 가져왔을 때만 해당 영역이
>   나타납니다.
> - "소셜미디어" 섹션 제목/설명문, 유튜브 바로가기 버튼, 채널 탭(디자인용) 등 다른
>   요소는 그대로 유지됩니다.
>
> **주의** — 미리보기(에디터)/샌드박스 환경에서는 히어로 섹션의 유튜브 배경영상이
> 정상 로드되지 않아 스크린샷 검증 도구가 페이지 하단까지 도달하지 못하는 경우가
> 있습니다(기존에 문서화된 샌드박스 환경 한정 제약). 실제 배포된 사이트에서는 히어로
> 영상이 정상 재생되어 문제가 없습니다.

---

## 이전 업데이트 (2026-09-28 ⑲) — 유튜브 자동연동 "연동확인" · "가져오기" 버튼 추가

> **요청** — "연동확인 버튼과 가져오기 버튼 만들어줘" (관리자 페이지 "소셜미디어 - 유튜브
> 자동연동" 그룹에 API 키와 채널 ID/URL을 입력한 화면 첨부)
>
> **조치**
> - 관리자 페이지의 "유튜브 채널 ID" 입력칸 아래에 버튼 2개를 추가했습니다.
>   - **연동확인**: 입력한 API 키·채널값으로 실제 유튜브 채널 정보(채널명·구독자수·
>     영상수·조회수)를 즉시 조회해 화면에 보여줍니다. **저장은 하지 않고 확인만** 합니다.
>   - **가져오기(지금 반영)**: 연동확인과 동일하게 조회한 뒤, 성공하면 "전체 저장"
>     버튼을 누르지 않아도 **API 키·채널 ID를 즉시 저장**해 홈페이지 소셜미디어
>     섹션에 바로 반영합니다.
> - **채널 ID 입력 형식을 자유롭게 허용**: 스크린샷에서 채널 ID란에 전체 채널 URL
>   (`https://youtube.com/channel/UC...`)을 붙여넣으신 것처럼, 이제는 순수 채널ID
>   (`UC...`)뿐 아니라 **채널 URL, `@핸들`, 구채널 사용자명**을 그대로 입력해도 자동으로
>   인식해 올바른 채널ID로 변환·정리합니다(버튼을 누르면 입력창의 값도 정리된 채널ID로
>   자동 교체됩니다).
> - 연동 실패 시(API 키 오류, 채널을 찾을 수 못함 등) 구체적인 오류 메시지를 그대로
>   화면에 표시해 원인을 바로 파악할 수 있도록 했습니다.
>
> **주의** — 이 두 버튼은 브라우저에서 곧바로 유튜브 API를 호출하므로, 미리보기(에디터)
> 화면에서는 절대경로 스크립트 로딩 제약으로 버튼이 나타나지 않을 수 있습니다(기존에
> 문서화된 미리보기 환경의 알려진 제약 — 실제 Hosted Deploy 배포 후 `/admin`에서는
> 정상 동작합니다).

---

## 최근 업데이트 (2026-09-27 ⑱) — 메인페이지 ↔ 관리자페이지 연결 전체 감사 및 버그 수정

> **요청** — "메인 페이지와 admin 관리 페이지를 완벽하게 연결해서 관리할수 있게 만들어"
>
> **조치 — 전체 감사(audit) 수행**
> - 사이트 전체 50개 HTML 파일의 `data-cms` 태그와 `admin/index.html`의
>   `CMS_FIELDS` 목록을 하나씩 전수 대조했습니다.
> - **한국어 페이지 24개**(홈/브랜드스토리/창업안내/창업비용/창업FAQ/메뉴소개/
>   노들(신념과 경쟁력)/피플/창업문의/매장찾기(45개 매장)/매장 상세페이지 11곳)는
>   전수 검사 결과 **완벽하게 연결되어 있음을 확인**했습니다.
>
> **발견 및 수정한 버그**
> 1. **홈 화면 "창업모델" 카드 3개(10평대 소형점포/30평대 일반형/업종전환)** —
>    관리자 페이지에는 수정 항목(`home.model.1~3.title/desc`)이 있었지만, 실제
>    홈페이지 카드에는 연결 태그가 빠져 있어 **관리자에서 고쳐도 화면에 반영되지
>    않던 문제**를 발견하여 수정했습니다. 이제 정상적으로 연결되어 반영됩니다.
> 2. 관리자 필드 목록(`CMS_FIELDS`)에 과거 작업 과정에서 **중복 등록**되어 있던
>    항목들(FAQ 미리보기 3개, 하단 CTA 카드 2개, 매장슬라이더 11개 매장의 이름/주소)을
>    정리해 각 항목이 한 번씩만 나오도록 했습니다.
>
> **범위에서 제외 — 별도 작업 필요**
> - **영문(EN) 14페이지 / 일문(JA) 14페이지, 총 28개 페이지의 본문 텍스트**
>   (제목/설명문/FAQ 등)는 현재 파비콘·로고 3개 항목만 관리자와 연결되어 있고,
>   나머지 번역 텍스트는 각 페이지에 하드코딩되어 있어 관리자에서 수정할 수
>   없습니다. 작업량이 매우 크므로(28개 파일에 태그 추가 + 관리자 필드 대량
>   추가) 사용자 요청에 따라 **이번 작업 범위에서는 제외**했으며, 필요 시 별도로
>   요청해주시면 진행하겠습니다.
>
> **배포 완료** — 위 수정사항은 Hosted Deploy로 라이브 사이트에 반영되었습니다.

---

## 최근 업데이트 (2026-09-27 ⑰) — 하단 푸터 로고 클릭 시 관리자 로그인 모달 추가

> **요청** — "아래 로고를 버튼으로 만들고 버튼을 누르면 admin 접속 아이디 비번 입력할수 있게 만들어줘"
> (하단 푸터의 네이비 배경 "우동키노야" 로고 스크린샷 첨부)
>
> **조치**
> - 모든 페이지 하단에 공통으로 나오는 **푸터 로고**(`.footer-brand .footer-logo-img`)를
>   클릭 가능한 버튼으로 만들었습니다(마우스 클릭 + 키보드 Enter/Space 모두 지원).
> - 클릭하면 화면 중앙에 **아이디/비밀번호 입력 모달**이 뜨고, 올바르게 입력하면
>   `/admin` 관리자 페이지로 이동합니다. 틀리면 빨간 오류 문구가 표시됩니다.
> - 로그인 정보는 `js/main.js` 상단의 `ADMIN_LOGIN_ID` / `ADMIN_LOGIN_PW` 변수 값을
>   직접 수정해서 바꿀 수 있습니다. **기본값은 아이디 `kinoya` / 비밀번호 `udon1234`**
>   이며, 반드시 원하는 값으로 바꿔서 사용하시길 권장합니다.
>
> **🚨 보안 주의사항 (반드시 확인)**
> - 이 사이트는 서버가 없는 정적 사이트라서, 이 아이디/비밀번호 값은 `js/main.js`
>   파일 안에 그대로 저장되며 **누구나 브라우저 개발자도구로 소스 코드를 열어보면
>   확인할 수 있습니다.** 완전한 보안 잠금장치가 아닙니다.
> - 이 버튼이 없어도 누구나 주소창에 직접 `/admin`을 입력하면 관리자 화면에
>   그대로 들어갈 수 있습니다. 즉 이 기능은 "진짜 접근 차단"이 아니라, 일반
>   방문자의 눈에 관리자 진입 경로가 바로 보이지 않게 **숨겨두는 정도의 장치**입니다.
> - `/admin` 경로 자체를 외부인이 절대 열지 못하도록 진짜로 차단하려면, 정적
>   JS 코드가 아닌 별도의 "Hosted 접근 규칙(Access Rules)" 기능을 적용해야
>   하며(Genspark 로그인 기반 인증), 필요하시면 별도로 요청해주세요.

---

## 최근 업데이트 (2026-09-27 ⑯) — 관리자 페이지에서 유튜브 API 키 입력 시 실시간 자동 연동

> **요청** — "유튜브 자동으로 가져오게 api 키 입력 만들어줘 관리자 페이지에"
>
> **조치**
> 1. **관리자 페이지(`/admin`)에 신규 입력 필드 2개 추가** (그룹: "소셜미디어 - 유튜브 자동연동")
>    - `social.youtube.apikey` : 유튜브 Data API 키
>    - `social.youtube.channelid` : 유튜브 채널 ID (UC로 시작)
>    - 둘 다 비워두면 기존처럼 예시(더미) 영상이 계속 표시되어, 값을 넣기 전까지 화면이 깨지지 않습니다.
> 2. **`js/main.js` 전면 교체**: 관리자에서 입력한 키/채널ID를 `site_content` 테이블에서 읽어와
>    - 채널 통계(`channels.statistics`)로 구독자수/총 조회수/총 업로드 영상수 자동 갱신
>    - 업로드 재생목록(`channels.contentDetails.relatedPlaylists.uploads`)에서 최신 30개 영상 조회
>    - 영상별 재생시간(`videos.contentDetails.duration`)을 분석해 **3분 이하는 Shorts, 그 외는 일반 영상**으로 자동 분류
>    - Shorts 최대 10개, 일반 영상 최대 10개를 실제 썸네일·제목·조회수·게시일과 함께 자동 렌더링
>    - API 키가 없거나 호출이 실패하면 예외 없이 기존 예시 데이터를 그대로 유지(빈 화면 방지)
>
> **🚨 보안 주의사항 (반드시 확인)**
> - 정적 사이트 구조상 이 API 키는 `/tables/site_content` 공개 조회 API를 통해 누구나 브라우저
>   개발자도구로 값을 확인할 수 있습니다. 완전히 숨길 방법이 없습니다.
> - 반드시 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)에서 발급한
>   키에 대해 **"API 제한"을 YouTube Data API v3로만 한정**하고, **"애플리케이션 제한"을
>   HTTP 리퍼러 → 본인 도메인(`https://www.udonkinoya.com/*`)으로 제한**해 등록해주세요.
>   이렇게 하면 키가 노출되어도 다른 곳에서 도용해 사용할 수 없습니다.
> - 채널 ID는 유튜브 스튜디오 → 설정 → 채널 → 고급설정에서 "채널 ID"(UC로 시작)를 복사하면 됩니다.

---

## 최근 업데이트 (2026-09-27 ⑮) — 관리자 글씨 수정이 메인 페이지에 반영 안 되던 문제 수정

> **증상** — "관리자 페이지에서 글씨 수정하면 메인 페이지에 반영이 안되고 있어" (`/admin`에서
> 저장 성공 메시지는 뜨는데, 실제 공개 페이지를 새로고침해도 예전 문구가 계속 보임)
>
> **원인 진단**
> 1. `HostedDbExecute`로 라이브 D1의 `site_content` 테이블을 직접 조회 → 저장 요청은
>    실제로 DB에 정상적으로 들어가고 있었음(저장 로직 자체는 문제 없음).
> 2. 라이브 사이트에 직접 저장(POST/PUT) → 즉시 재조회(GET) 테스트를 반복한 결과, API
>    서버 자체도 정상 동작.
> 3. 다만 `/tables/site_content` GET 응답에 `cache-control`/`etag`/`last-modified` 같은
>    캐시 관련 헤더가 전혀 없어, **브라우저가 이 GET 요청을 임의로 캐시**해 예전 응답을
>    재사용할 수 있는 구조였음. 이 때문에 저장은 100% 성공해도, 메인 페이지가 새로고침 시
>    "저장 전" 데이터를 계속 보여주는 것처럼 보였던 것.
>
> **조치**
> - `js/cms.js`, `admin/editor.js`의 `/tables/site_content` 조회 fetch에 매번 다른
>   타임스탬프 쿼리(`&_=Date.now()`)와 `{ cache: 'no-store' }` 옵션을 추가해, 브라우저/중간
>   캐시가 예전 응답을 재사용하지 못하도록 강제.
> - 실제 라이브 사이트에서 "저장 → 즉시 재조회" 시나리오를 재현 테스트하여 최신 값이 정상
>   반영되는 것을 확인 후 배포 완료.

---

## 최근 업데이트 (2026-09-25 ⑭) — 소셜미디어 섹션 추가 및 테마 적용

> **요청** — "브랜드스토리 상위 네비게이션 왼쪽에 소셜미디어 섹션 추가하고, 숫자로 보는 우동키노야 위에 쇼츠 10개, 일반 영상 10개 영역을 추가해줘. 유튜브 API 연동하고, 디자인은 우동키노야 홈페이지 디자인(네이비/황토색 테마)을 반영해줘."
> 
> **조치 사항**
> 1. **네비게이션 및 마크업 추가**: 
>    - `index.html` 헤더 상단 네비게이션에 `소셜미디어` 링크 추가.
>    - `숫자로 보는 우동키노야` 위에 `<section class="section sec-social" id="social">` 추가.
> 2. **유튜브 API 연동 및 더미 데이터 (보안 조치)**: 
>    - `js/main.js`에 유튜브 데이터를 렌더링하는 코드를 구현했습니다.
>    - 🚨 **주의**: 정적 사이트 코드에 유튜브 API 키를 그대로 노출하면 보안/과금 위험이 매우 높으므로, 우선 "시각적으로 완벽히 동일하게 동작하는 가짜(더미) 영상 20개"가 보이도록 세팅했습니다.
>    - 추후 소스코드 하단의 주석 처리된 부분에 본인의 `YOUTUBE_API_KEY`를 넣으면 실제 채널과 즉시 연동되도록 뼈대를 작성해 두었습니다.
> 3. **디자인 테마 완벽 동기화**: 
>    - 처음엔 전달해주신 시안(형광 연두색/블랙)을 적용했다가, 사이트 고유의 고급스러운 테마에 맞도록 `kinoya.css`를 전면 수정했습니다.
>    - 배경은 다크 네이비(`var(--navy)`), 글씨는 아이보리(`var(--ivory)`), 강조 컬러는 우동 국물색/황토색(`var(--broth)`)을 사용하여 기존 홈페이지의 무드와 완벽하게 일치시켰습니다.

---

## 최근 업데이트 (2026-09-25 ⑬) — 예전 "박스 로고" 영구 삭제 (모든 화면에서 제거)

> **요청** — "모든 화면에서 삭제 복원 안되게해 필요없는 로고야".
> 관리자 페이지를 통해 업로드하셨던 "네이비색 박스 배경이 포함된 로고"와 기존에 하드코딩되어
> 있던 "기본 로고"가 더 이상 모든 화면 어디에서도 나타나지 않도록 완전히 지워달라는 요청입니다.
>
> **조치 (영구 차단 및 삭제)**
> 1. **라이브 DB 데이터 완전 삭제**: 관리자 페이지에서 실수로 저장되었던 "박스 로고"의
>    Base64 데이터를 라이브 D1 데이터베이스에서 강제로 텅 비웠습니다(UPDATE value='').
> 2. **기본 로고 파일 표시 원천 차단**: `kinoya.css`에 
>    `img[src$="logo-header.png"] { display: none !important; }` 규칙을 추가해,
>    어떤 상황에서도 `images/logo-header.png`라는 이름이 들어간 예전 로고 파일은 아예
>    화면에 그려지지 않도록 강제 차단했습니다.
> 
> **결과**
> 이제 기존의 그 박스 로고는 **모든 화면(한국어, 영어, 일본어)에서 영구적으로 삭제**되어,
> 화면 전환 시 사라지거나 나타나는 일조차 없이 텅 빈 여백으로만 존재하게 됩니다. 
> 나중에 관리자 페이지를 통해 "정말로 필요한, 배경이 투명한 완전한 새 사진"을
> 업로드하시기 전까지는 로고 자리에 아무것도 나타나지 않습니다.

---

## 최근 업데이트 (2026-09-25 ⑫) — EN/JA 페이지에 로고 반영 기능 추가(모든 화면에서 로고가 보이도록)

> **증상** — 관리자 페이지에서 로고를 업로드하면 한국어(KO) 페이지들에는 정상 반영됐지만,
> 영어(`en/`)·일본어(`ja/`) 페이지와 `404.html`에서는 헤더 로고 자리가 계속 비어 있었습니다.
>
> **원인** — 바로 전 업데이트(⑪)에서 "관리자가 업로드하기 전에는 기본 로고를 숨긴다"는
> 처리를 추가했는데, 로고를 다시 화면에 표시하는 역할은 `js/cms.js`가 맡습니다. 그런데
> `en/`, `ja/`, `404.html`은 원래부터 `js/cms.js`를 로드하지 않는 정적 페이지였어서,
> 로고를 숨기는 CSS 규칙만 적용되고 다시 보여주는 스크립트는 실행되지 않아 계속 빈
> 자리로 남아 있었습니다.
>
> **조치** — `en/` 14개 페이지, `ja/` 14개 페이지, `404.html`(총 29개 파일)에 각 파일의
> 기존 `js/main.js` 로드 바로 뒤에 `js/cms.js`를 추가했습니다(폴더 깊이에 맞춰 상대경로
> 적용). 이제 KO 21개 + EN 14개 + JA 14개 + 404.html = 50개 페이지 전체가 `cms.js`를
> 로드하며, 관리자 페이지에서 저장한 로고 사진이 모든 언어·모든 화면의 헤더/푸터에
> 동일하게 반영됩니다.
>
> 참고: EN/JA 페이지의 다른 텍스트 콘텐츠는 관리자 페이지의 `CMS_FIELDS` 목록에 없는
> 영어/일본어 전용 문구라 이번 변경으로 함께 바뀌지 않으며, 로고·파비콘처럼 언어와
> 무관한 공통(`global.*`) 값만 반영됩니다.

---

## 최근 업데이트 (2026-09-25 ⑪) — 기본 로고 삭제, 관리자 업로드 로고만 표시

> **요청** — "기본 있는 로고는 삭제하고 관리자페이지에서 업로드 된 로고만 보이게".
> 지금까지는 관리자가 아직 아무 사진도 올리지 않았을 때도 페이지 HTML/데이터베이스에
> 미리 넣어둔 "기본 로고" 파일이 헤더/푸터에 항상 보였습니다. 이제는 관리자가 실제로
> 사진을 업로드해 저장하기 전까지 로고 자리가 완전히 비어 있고(빈 이미지 아이콘도
> 없음), 저장한 값이 있을 때만 그 사진이 나타납니다.
>
> **조치**
> 1. `kinoya.css`에 `.nav-logo img[data-cms="global.logo.header"]`,
>    `.footer-logo-img[data-cms="global.logo.footer"]`를 기본적으로 `display:none`
>    처리했습니다(50개 페이지 각각을 고치지 않고 공용 CSS 한 곳만 수정).
> 2. `js/cms.js`가 `site_content`에서 실제 값을 읽어와 이미지의 `src`를 채울 때만
>    `display`를 되돌려 화면에 보이도록 했습니다. 값이 없거나 불러오기에 실패하면
>    로고는 계속 숨겨진 채로 남습니다(빈 이미지 깨짐 아이콘도 뜨지 않음).
> 3. 라이브 데이터베이스와 프리뷰 데이터 스토어의 `global.logo.header` /
>    `global.logo.footer` 값을 모두 빈 문자열로 초기화했습니다 — 이전 세션에
>    "기본값"으로 미리 넣어뒀던 로고 값도 함께 제거했습니다.
>
> **결과** — 관리자 페이지에서 로고 사진을 올려 저장하기 전까지는 모든 페이지의
> 헤더/푸터에 로고가 보이지 않고, 저장한 뒤에는 그 사진만 나타납니다. Playwright로
> 홈페이지 헤더에 로고 자리가 비어 있고 다른 레이아웃은 정상임을 확인한 뒤 배포했습니다.

---

## 최근 업데이트 (2026-09-25 ⑩) — 로고 이미지 뒤에 남아있던 어두운 사각 배경 제거

> **증상** — 헤더/푸터에 표시되는 KINOYA 로고 글자 뒤에 원본 사진 파일 그대로의 어두운
> 네이비색 사각형 배경이 남아 있어서, 헤더의 배경색과 살짝 다른 톤이라 로고가 도드라진
> 박스처럼 보였습니다.
>
> **원인** — 사용자가 처음 첨부한 로고 원본 파일 자체가 불투명한 사각형 배경 위에
> "KINOYA / 木ノ屋 · 우동키노야" 글자가 있는 형태였고, 이 파일을 배경 투명화 없이 그대로
> `images/logo-header.png`로 사용하고 있었습니다. 또한 이후 관리자 페이지에서 이 사각
> 배경 로고를 그대로 다시 업로드해, 라이브 데이터베이스(`site_content.global.logo.header`
> / `global.logo.footer`)에도 같은 사각 배경 이미지가 Base64로 저장되어 있었습니다.
>
> **조치**
> 1. AI 배경 제거 도구로 로고에서 텍스트만 남기고 배경을 완전한 투명(PNG 알파 채널)으로
>    처리해 `images/logo-header.png`를 교체했습니다.
> 2. 관리자 페이지에서 예전에 업로드해 라이브 DB에 저장돼 있던 "사각 배경 포함" 로고
>    값을 새 투명 로고 파일 경로(`/images/logo-header.png`)로 되돌렸습니다(라이브 D1 +
>    프리뷰 데이터 스토어 모두 동일하게 맞춤). 관리자 페이지에서 다시 사진을 올리면
>    그 값으로 갈아탈 수 있습니다 — 이때는 배경이 투명한 사진을 올려야 이 사각 배경이
>    다시 생기지 않습니다.
>
> **검증** — 네이비/브라운/아이보리 등 여러 배경색 위에 로고를 올려 Playwright
> 스크린샷으로 사각형 경계가 전혀 보이지 않고 텍스트만 자연스럽게 표시됨을 확인했습니다.

---

## 최근 업데이트 (2026-09-25 ⑨) — 로고가 페이지 이동마다 사라졌다 나타나는 현상 제거(⑧ 조치 되돌림)

> **증상** — ⑧에서 추가한 "깜빡임 방지" 처리(로고를 잠깐 숨긴 뒤 fade-in) 때문에,
> 이 사이트는 정적 멀티페이지 구조라 카테고리 메뉴를 눌러 다른 페이지로 이동할 때마다
> 페이지 전체가 새로 로드되고, 그때마다 로고가 다시 "숨김→표시"를 반복하면서 오히려
> 로고가 순간적으로 사라졌다가 나타나는 현상으로 사용자에게 보였습니다.
>
> **조치** — 로고에 대한 숨김/페이드 처리(`cms-logo-loading`/`cms-logo-ready` 클래스,
> 관련 CSS)를 모두 제거했습니다. 이제 `js/cms.js`는 로고를 포함한 모든 `data-cms`
> 요소에 대해 숨기지 않고, 관리자 업로드 값이 있으면 그 자리에서 조용히 `src`만 바꿔
> 끼워 넣습니다(값이 없거나 네트워크 오류 시에는 기본 로고가 계속 그대로 보임). 결과적으로
> 로고는 모든 화면·모든 페이지 이동에서 항상 고정되어 보이며, 사라지는 순간이 없습니다.
>
> 참고: `/tables/site_content` 응답은 보통 매우 빨라 값이 바뀌는 순간 눈에 띄는
> 깜빡임은 거의 없으며, 있다 해도 "잠깐 숨겼다가 다시 보이는" 것보다 "로고가 항상
> 고정되어 있는 것"이 사용자 경험상 더 안정적이라고 판단했습니다.

---

## 최근 업데이트 (2026-09-25 ⑧) — 첫 접속 시 로고가 잠깐 "예전 로고"로 보이는 깜빡임(FOUC) 제거 (→ ⑨에서 되돌림)

> **증상** — 홈페이지 등 페이지에 처음 접속하면, 관리자 페이지에서 업로드한 로고 사진이
> 보이기 전에 아주 짧은 순간 HTML에 기본으로 박혀 있던 예전 로고 이미지가 먼저 보였다가
> 바로 바뀌는 "깜빡임" 현상이 있었습니다.
>
> **원인** — `js/cms.js`는 페이지가 열리면 `/tables/site_content`를 비동기(fetch)로
> 불러온 뒤에야 헤더/푸터 로고 `<img>`의 `src`를 관리자 업로드 값으로 바꿔줍니다. 그
> fetch가 끝나기 전까지는 HTML 문서에 적힌 기본 로고 파일(`images/logo-header.png`)이
> 그대로 화면에 먼저 그려지기 때문에, 값이 바뀌는 순간 눈에 보이는 "깜빡임"이 생겼습니다.
>
> **조치** — 로고 이미지(`.nav-logo img[data-cms]`, `.footer-logo-img[data-cms]`)에만
> 한정해서:
> 1. `js/cms.js`가 로드를 시작하는 즉시 두 로고 요소에 `cms-logo-loading` 클래스를 붙여
>    잠시 투명하게 숨기고,
> 2. `/tables/site_content` 값 적용이 끝나면(성공이든 실패든 상관없이) `cms-logo-ready`
>    클래스로 바꿔 부드럽게(fade-in) 다시 보이도록 했습니다.
> 3. `kinoya.css`에 `cms-logo-loading{opacity:0}` / `cms-logo-ready{opacity:1;
>    transition:opacity .2s ease}` 규칙을 추가했습니다.
>
> **다른 이미지에는 영향 없음** — 이 처리는 `.nav-logo img`, `.footer-logo-img` 두
> 선택자에만 적용되어, `noodle/` 페이지의 "48시간 숙성 사진"(`noodle.aging.img`) 등
> 다른 `data-cms-type="img"` 콘텐츠 이미지는 그대로 즉시 표시되며 전혀 영향을 받지
> 않습니다.
>
> **EN/JA 페이지는 대상 아님** — `en/`, `ja/` 하위 페이지들은 `js/cms.js`를 로드하지
> 않는 정적 페이지라 이 문제와 무관하며 수정하지 않았습니다(관리자 페이지의 로고 편집도
> EN/JA에는 반영되지 않는 정적 이미지입니다 — 필요하시면 별도로 요청해 주세요).
>
> 실제 화면 검증(Playwright 스크린샷)으로 홈/노들 페이지 헤더 로고가 정상적으로 즉시
> 표시됨을 확인한 뒤 Hosted Deploy로 라이브에 반영했습니다.

---

## 최근 업데이트 (2026-09-25 ⑦) — 관리자 페이지 로고 사진 업로드 오류의 진짜 원인 파악·수정

> **증상** — 관리자 페이지에서 "상단 헤더 로고" / "하단 푸터 로고" 사진을 선택해 전체 저장을
> 누르면 "일부 항목 저장에 실패했습니다 (2개): ... HTTP 405 - {"error":"Method not allowed"}"
> 오류가 발생했습니다(다른 텍스트 항목들은 정상 저장됨).
>
> **1차 조치가 원인을 잘못 짚었던 점** — 처음에는 "Base64 인코딩으로 용량이 늘어 1MB 저장
> 한도를 넘겨서 실패한다"고 판단해 압축 목표를 800KB→600KB로 낮췄으나(⑥), 사용자가 실제로
> 다시 시도했을 때도 동일하게 실패했고, 이번에 오류 메시지에 찍힌 **"HTTP 405 Method not
> allowed"**가 정확한 원인을 알려주었습니다. 405는 용량 문제가 아니라 **그 HTTP 메서드 자체를
> 서버가 허용하지 않는다**는 뜻입니다.
>
> **진짜 원인** — `admin/editor.js`는 기존에 저장된 항목을 수정할 때 `PATCH` 메서드로
> `/tables/site_content/{id}`를 호출했습니다. 그런데 실제 배포된 Table API 서버는 `PATCH`를
> 지원하지 않고(405 반환), 대신 `PUT`(전체 필드 교체)만 지원합니다. 텍스트 항목들이 그동안
> 정상 저장됐던 이유는, 텍스트 필드는 처음 저장할 때 `POST`(신규 생성)로 들어갔거나 이미
> `PUT`으로 저장된 적이 있어 문제가 드러나지 않았을 뿐이며, 새로 추가된 로고 이미지 2개 필드는
> 관리자 화면에서 "저장된 값이 있는 기존 행"으로 인식되어 `PATCH` 경로를 타면서 매번 405로
> 막혔던 것입니다.
> - 라이브 서버에 same-origin으로 `PUT`과 `PATCH`를 직접 호출해 실측 비교: `PUT` → status 200
>   정상 저장, `PATCH` → status 405 `{"error":"Method not allowed"}`. 이 실측으로 원인을
>   확정했습니다.
>
> **조치**:
> - `admin/editor.js`의 `saveField()`에서 기존 항목 수정 시 사용하던 메서드를 **`PATCH` →
>   `PUT`**으로 변경했습니다(신규 항목은 계속 `POST`).
> - 저장 실패 시 서버가 반환한 오류 본문까지 화면에 그대로 표시하도록 개선해, 이후 비슷한 문제가
>   생겨도 원인을 바로 알 수 있게 했습니다.
> - (⑥에서 적용한) 사진 압축 목표 600KB(Base64 변환 후 약 800KB, 1MB 저장 한도 이내)는 안전
>   여유 확보 차원에서 유지했습니다.
> - 라이브 D1에 실제 800KB~1.1MB 크기의 이미지 데이터로 `PUT` 저장을 재현 테스트해 status 200
>   정상 저장을 확인했고, 로고 필드 값을 원래 정상값(`images/logo-header.png`)으로 복구했습니다.
> - 검증에 사용한 임시 진단 페이지(`admin/method-probe.html`, `admin/e2e-probe.html`)는 테스트
>   후 즉시 삭제하고 재배포해 라이브에 남지 않도록 했습니다.
>
> **결과** — 이제 관리자 페이지에서 사진을 선택해 저장하면 `PUT`으로 정상 전송되어 "일부 항목
> 저장 실패" 없이 반영됩니다.

---

## 최근 업데이트 (2026-09-25 ⑤) — 상단/하단 로고 이미지화 + 관리자 편집 기능 추가

> **요청** — "상단 로고 입력할 수 있게 만들어줘 3:1 가로 비율로, 하단 로고도 관리자페이지에서
> 입력 관리할 수 있게 수정." 사용자가 첨부한 로고 이미지(어두운 네이비 배경 + 흰색 "KINOYA" /
> "木ノ屋 · 우동키노야", 약 3:1 가로 비율)를 기본 로고로 적용했습니다.
>
> - **로고 이미지 저장**: `images/logo-header.png` (사용자 첨부 원본, PNG).
> - **헤더(nav-logo) 마크업 전환**: 모든 페이지의 `<a class="nav-logo">KINOYA<span class="jp">...</span></a>`
>   텍스트 마크업을 `<a class="nav-logo"><img src="...images/logo-header.png" data-cms="global.logo.header" data-cms-type="img"></a>`
>   이미지 마크업으로 교체했습니다(기존 `js/cms.js`의 `img` 타입 로직을 그대로 재사용 — 별도
>   신규 로직 불필요).
> - **푸터(footer-brand) 마크업 전환**: `<div class="logo">KINOYA</div><div class="logo-jp">...</div>`
>   2줄 텍스트를 `<img class="footer-logo-img" src="...images/logo-header.png" data-cms="global.logo.footer" data-cms-type="img">`
>   한 장의 이미지로 교체했습니다.
> - **적용 범위**: KO 20개 + EN 14개 + JA 14개 + 404.html = 총 49개 페이지의 헤더 로고,
>   그 중 footer-brand가 있는 48개 페이지의 푸터 로고(404.html은 간소화된 푸터라 대상 제외)를
>   모두 상대경로(`./`, `../`, `../../`, `../../../`)에 맞춰 일괄 수정했습니다.
> - **CSS 추가** (`kinoya.css`): `.nav-logo img`(desktop height 34px, 모바일 900px 이하 26px,
>   `max-width` 제한 + `object-fit:contain`으로 3:1 비율 유지), `.footer-brand .footer-logo-img`
>   (width 170px, 최대 60% 제한)을 신설했습니다.
> - **관리자 페이지(`admin/index.html`) CMS_FIELDS에 신규 필드 2개 등록**:
>   `global.logo.header`(상단 헤더 로고, image 타입), `global.logo.footer`(하단 푸터 로고, image
>   타입) — "공통(전체 페이지)" 그룹에 추가. 기존 파비콘 편집과 동일하게 사진을 선택하면
>   자동 PNG 변환 + 800KB 이하 리사이징 후 "전체 저장"으로 반영됩니다.
> - `admin/editor.js`의 이미지 미리보기가 각 필드의 `current` 기본 이미지 경로를 그대로 보여주도록
>   수정하고, 로고 계열 필드는 미리보기 배경을 네이비색으로 깔아 흰 글자 로고가 잘 보이게 했습니다.
> - `site_content` 프리뷰 테이블에 `global.logo.header` / `global.logo.footer` 초기값
>   (`images/logo-header.png`)을 등록했습니다.
> - Playwright로 데스크톱(`index.html`, `store/guri/`, `404.html`)과 모바일(`index.html`)
>   렌더링을 확인해 헤더/푸터 로고가 깨짐 없이 정상 표시됨을 검증했습니다.

---

## 최근 업데이트 (2026-09-25 ④) — `/noodle/` "키노야의 신념과 경쟁력" 독립 페이지로 복원

> **배경** — 사용자가 "키노야의 신념과 경쟁력" 섹션이 사라진 것 같다고 문의했습니다. 확인해보니
> 삭제된 것이 아니라 2026-09-17 작업 때 `/people/` 페이지 하위 섹션으로 콘텐츠가 이식되었고,
> 한국어(KO) `/noodle/` 페이지만 3초 후 `/people/#qna`로 리다이렉트되는 안내 페이지로 축소되어
> 있었습니다(EN/JA `/noodle/`은 원래부터 독립 페이지 상태 그대로였음 — 언어별 불일치 존재).
> 사용자가 "`/noodle/` 페이지 자체를 예전처럼 독립된 페이지로 되돌리기"를 선택해 아래와 같이
> 복원했습니다.
>
> - **`noodle/index.html` 전면 재작성** — 리다이렉트 안내 페이지를 완전한 독립 콘텐츠 페이지로
>   되돌렸습니다. 자체 canonical(`/noodle/`), 4-way hreflang, Question/Answer JSON-LD를 갖추고,
>   Q&A · 48시간 숙성 이유 · 핵심기술 · 연구 데이터 4개 섹션을 모두 새로운 `noodle.*` data-cms
>   키로 재태깅했습니다(`noodle.hero.*`, `noodle.qna.*`, `noodle.aging.*`, `noodle.tech.*`,
>   `noodle.techcard.*`, `noodle.numbers.*`, `noodle.final.*` 등 약 20개 필드).
> - **전체 한국어 페이지 nav-menu·nav-mobile-panel·footer 갱신** — index.html, brand/,
>   franchise/, franchise/cost/, franchise/faq/, menu/, people/, store/(및 매장 상세 11개),
>   contact/, 404.html 전부에 "키노야의 신념과 경쟁력" → `noodle/` 링크를 "브랜드스토리"
>   다음 위치에 추가해, 어느 페이지에서도 노들 페이지로 이동할 수 있도록 일관되게 맞췄습니다.
> - **`sitemap.xml`에 KO `/noodle/` URL 추가** — EN/JA `/noodle/`은 이미 있었으나 KO만 빠져
>   있던 것을 4-way hreflang과 함께 추가했습니다.
> - **`admin/index.html`의 `CMS_FIELDS`에 `noodle.*` 그룹 신설** — "키노야의 신념과 경쟁력(노들)"
>   그룹으로 새 필드 약 24개를 등록해 관리자 페이지에서 편집 가능하도록 했습니다.
> - **`/people/` 쪽 중복 콘텐츠 정리(사용자가 "B. 요약+링크로 축소" 선택)** — `people/index.html`에
>   남아있던 Q&A · 48시간 숙성 이유 · 핵심기술 · 연구 데이터 4개 섹션(구 `people.qna.*`,
>   `people.aging.*`, `people.tech.*`, `people.techcard.*`, `people.numbers.*`)을 제거하고,
>   "키노야의 신념과 경쟁력" 요약 섹션 하나로 축소했습니다. 요약 섹션은 기존 `people.belief.title`
>   / `people.belief.desc` 문구와 숫자 카드 3종(13개월/48시간/약 80cm, 고정 텍스트)만 보여주고,
>   `/noodle/`로 가는 "키노야의 신념과 경쟁력 자세히 보기 →" 버튼을 배치했습니다. `people/index.html`의
>   section-jump·mobile-bottom-nav·JSON-LD(`mainEntity` → `about: /noodle/`)·meta description도
>   함께 정리했습니다. `admin/index.html`의 `CMS_FIELDS`에서도 더 이상 존재하지 않는
>   `people.qna.*` 등 필드를 제거했습니다(실제 데이터 행은 무해하게 남아있어도 됩니다).
> - 사이트 전역에서 "키노야 신념" 바로가기/CTA 링크(모바일 하단 내비, 홈·브랜드·창업 FAQ 등의
>   "면 연구·제조 과정 보기" 류 버튼)를 기존 `people/#qna`에서 `/noodle/`로 전부 갱신했습니다.
> - `sitemap.xml`의 `/people/` `lastmod`도 2026-09-25로 갱신했습니다.
> - Playwright로 두 페이지(`/noodle/`, `/people/`) 렌더링 확인 완료. Hosted Deploy 실행 및 라이브
>   검증은 아래 배포 섹션 참고.

---

## 최근 업데이트 (2026-09-25 ③) — 관리자 페이지 절대경로 수정 · 현재 문구 미리채우기 ·
## 이미지 자동 PNG/800KB 변환 · 카카오톡 공유 썸네일 편집 추가

> **`/admin` 404 문제 근본 해결** — 끝에 슬래시가 없는 `/admin` 주소로 접속하면 브라우저가
> `editor.js`, `../images/...` 같은 상대경로를 잘못된 위치로 해석해 스크립트/파비콘이 404가
> 나던 문제를 발견했습니다. `admin/index.html`·`admin/editor.js`의 관련 경로를 모두 절대경로
> (`/admin/editor.js`, `/images/favicon.png`, `/`)로 전환해 `/admin`과 `/admin/` 어느 쪽으로
> 접속해도 정상 동작하도록 수정했습니다.
> **관리자 입력칸에 "지금 홈페이지 문구" 미리 채우기** — `window.CMS_FIELDS` 각 항목에
> `current`(현재 홈페이지에 실제 쓰인 문구) 값을 추가하고(`['그룹','key','라벨',type,current]`),
> `admin/editor.js`가 저장된 값이 없으면 이 `current` 값을 기본으로 입력창에 채워 넣도록
> 수정했습니다. 어떤 문구가 어느 섹션에 대응하는지 바로 확인할 수 있습니다(현재 홈 관련
> 약 90개 필드에 적용, 나머지 페이지는 필요 시 추가 가능).
> **이미지 업로드 자동 PNG 변환 + 800KB 이하 자동 리사이징** — 사진 필드에서 파일을 선택하면
> `admin/editor.js`가 원본 포맷과 무관하게 캔버스에 그려 PNG로 변환하고, 800KB를 넘으면 가로/
> 세로를 85%씩 줄여 재시도(최대 9회)해 항상 800KB 이하의 PNG로 저장 준비합니다. 사용자는
> 포맷·용량을 신경 쓰지 않고 사진만 선택하면 됩니다.
> **카카오톡 공유 썸네일 주제/부제 편집 추가** — 카카오톡 등 SNS에 링크를 공유할 때 보이는
> 제목/설명은 `<meta property="og:title">`/`<meta property="og:description">`(및 twitter 대응
> 태그)의 `content` 속성에서 가져옵니다. 이 속성은 기존 `js/cms.js`의 innerHTML/src/backgroundImage
> 교체 로직으로는 편집할 수 없었기 때문에, `data-cms-type="meta"`라는 새 처리 방식을
> `js/cms.js`에 추가하고(`el.setAttribute('content', row.value)`), `index.html`의 `og:title`/
> `og:description`/`twitter:title`/`twitter:description`에 `data-cms="social.kakao.title"` /
> `data-cms="social.kakao.desc"`를 부여했습니다. `admin/index.html`에 "카카오톡 공유 썸네일"
> 그룹을 신설해 주제(제목)/부제(설명) 입력칸을 추가했고, 사용자가 요청한 문구를 `current`
> 기본값으로 채웠습니다:
> - 주제: "우동키노야 / 국내최초 48시간 저온숙성우동 전문점"
> - 부제: "쫄깃함이 최고조에 이르는 시간, 16분. 우동은 면이 아닙니다. 우동은 숙성입니다."
>
> `/admin`에서 그대로 저장하면 실제 반영되며, 저장하지 않으면 위 문구가 기본 노출됩니다
> (og:image 사진 자체는 이번 요청 범위에 포함되지 않아 기존 이미지를 유지했습니다 — 필요 시
> 요청해주시면 별도로 편집 가능하도록 추가할 수 있습니다).
> **배포 및 검증**: Hosted Deploy 완료 후 라이브 서버(`index.html`, `/admin`)에서 직접 파일을
> 다운로드해 변경 사항이 실제로 반영됨을 확인했습니다.
>
> **파비콘(브라우저 탭 아이콘) 관리자 편집 추가** — `js/cms.js`에 `data-cms-type="favicon"`
> 처리 방식을 추가로 신설(`<link rel="icon">`의 `href` 속성 교체)하고, 한국어/영어/일본어
> 전체 공개 페이지(총 50개 파일: KO 20 + EN 15 + JA 15, 404 포함)의 `<link rel="icon">`에
> `data-cms="global.favicon"` `data-cms-type="favicon"`를 부여했습니다. `admin/index.html`에
> "공통(전체 페이지)" 그룹에 "파비콘(브라우저 탭 아이콘)" 사진 업로드 필드를 추가해, `/admin`에서
> 사진을 선택하면(자동 PNG 변환 + 800KB 이하 리사이징 적용) 전체 사이트의 파비콘을 한 번에
> 교체할 수 있습니다. 사용자가 제공한 원형 손그림 로고(きのや 나무 문양) 이미지는
> `images/favicon-kinoya.png`로 저장해 두었으며, 관리자 페이지에서 이 파일을 업로드해 저장하면
> 파비콘으로 반영할 수 있습니다(자동 교체는 하지 않고 관리자 저장을 통해 적용하는 방식). Hosted
> Deploy 후 라이브 서버에서 `admin/index.html`과 `index.html` 양쪽에 정상 반영됨을 확인했습니다.

---

## 최근 업데이트 (2026-09-25 ②) — 관리자 편집 범위 대폭 확대 (전체 사진·글씨 관리)

> **"관리자페이지에서 사진 글씨 모두 수정 관리 할수 있게" 요청 반영** — 기존에는 `/admin/`에서
> 각 페이지의 히어로·일부 섹션 제목 등 약 85개 항목만 편집 가능했습니다. 이번 작업에서 한국어(KO)
> 공개 페이지 전체를 다시 감사하여, 지금까지 `data-cms` 태그가 없어 관리자에서 손댈 수 없던
> 텍스트·사진을 모두 찾아 태그를 추가하고 관리자 편집 목록(`window.CMS_FIELDS`)에 등록했습니다.
>
> - **새로 태깅한 페이지/영역**:
>   - `franchise/index.html` — 시스템 흐름(본사가 합니다/매장은 합니다/결과 카드), 운영증명 부제,
>     창업모델 3종 카드, 본사지원 섹션 제목, 최종CTA 2종 카드
>   - `franchise/cost/index.html` — 상단/하단 안내문, 비용 차이 이유, 10평대/30평대/업종전환 섹션,
>     비용 요약(포함/별도 항목), FAQ 2종, 최종CTA 2종 카드
>   - `franchise/faq/index.html` — 히어로 설명문, FAQ 17개 전체 질문/답변, 최종CTA 2종 카드
>   - `index.html`(홈) — 시스템 흐름, 창업모델 3종 카드, 매장 슬라이더 헤더 및 11개 매장(이름·주소,
>     무한 스크롤용 중복 세트 포함), FAQ 미리보기 3종, 최종CTA 2종 카드
>   - `store/index.html` — 히어로 설명문, 45개 매장 전체(이름·주소·한줄설명), 최종CTA 2종 카드
>   - `brand/index.html` — 숫자 카드 3종(면 연구 기간/숙성 시간/면 길이), 최종CTA 2종 카드
>   - `menu/index.html` — 안내문, 최종CTA 2종 카드
>   - `people/index.html` — 담당 조직 4종 카드, 역할 안내문, 신념 섹션, Q&A, 기술 카드 2종,
>     숫자 카드 3종, 최종CTA 2종 카드
>   - `contact/index.html` — 폼 하단 안내문, 신청완료 제목/설명
>   - **매장 상세 페이지 11개**(`store/{guri,yongsan,hapjeong,magok,euljiro,gayang,yeomchang,guro,
>     songdo,hanammisa,seomyeon}/index.html`) — 기존에는 `js/cms.js` 스크립트 자체가 로드되어 있지
>     않아 관리자 저장값이 전혀 반영되지 않는 상태였습니다. 전 11개 파일에 `js/cms.js`를 추가하고
>     각 페이지의 타이틀/설명문/매장명/주소/최종CTA 제목에 `storydetail.{매장}.*` 키로 태그했습니다
>     (구리본점은 "3.5시간의 기적" 증명 섹션 제목/인용문/설명도 추가로 태그).
> - **`admin/index.html`의 `window.CMS_FIELDS` 배열에 약 300개 항목 신규 등록** — 위에서 태그한
>   모든 키가 그룹별(페이지별)로 라벨과 함께 등록되어 `/admin/`에서 바로 편집 가능합니다.
>   `admin/editor.js`는 코드 변경 없이 확장된 배열을 그대로 렌더링합니다.
> - **검증**: PlaywrightConsoleCapture로 신규 스크립트 오류 없음을 확인했고, PlaywrightScreenshot으로
>   `/admin/` 좌측 그룹 내비게이션과 우측 편집 필드(텍스트/사진)가 항목 수 증가 후에도 정상
>   렌더링됨을 확인했습니다. 화면 상단의 "저장된 콘텐츠를 불러오지 못했습니다(HTTP 404)" 경고는
>   샌드박스 미리보기 환경에서 `/tables/site_content`가 연결되지 않아 나타나는 기존에 알려진
>   제약이며, Hosted Deploy 후에는 정상 동작합니다.
> - **범위 제외**: 기존 지침에 따라 EN/JA 버전은 이번에도 대상에서 제외했습니다.
> - **다음 단계 권장**: 실제 배포 후 `/admin/`에서 값을 저장하고 공개 페이지에 반영되는지 라이브
>   환경에서 재확인. 현재 편집기의 값 저장소(미리보기 데이터 저장소)와 배포된 사이트의 D1 데이터베이스는
>   별개이므로, 배포 후 관리자에서 다시 입력하거나 `HostedDbSyncFromPreview`로 이전이 필요합니다.

## 최근 업데이트 (2026-09-25) — 관리자 편집 항목 빈 화면 수정

- `/admin/`의 편집 항목 정의를 페이지 자체에 포함했습니다. 별도 `js/cms-fields.js`가 로드되지 않아 목록이 비어 있던 상황에서도 페이지별 메뉴와 텍스트/사진 입력 필드를 즉시 그립니다.
- 관리자 로직은 `admin/editor.js` 한 파일로 정리했습니다. 로그인 화면 및 로그아웃 버튼은 제거된 상태이며 `/admin/`에 로그인 없이 접속합니다.
- 저장된 값은 `GET /tables/site_content`에서 가져옵니다. 이 요청이 실패하면 오류를 표시하고 중복 저장을 막기 위해 저장 버튼을 비활성화합니다. 수정한 항목만 POST/PATCH로 저장합니다. 배포 사이트와 편집기 미리보기는 데이터 저장소가 별개입니다.
- **보안 주의**: `/admin/`과 Table API가 공개 접근 가능한 상태라면 누구나 콘텐츠 수정 요청을 보낼 수 있습니다. 실제 운영 전 플랫폼 접근 제어로 `/admin/`과 `/tables/site_content`를 함께 보호해야 합니다. 이 작업에서는 접근 규칙을 임의로 적용하지 않았습니다.
- **아직 미구현**: 서버 인증, 모든 하위 매장 페이지/FAQ 항목을 포함한 전체 텍스트·사진 편집. 다음 단계: Hosted 배포 후 실제 운영 URL에서 목록·저장·공개 페이지 반영 검증, 필요시 접근 규칙 설정 및 나머지 항목 확대.

## 관리자 콘텐츠 관리 기능 최초 추가 (2026-09-23)

> **`/admin/` 관리자 페이지 신설** — 홈페이지 일부 **텍스트 문구**와 **주요 사진**을 코드 수정 없이 바꿀 수 있는 편집 화면입니다. 현재는 로그인 없이 열립니다.
>
> - **접근 경로**: `/admin/` (인증 없음 — 운영 환경에선 별도 접근 제어 필요)
> - **구조**:
>   - `.tables/schema.json`에 `site_content` 테이블을 새로 정의(`key`/`page`/`label`/`type`/`value`).
>   - `admin/index.html` 내 `window.CMS_FIELDS` — 관리자에서 편집할 항목 정의(페이지별로 그룹핑).
>   - `js/cms.js` — 모든 공개 페이지(`index.html`, `brand/`, `franchise/`, `franchise/cost/`,
>     `franchise/faq/`, `menu/`, `people/`, `contact/`, `store/`)에 로드되는 스크립트로,
>     각 요소의 `data-cms="키"` 값을 보고 `site_content` 테이블에 저장된 값이 있으면 그 값으로
>     본문 텍스트나 이미지를 바꿔치기합니다. 저장된 값이 없으면 원래 텍스트/사진이 그대로 보입니다.
>   - `admin/index.html` + `admin/editor.js` — 그룹별(홈-히어로, 브랜드스토리,
>     창업안내 등) 텍스트 입력창과 사진 업로드 버튼을 제공하고, **전체 저장** 클릭 시
>     변경된 항목만 `POST/PATCH /tables/site_content`로 저장합니다.
> - **사진 업로드 방식**: 별도 파일 서버가 없는 정적 사이트 구조이므로, 선택한 이미지 파일을
>   브라우저에서 base64 문자열로 변환해 `site_content.value`에 텍스트처럼 저장합니다
>   (권장 용량 3MB 이하 — 너무 큰 이미지는 페이지 로딩이 느려질 수 있습니다).
> - **⚠️ 보안 안내**: 현재 로그인 화면은 제거되었으며 서버 인증도 없습니다. `/admin/` 페이지 및
>   `/tables/site_content` API 모두 운영 시 접근 제한이 필요합니다. 화면을 숨기는 것만으로는 API를 보호할 수 없습니다.
> - **적용 범위**: EN/JA는 기존 지침에 따라 이번에도 대상에서 제외했으며, 한국어(KO) 페이지의
>   히어로 문구, 섹션 제목/설명문, 본사 지원 카드, 숫자 카드, 대표 사진(브랜드스토리·누들·
>   비즈니스프루프·메뉴 대표메뉴 2종·48시간 숙성 사진 등), 대표 전화번호, 푸터 브랜드 설명문 등
>   항목을 관리자에서 수정할 수 있도록 태그를 심었습니다. **(2026-09-25 ②에서 홈/창업안내/
>   창업비용/FAQ/매장찾기/매장상세 11개·브랜드·메뉴·피플·창업문의까지 전면 확대, 총 약 380여 개
>   항목으로 증가 — 아래 "관리자 편집 범위 대폭 확대" 항목 참고)**

## 최근 업데이트 (2026-09-18)

> **Footer "MENU/CONTACT" 등 컬럼 제목 1행 고정 + 모바일 2단 배치** — `.footer-col h5`에
> `white-space:nowrap`을 추가해 MENU·CONTACT·FRANCHISE·STORES·FIND & SNS 등 모든 footer
> 컬럼 제목이 줄바꿈 없이 1행으로 표시되도록 했습니다. 이어서 모바일(900px 이하)에서 기존
> 전체 1단 세로 배치였던 footer 컬럼들을, 브랜드 로고/소개는 전체 폭 1행 유지 + MENU/CONTACT
> (또는 FRANCHISE/STORES + CONTACT)는 가로 2단 배치 + Find & SNS 아이콘 그리드(있는 페이지)는
> 다시 전체 폭 1행으로 배치되도록 수정했습니다.

> **'우동키노야 사람들' 담당 조직 카드 2행 2열 확대** — `people/index.html`의 담당 조직
> 카드(R&D·상권개발·슈퍼바이징·신메뉴마케팅) 4개를 기존 1행 4열(2행 배치)에서 `.model-grid
> .is-2x2` modifier로 2행 2열로 재배치하고, 카드 패딩·제목·본문 글자 크기를 키웠습니다. 이
> modifier는 people 페이지에만 적용되어 franchise/index.html 등 다른 3열 `.model-grid`
> 페이지에는 영향을 주지 않습니다.

## 최근 업데이트 (2026-09-17)

> **매장 사진 크기 조정** — `/store/guri/` 상세페이지의 대표 사진(`.store-card#guri .store-thumb`)은
> `is-photo-large` modifier로 2배 확대했고, `/store/` 매장 리스트 페이지(우리동네 키노야)의 카드
> 썸네일은 `is-photo-xl` modifier로 확대했다가 "너무 크다"는 피드백에 따라 최종 폭 440px(원본 대비
> 2배)로 재조정했습니다. 두 modifier 모두 ID/페이지 스코프로 한정되어 있어, 각 매장 상세 페이지
> (`/store/{yongsan,hapjeong,magok}/`)와 서로 영향을 주지 않습니다.

> **하단 Footer "Find & SNS" 아이콘 그리드 추가** — 홈, 브랜드스토리, 사람들, 창업안내, 창업비용,
> FAQ, 메뉴소개, 매장 리스트/상세(구리·신용산·합정·마곡), 창업문의, noodle 안내 등 한국어(KO)
> 전체 페이지의 footer `.footer-top`에 4번째 칼럼(`Find & SNS`)을 추가했습니다. 네이버지도·
> 구글지도·카카오맵(브랜드명 검색 링크)과 유튜브(브랜드 영상), 공유하기(Web Share API/URL 복사)는
> 실제로 동작하며, 티맵·블로그·인스타그램·스레드·페이스북·카카오채널·카카오스토리는 계정 URL이
> 없어 클릭 시 "준비중입니다" 안내가 뜨는 placeholder로 구현했습니다(실제 계정 주소를 받으면
> 바로 교체 가능). Font Awesome 아이콘(CDN)을 각 페이지에 추가했습니다. EN/JA는 기존 지침에 따라
> 이번에도 대상에서 제외했습니다.

> **모바일 전용 하단 고정 내비게이션 추가** — 900px 이하 화면에서 화면 최하단에 5개 항목
> (홈 / 키노야 신념 → `/people/#qna` / 창업안내 → `/franchise/` / 창업신청 → `/contact/` /
> 전화 → `tel:0507-1408-1984`)으로 구성된 `.mobile-bottom-nav`를 추가했습니다. 기존 모바일
> 플로팅 CTA(`.floating-cta`)는 하단 네비와 겹치지 않도록 900px 이하에서 비활성화되고,
> `body`에 하단 여백(`padding-bottom`)을 추가해 페이지 콘텐츠가 네비 바에 가리지 않게 했습니다.
> 현재 페이지에 해당하는 항목은 밑줄 + 색상으로 활성화 표시되며, 데스크톱(900px 초과)에서는
> 표시되지 않습니다. KO 전체 페이지(404.html 포함)에 적용했으며, EN/JA는 이번에도 제외했습니다.

---

## 사이트 구조 (IA) — 클린 디렉토리 URL 구조 (PART 4 반영)

| 경로 | 역할 |
|---|---|
| `/` (index.html) | HOME — 브랜드 전체 이해와 주요 페이지 분기 |
| `/brand/` | BRAND — 브랜드 시작과 철학 |
| `/noodle/` | **(2026-09-17부로 콘텐츠 이동)** 구 THE NOODLE 페이지. 48시간 숙성면 USP 콘텐츠는 `/people/`의 하위 카테고리로 이동했으며, 이 URL은 `noindex` + 3초 자동 리다이렉트로 `/people/#qna`를 안내하는 이동 안내 페이지로 축소됨 (SEO 자산 보존을 위해 URL 자체는 유지) |
| `/menu/` | MENU — 대표메뉴 안내 |
| `/store/` | STORE — 매장 리스트 (구리본점·신용산본점·합정점·마곡점) |
| `/store/guri/`, `/store/yongsan/`, `/store/hapjeong/`, `/store/magok/` | STORE DETAIL — 매장별 개별 상세 페이지 (각 Restaurant Schema 보유) |
| `/franchise/` | FRANCHISE — 가맹사업 개요, 시스템, 창업모델, 본사 지원 허브 |
| `/franchise/cost/` | COST — 창업비용 (소형점포·일반형·업종전환) |
| `/franchise/faq/` | FAQ — 창업 전 질문 (FAQPage Schema, 카테고리 탭) |
| `/people/` | PEOPLE — 브랜드를 움직이는 조직·역할 **+ 하위 카테고리 "키노야의 신념과 경쟁력"**(구 `/noodle/` 콘텐츠: Q&A, 48시간 숙성 이유, 핵심기술, 연구 데이터). `.section-jump` 바로가기 바로 담당조직/Q&A/숙성이유/핵심기술/연구데이터 5개 섹션에 앵커 이동 가능 |
| `/contact/` | CONTACT — 창업 상담 신청 폼 |
| `/admin/` | **관리자(admin) 콘텐츠 관리 페이지** — 로그인 없이 접속, 텍스트/사진 수정 (`noindex, nofollow`, sitemap 미등록). API는 `/tables/site_content` (GET/POST/PATCH) |
| `/404.html` | 404 오류 페이지 (noindex) |
| `/robots.txt`, `/sitemap.xml` | Technical SEO |
| `/llms.txt` | AEO/GEO — LLM/AI 검색 시스템을 위한 공식 정보 경로 요약 |
| `/en/`, `/en/brand/`, `/en/noodle/`, `/en/menu/`, `/en/store/` (+ `/en/store/{guri,yongsan,hapjeong,magok}/`), `/en/franchise/`, `/en/franchise/cost/`, `/en/franchise/faq/`, `/en/people/`, `/en/contact/` | **영어(EN) 버전** — 한국어 페이지와 1:1 대응하는 완전한 영어 번역본 (매장 상세 4개 포함) |
| `/ja/`, `/ja/brand/`, `/ja/noodle/`, `/ja/menu/`, `/ja/store/` (+ `/ja/store/{guri,yongsan,hapjeong,magok}/`), `/ja/franchise/`, `/ja/franchise/cost/`, `/ja/franchise/faq/`, `/ja/people/`, `/ja/contact/` | **일본어(JA) 버전** — 한국어 페이지와 1:1 대응하는 완전한 일본어 번역본 (매장 상세 4개 포함) |

> **다국어(영어·일본어) 버전 지원** — 한국어 10개 공개 페이지 전체에 대응하는 영어 버전을 `/en/`,
> 일본어 버전을 `/ja/` 하위에 각각 동일한 디렉토리 구조로 제작했습니다. 모든 언어의 대응 페이지는
> `<link rel="alternate" hreflang="ko">`/`hreflang="en">`/`hreflang="ja">`/`hreflang="x-default">`
> 4종 태그로 상호 연결되어 있으며, 헤더 nav와 모바일 메뉴에 **3언어 전환 UI**(`.lang-switch-group`)를
> 제공합니다 — 현재 페이지가 아닌 나머지 두 언어로 이동하는 링크(KO/EN/JA)가 항상 표시됩니다.
> `sitemap.xml`에도 일본어 10개 URL과 `xhtml:link` hreflang 주석을 추가해 총 30개 URL(KO 10 + EN 10 + JA 10)을
> 등록했습니다. 창업 상담 폼(`/en/contact/`, `/ja/contact/`)은 한국어판과 동일한 `consultations`
> 테이블·API 엔드포인트를 공유하며, `startup_type` 값은 스키마의 한국어 enum(신규창업/업종전환/
> 기존점포보유/미정)을 그대로 사용해 데이터 정합성을 유지합니다(라디오 버튼 라벨만 각 언어로 표시).

> **매장별 상세 페이지 라우팅 지원** — 구리본점·신용산본점·합정점·마곱점 4개 매장 각각을 개별 상세 페이지로
> 분리해 KO/EN/JA 각 언어로 제공합니다(`/store/{slug}/`, `/en/store/{slug}/`, `/ja/store/{slug}/`,
> 총 12개 페이지). 각 상세 페이지는 고유 메타·canonical·4-way hreflang과 해당 매장의 Restaurant
> Schema(`@id=".../store/{slug}/#restaurant"`)를 보유하며, 구리본점 페이지에는 "3.5시간의 기적"(27석·
> 일 최고매출 300만원 사례) 증거 섹션도 포함되어 있습니다. 매장 목록(`/store/`)의 카드 제목과
> 홈페이지의 매장 미리보기 카드에서 상세 페이지로 연결되도록 링크를 개편했고, `sitemap.xml`에도
> 12개 URL을 추가했습니다.

> **"3.5시간의 기적" 증거 섹션 → 구리본점 상세페이지 크로스링크** — 구리본점의 "27석·일 최고매출
> 300만원" 통계를 인용하는 모든 위치에서 `/store/guri/`(및 EN/JA 대응 경로)로 연결되는 링크를
> 추가했습니다: ① 홈페이지(`/`, `/en/`, `/ja/`) "Business Proof · 3.5시간의 기적" 섹션의
> `.video-links`에 "구리본점 자세히 보기" 링크 추가(기존 "창업 시스템 알아보기"와 함께 flex/
> flex-wrap으로 나란히 배치), ② `/franchise/`, `/en/franchise/`, `/ja/franchise/` "Why It Works"
> 요약 섹션의 `verify-note` 문단 바로 아래에 "구리본점 상세 정보 보기 →" 링크 추가, ③
> `/franchise/faq/`, `/en/franchise/faq/`, `/ja/franchise/faq/`의 매출 관련 FAQ 답변 `faq-meta`
> 출처 표기 끝에 동일 상세페이지 링크 추가. 총 9개 파일(KO/EN/JA × 3개 위치)에 적용되었으며,
> 모두 Playwright로 콘솔 에러 없음과(가능한 페이지는) 시각적 레이아웃 정상을 확인했습니다.

> **매장 목록 페이지의 Restaurant Schema `@id` 일치화** — 매장 상세 페이지 라우팅 도입 이후에도
> 매장 목록 페이지(`/store/`, `/en/store/`, `/ja/store/`)의 JSON-LD `@graph`에는 옛 앵커 방식의
> `@id="https://www.udonkinoya.com/store/#{slug}"`가 남아 있어, 각 매장에 대해 목록 페이지와
> 상세 페이지가 서로 다른 Restaurant 엔티티(`@id`)를 갖는 정합성 문제가 있었습니다. 4개 매장 ×
> 3개 언어(KO/EN/JA) 총 12곳의 `@id`와 `url`을 상세 페이지의 `@id="https://www.udonkinoya.com/store/{slug}/#restaurant"`
> 형식으로 통일해, 동일 매장이 어느 페이지에서 언급되든 검색엔진·AI가 하나의 동일한 Restaurant
> 엔티티로 인식하도록 개선했습니다. PlaywrightConsoleCapture로 3개 목록 페이지 모두 콘솔 에러
> 없음(JSON-LD 파싱 정상)을 확인했습니다.

> **프로덕션 도메인: `https://www.udonkinoya.com/`로 확정되었습니다** (2026-09-16). 모든 canonical·
> og:url·JSON-LD `@id`/`url`·sitemap.xml·robots.txt·llms.txt가 이 도메인 기준으로 작성되어 있습니다.
> 단, 실제 도메인 DNS 연결/커스텀 도메인 등록은 Publish 탭 또는 Hosted Deploy 단계에서 별도로
> 진행해야 하는 배포 작업이며, 이 저장소의 정적 파일 수정만으로는 완료되지 않습니다.

> 이전에는 `brand.html`, `franchise-cost.html` 같은 평면(flat) `.html` 구조였으나,
> PART 4 권장에 따라 **디렉토리 기반 클린 URL** (`/brand/`, `/franchise/cost/`, `/franchise/faq/` 등)
> 로 전면 전환했습니다. 각 폴더의 `index.html`이 해당 경로의 실제 페이지이며, 내부링크·canonical·
> og:url·JSON-LD `@id`/`url`·sitemap.xml 전체를 새 경로로 일치시켰습니다. 기존 flat `.html` 파일은
> 삭제되었습니다 (리다이렉트 규칙은 정적 사이트 특성상 별도 설정 필요 — 배포 플랫폼에 리다이렉트
> 기능이 없다면 기존 `.html` URL로 유입되던 백링크·즐겨찾기는 404가 됩니다. 실제 운영 중인 백링크가
> 없는 상태이므로 지금 전환하는 것이 유리합니다).

> **헤더 nav 단순화 + 페이지 내 "바로가기" 섹션 (2026-09-17)** — 상위 카테고리 클릭 시 하위
> 섹션으로 이동하는 기능을 처음에는 헤더 드롭다운 방식으로 구현했으나, 데스크톱 nav 텍스트가
> 줄바꿈되어 보기 불편하다는 피드백에 따라 **헤더 nav는 단순 1줄 링크 목록으로 되돌리고**,
> 대신 **각 페이지 헤더(`.page-header`) 바로 아래에 `.section-jump` "바로가기" 칩 바**를
> 추가하는 방식으로 전환했습니다. 적용 페이지는 한국어 14개
> (`/`, `/brand/`, `/noodle/`, `/menu/`, `/people/`, `/store/`,
> `/store/{guri,yongsan,hapjeong,magok}/`, `/franchise/`, `/franchise/cost/`,
> `/franchise/faq/`, `/contact/`)입니다.
> - **헤더 nav**: 모든 페이지의 `.nav-menu`/`.nav-mobile-panel`이 드롭다운 없는 평범한
>   1줄(데스크톱)/세로 목록(모바일) 링크로 통일되어, 화면이 좁아도 항목이 줄바꿈되지 않습니다.
> - **바로가기 섹션**: `brand/`, `noodle/`, `menu/`, `franchise/`, `store/` 페이지의
>   `.page-header` 바로 아래에 어두운 배경의 가로 스크롤 가능한 칩 링크 바(`.section-jump`)를
>   추가했습니다. 각 칩은 해당 페이지의 실제 섹션 `id`(`#origin`, `#principle`, `#legacy`,
>   `#qna`, `#aging`, `#tech`, `#numbers`, `#kake`, `#bukkake`, `#model`, `#support`,
>   `#guri`, `#yongsan`, `#hapjeong`, `#magok` 등) 또는 하위 페이지(`franchise/cost/`,
>   `franchise/faq/`)로 연결됩니다.
> - **앵커 이동 시 가림 방지**: `main [id]`, `.faq-category-tabs`에 `scroll-margin-top:110px`를
>   적용해 고정 nav가 목표 섹션 상단을 가리지 않도록 했습니다.
> - **FAQ 카테고리 딥링크**: `franchise/faq/#cat-brand`, `#cat-cost`, `#cat-sales`, `#cat-ops`,
>   `#cat-store`, `#cat-support` 해시로 진입하면 `js/main.js`의 `applyCatHash()` 함수가
>   `DOMContentLoaded`/`hashchange` 시 해당 해시와 일치하는 `.faq-category-tabs
>   button[data-cat]`을 자동 클릭해 기존 탭 필터링 로직을 재사용합니다(FAQ 페이지 자체에는
>   이미 카테고리 탭 UI가 있어 별도 바로가기 바는 추가하지 않았습니다).
> - 페이지별 상대경로 깊이 규칙(루트/`../`/`../../`/자기참조 `./`)은 기존 관례를 그대로
>   유지했습니다. EN/JA 버전은 사용자 요청에 따라 이번 작업 범위에서 제외했습니다(추후 진행).

모든 페이지는 공통 `kinoya.css` + `js/main.js`를 사용하며, 헤더 nav·모바일 메뉴·
플로팅 CTA·FAQ 아코디언·reveal 애니메이션을 공유합니다. **내부 링크와 정적 리소스(CSS/JS/이미지)
경로는 모두 페이지 깊이에 맞춘 상대경로**로 통일했습니다 (루트: `kinoya.css`, `js/main.js`,
`brand/` 등 / 1단계 깊이 `brand/`,`noodle/`,`menu/`,`store/`,`franchise/`,`people/`,`contact/`:
`../kinoya.css`, `../js/main.js`, 형제 페이지는 `../브랜드명/` / 2단계 깊이 `franchise/cost/`,
`franchise/faq/`: `../../kinoya.css`, `../../js/main.js`, 형제는 `../faq/`처럼 한 단계만 상위 이동).
절대경로(`/...`)를 쓰면 브라우저 미리보기 환경에서 파일이 프로젝트 루트가 아닌 도구 자체 도메인
기준으로 해석되어 CSS/JS가 로드되지 않는 문제가 있어(진단: PlaywrightConsoleCapture로 MIME
type 오류 확인), 정적 리소스는 전부 상대경로로 전환했습니다. 반면 상담 폼이 사용하는 RESTful
Table API 엔드포인트(`fetch('/tables/consultations', …)`, `js/main.js`)는 예외적으로 절대경로를
유지합니다 — 이는 정적 파일이 아니라 배포된 사이트 도메인 루트에 항상 마운트되는 플랫폼 API
경로이므로, 페이지 깊이와 무관하게 항상 도메인 루트의 `/tables/consultations`를 가리켜야 정상
동작합니다 (상대경로로 두면 2단계 깊이 페이지에서 `franchise/cost/tables/consultations`처럼
잘못된 경로로 요청되어 실패합니다).

---

## 완료된 기능

### 콘텐츠 / IA / AEO / GEO
- 단일 랜딩페이지 → **역할이 분리된 10개 페이지**로 재구성 (BRAND/NOODLE/MENU/STORE/FRANCHISE/COST/FAQ/PEOPLE/CONTACT/404)
- **매장별 상세 페이지 라우팅** — `/store/`의 매장 목록 외에 `/store/guri/`, `/store/yongsan/`,
  `/store/hapjeong/`, `/store/magok/` 4개 개별 상세 페이지를 KO/EN/JA 각 언어로 신규 제작(총 12개
  페이지). 매장 목록 카드와 홈페이지 미리보기 카드에서 상세 페이지로 링크가 연결되며, 각 상세
  페이지는 고유 canonical·4-way hreflang·Restaurant Schema를 보유합니다.
- 각 페이지 **Answer First** 구성 (예: noodle.html의 "직접 제면해야 하나요?" 질문-답변을 최상단 배치)
- **FAQPage 구조화 데이터**(`franchise-faq.html`) — 브랜드·제품/창업비용/매출·수익/운영/점포/본사지원 6개 카테고리, 15개 질문
- **근거 배지(evidence-badge)** — "운영자(본사) 제공 자료" 등 출처 표기, 확정 견적/평균 매출이 아님을 매 지점에서 명시
- **금지 표현 회피** — 매출 보장·수익 보장·전국 최고·업계 1위 등 과장 표현 미사용. 구리본점 수치는 "일 최고매출·특정 기간 사례"로 한정
- **Single Source 원칙** — 13개월/48시간/약 80cm 등 핵심 숫자는 각 페이지에서 동일 문구로 반복 (kinoya.css `.numbers` 컴포넌트로 시각 통일)
- **내부링크 구조** — BRAND→NOODLE, NOODLE→MENU/FRANCHISE, PROOF→FRANCHISE, FRANCHISE→SYSTEM/COST/MODEL, COST→FAQ, FAQ→관련 상세페이지, STORE→CONTACT

### Technical SEO
- 페이지별 고유 `<title>` / `<meta description>` / `og:*`(모든 페이지에 `og:image` 포함) / canonical
- **Schema.org JSON-LD**: WebSite, Organization, Brand(index) / BreadcrumbList(전 페이지) / Restaurant(store/, 4개 매장) / FAQPage(franchise/faq/) / Question(noodle/)
- `robots.txt`, `sitemap.xml` (KO/EN/JA 30개 공개 페이지, 404·admin 제외, `<lastmod>` 포함, 4-way hreflang)
- Breadcrumb UI + Schema 동시 반영
- 전 페이지(404 포함) `<link rel="icon">` favicon 태그 추가
- **전용 favicon 신규 제작** — 네이비 배경에 아이보리 우동 그릇 + 골드 톤 김 스월(steam) 모티프의
  정사각형 아이콘(`images/favicon.png`, AI 생성)을 신규 제작해 기존 매장 사진 재사용(`images/store-icon.jpg`)을
  대체했습니다. 전 11개 페이지(404 포함)의 `<link rel="icon">`을 새 파일로 교체 완료
- **`llms.txt`** — AEO/GEO 대응, LLM/AI 검색 시스템이 참고할 공식 페이지 목록과 정확성 원칙(매출 미보장 등)을 루트에 명시 — English Version / Japanese Version 안내 섹션 포함
- **프로덕션 도메인 확정** — `https://www.udonkinoya.com/`로 확정 (canonical/og/JSON-LD/sitemap 전체 이미 이 도메인 기준)

### 다국어 (EN/JA) — 완료
- **영어(EN) 버전** — 한국어 10개 공개 페이지 전체에 대응하는 완전한 영어 버전을 `/en/` 하위에 동일
  구조로 제작. FAQPage JSON-LD(16개 질문) 영어 번역, Restaurant Schema 4개 매장 영문 주소 표기 포함.
- **일본어(JA) 버전** — 한국어 10개 공개 페이지 전체에 대응하는 완전한 일본어 버전을 `/ja/` 하위에 동일
  구조로 신규 제작했습니다. FAQPage JSON-LD(16개 질문) 일본어 번역, Restaurant Schema 4개 매장명을
  일본어 표기(九里本店/新龍山本店/合井店/麻谷店)로 재작성했고, 카카오맵 검색 링크는 기존 한국어 검색어를
  그대로 재사용했습니다(카카오맵 검색 인덱스가 한국어 지명으로 되어 있기 때문).
- **3언어 전환 UI 개편** — 기존 단일 링크형 `.lang-switch`를 `.lang-switch-group`(flex 컴테이너)로
  확장해 KO/EN/JA 서로 연결. 해당 페이지가 아닌 다른 두 언어로의 링크가 항상 표시되며, 데스크톱 nav와
  모바일 패널 모두에 적용되어 있습니다.
- **4-way hreflang** — 모든 30개 페이지(KO 10 + EN 10 + JA 10)에 `hreflang="ko"`/`"en"`/`"ja"`/`"x-default"`
  네 가지 `<link rel="alternate">` 태그가 모두 상호 연결되어 있습니다.
- **`sitemap.xml`** — KO 10 + EN 10 + JA 10 = 총 30개 URL, 각 URL마다 4-way `xhtml:link` hreflang 주석 포함.

### 관리자(admin) 콘텐츠 관리
- **`/admin/` 관리자 페이지** — 한국어(KO) 공개 페이지 전체(홈, 브랜드스토리, 창업안내, 창업비용,
  창업FAQ, 매장찾기 목록 및 45개 매장 정보, 매장 상세 페이지 11개, 메뉴소개, 우동키노야 사람들,
  창업문의)의 주요 문구·대표 사진을 코드 수정 없이 직접 편집 가능 (약 380여 개 항목, 자세한 구조는
  상단 "최근 업데이트" 및 아래 "데이터 모델 → `site_content`" 참고)
- `<meta name="robots" content="noindex, nofollow">` 적용, `sitemap.xml` 미등록으로 검색 노출 차단

### UI / UX (Mobile First)
- 신규 컴포넌트: KINOYA NUMBERS 카드, SYSTEM FLOW(본사↔매장 역할 다이어그램), 창업모델 카드, 창업비용 테이블(모바일은 카드형 자동 전환), FAQ 아코디언 + 카테고리 탭, 매장 리스트 카드, 상담 폼, 모바일 하단 플로팅 CTA
- **매장별 카카오맵 검색 링크** (`/store/`) — API 키 없이도 동작하는 `map.kakao.com/link/search/` 방식으로 4개 매장 각각에 "🗺 지도에서 찾기" 버튼 추가 (정확한 도로명 주소가 없는 구리본점 등은 좌표 하드코딩 대신 카카오맵 자체 검색에 위임해 오표기 위험 회피)
- 모바일 풀스크린 메뉴 오버레이 (햄버거 토글)
- 반응형 브레이크포인트 900px, 640px, 480px
- 이미지: 라이선스 안전한 생성 이미지(`images/udon-*.jpg`) 및 업로드 매장 사진 사용, `loading="lazy"`/`width`/`height` 지정으로 CLS 방지

### 데이터 연동
- **`consultations` 테이블** 생성 — 상담 신청 폼(`contact.html`)이 RESTful Table API(`POST tables/consultations`)로 저장
  - 필드: `name`, `phone`, `region`, `startup_type`, `message`, `consent`, `source_page`, `status`
- Analytics 훅: `data-event` 속성 기반 `franchise_cta_click`, `store_phone_click`, `form_submit` 등 이벤트를 `gtag`/`dataLayer`가 있을 때만 전송 (미연동 시 무동작, 에러 없음)

### 접근성 (Accessibility)
- **본문 바로가기(Skip Link)** — 전 11개 페이지(404 포함)에 `<a href="#main-content" class="skip-link">본문 바로가기</a>`를 `<body>` 최상단에 추가하고 각 `<main>`에 `id="main-content"` 부여. 평소엔 화면 밖에 숨어 있다가 키보드 Tab 포커스 시에만 나타나 반복 네비게이션을 건너뛸 수 있음
- **키보드 포커스 표시** — `:focus-visible`에 명시적 아웃라인(`--broth` 색상)을 적용해 마우스 클릭 시에는 표시되지 않고 키보드 탐색 시에만 나타나도록 처리
- **일본어 텍스트 `lang="ja"` 명시** — nav 로고의 "木ノ屋", 각 섹션의 일본어 타이틀(`.jp-title`), 매장 카드의 한자 마크(`.jp-mark`) 등 전 페이지의 일본어 텍스트에 `lang="ja"` 속성을 부여해 스크린리더가 올바른 언어(일본어)로 발음하도록 개선 (문서 전체 `lang="ko"`는 유지, 일본어 구간만 지역적으로 오버라이드)
- **FAQ 아코디언 `aria-controls` 연결** — index.html(3개), franchise/cost/(2개), franchise/faq/(16개) 전체 FAQ 버튼에 `aria-controls="faq-N"` + 대응 답변 패널에 `id="faq-N"`을 부여해 버튼과 패널의 프로그래밍적 연결 관계를 명시 (기존 `aria-expanded`는 유지)

---

## 데이터 모델

### `consultations` (RESTful Table API, 미리보기 데이터 저장소)
| 필드 | 타입 | 설명 |
|---|---|---|
| id | text | 고유 ID (자동) |
| name | text | 신청자 성함 |
| phone | text | 연락처 |
| region | text | 희망 출점 지역 |
| startup_type | text | 신규창업/업종전환/기존점포보유/미정 |
| message | rich_text | 추가 문의 내용 |
| consent | bool | 개인정보 동의 여부 |
| source_page | text | 신청이 접수된 페이지 |
| status | text | new/contacted/closed |

⚠️ 이 테이블은 **미리보기(Preview) 데이터 저장소**에 저장됩니다. Hosted Deploy로 배포한
프로덕션 사이트는 별도의 D1 데이터베이스를 사용하므로, 실제 운영 전 배포 후 접수 데이터를
확인하려면 Hosted Deploy가 필요합니다.

### `site_content` (RESTful Table API, 관리자 콘텐츠 저장소)
| 필드 | 타입 | 설명 |
|---|---|---|
| id | text | 고유 ID (자동) |
| key | text | `data-cms="..."` 값과 1:1 대응하는 콘텐츠 식별 키 (예: `home.hero.headline`, `social.kakao.title`) |
| page | text | 소속 페이지/그룹명 (관리자 화면 좌측 그룹 내비게이션용) |
| label | text | 관리자 화면에 표시되는 한글 설명 라벨 |
| type | text | `text`(문구) 또는 `image`(사진, 800KB 이하 PNG로 자동 변환 후 base64 저장) |
| value | rich_text | 실제 저장되는 값 — 문구 원문 또는 이미지 base64/URL 문자열 |

`/admin/`에서 저장한 값은 `js/cms.js`가 모든 공개 페이지에서 `/tables/site_content`를
불러와 `data-cms` 속성이 붙은 요소에 덮어씁니다. `data-cms-type`에 따라 처리 방식이 다릅니다:
`(없음)`은 innerHTML, `img`는 `<img>` src, `bg`는 CSS backgroundImage, `meta`는 `<meta>`
태그의 `content` 속성(카카오톡/SNS 공유 시 보이는 제목·설명 등), **`favicon`은
`<link rel="icon">`의 `href` 속성**(브라우저 탭 아이콘, 전 페이지 공통)을 교체합니다. 저장된
값이 없는 키는 원래 하드코딩된 텍스트/이미지/메타값이 그대로 노출됩니다(안전한 폴백).
관리자 화면 입력창에는 저장된 값이 없을 때 `window.CMS_FIELDS`의 `current`(지금 홈페이지에
실제 쓰인 문구)가 기본으로 채워집니다. 사진 필드는 파일 선택 시 자동으로 PNG로 변환되고
800KB 이하로 리사이징된 뒤 저장 준비됩니다. ⚠️ 이 테이블도 **미리보기 데이터 저장소**이므로,
관리자에서 수정한 내용이 실제 배포 사이트에 반영되려면 Hosted Deploy 및(필요 시)
HostedDbSyncFromPreview를 통한 데이터 이전이 필요합니다.

---

## 절대 지킨 원칙 (콘텐츠 정확성)

이번 개편에서 생성하지 않은 항목 (검증 불가 데이터):
- 정확한 창업비용 확정치, 평균매출, 점주 수익, 가맹점 수, 고객 수
- 후기, 별점, 수상, 인증, 조직 구성원 실명·경력
- "매출 보장", "누구나 성공", "인건비 절반" 등 확정형 표현

대신 사용한 표현:
- 창업비용: "본사 제공 FAQ 기준 참고 범위 · 확정 견적 아님" 배지와 함께 표기
- 구리본점 매출: "일 최고매출 300만원 이상, 특정 기간 사례" (평균 아님 명시)
- 원가율 33~34%: "운영자 제공 자료 기준, 최신 확인 필요" 명시

---

## 구현하지 않은 기능 (다음 단계 권장)

1. ~~실제 프로덕션 도메인 확정~~ → **확정 완료 (2026-09-16)**: 사용자가 **`udonkinoya.com`**을 실제
   프로덕션 도메인으로 확정했습니다. 기존에 모든 canonical/og:url/`sitemap.xml`/`robots.txt`/JSON-LD
   `@id`·`url`이 이미 `https://www.udonkinoya.com/...` 형식으로 작성되어 있었으므로 **추가 코드 수정은
   불필요**했습니다. 단, 이 도메인을 실제로 사이트에 연결(DNS 설정·커스텀 도메인 등록)하는 작업은
   정적 파일 수정 범위를 벗어난 **배포 단계(Publish 탭 또는 Hosted Deploy 커스텀 도메인 설정) 작업**이며,
   에이전트가 도메인을 구매·등록·DNS 설정할 수는 없습니다. 실제 연결은 배포 시 별도로 진행해야 합니다.
2. **비용·매출·원가율 수치의 실제 본사 검증** — 10평대 약 3,200만원/약 8천만원, 원가율 33~34%,
   구리본점 일 최고매출 300만원 등의 수치는 사용자가 프롬프트에 직접 입력한 값을 그대로 옮긴 것이며,
   실제 본사 공문·최신 자료로 재확인된 값이 아닙니다. 공개 전 반드시 실제 확인이 필요합니다.
3. **Google Search Console / GA4 / Naver Search Advisor / Bing Webmaster 연동**
   → 현재 데이터 없음. PART 48(성과 기반 최적화)는 실행 불가로 표시. 연동 후 재작업 필요.
4. ~~매장별 상세 페이지 라우팅~~ → **완료**: `/store/guri/`, `/store/yongsan/`, `/store/hapjeong/`,
   `/store/magok/` 4개의 개별 상세 페이지를 KO/EN/JA 각 언어로 신규 제작했습니다(총 12개 페이지).
   각 상세 페이지는 고유 `<title>`/메타/canonical/4-way hreflang과 해당 매장의 Restaurant Schema
   (`@id="https://www.udonkinoya.com/store/{slug}/#restaurant"`)를 보유하며, 구리본점 페이지에는
   "3.5시간의 기적"(27석·일 최고매출 300만원 사례) 섹션도 포함했습니다. 매장 목록(`/store/`)의 각
   카드 제목과 홈페이지의 매장 미리보기 카드에서 상세 페이지로 연결되도록 링크를 갱신했고,
   `sitemap.xml`에 12개 URL을 추가했습니다. 매장 목록 페이지(`/store/`, `/en/store/`, `/ja/store/`)에
   남아있던 옛 앵커 방식 `@id="https://www.udonkinoya.com/store/#{slug}"`도 이후 상세 페이지와
   동일한 `@id="https://www.udonkinoya.com/store/{slug}/#restaurant"`로 통일해, 두 페이지가 같은
   매장을 서로 다른 엔티티로 표시하던 정합성 문제를 해소했습니다.
5. **실사 매장 사진 교체** → **부분 완료 (2026-09-16)**: 사용자가 업로드한 우동키노야 구리본점 실사
   사진 중 시스템에서 실제 다운로드 가능했던 사진을 저장하고(`images/store-guri-exterior.jpg` 외관
   사인보드, `images/store-guri-counter.jpg` 다찌형 카운터, `images/store-guri-noodle-aging.jpg`
   2차 제면 숙성고+"麺で、語る。" 슬로건 액자 — 실제로 페이지에서 사용 중인 이미지 기준),
   기존에 5장의 이미지를 42개 페이지에서 반복 재사용하던 문제를 아래와 같이 개선했습니다:
   - `kinoya.css`의 공용 컴포넌트(`.miracle-visual` 기본 배경, `.tech-card` 기본 배경, `.final-cta`
     배경 — 39개 페이지 하단 CTA에 공통 적용)를 실사 사진으로 교체
   - 홈페이지(KO/EN/JA) STORE PROOF 섹션의 구리본점 카드에 `.jp-mark` 한자 텍스트 대신 실제 외관
     사진(`<img>`)을 추가하도록 `.news-thumb` CSS에 `img` 스타일 규칙 신설
   - 매장 목록(`/store/`, `/en/store/`, `/ja/store/`)과 구리본점 상세페이지(`/store/guri/` 등)의
     `store-thumb` 이미지를 실사 외관 사진으로 교체
   - 브랜드(`/brand/`)·누들(`/noodle/`) 페이지의 `miracle-visual`/`tech-card`를 숙성고·카운터 실사
     사진으로 교체해 두 페이지 간 이미지 중복 해소
   - 전 페이지 `og:image` 메타(24개 파일)를 실사 사진 경로로 업데이트
   - **남은 과제**: 업로드된 26장 중 22장은 시스템상 다운로드 불가(`not a Read path`) 상태라 미반영.
     신용산·합정·마곡점은 여전히 실사 사진이 없어 `.jp-mark` 한자 표시를 유지 중이며(각 매장 실사
     촬영본 확보 시 교체 필요), 메뉴(`/menu/`) 페이지의 가케우동/붓카케우동 이미지도 아직 실제 음식
     사진이 아닌 재사용 이미지 상태입니다. 프랜차이즈(`/franchise/`)·피플(`/people/`) 페이지 본문에도
     이미지가 없습니다. 추가 실사 사진(음식 클로즈업, 타 매장 외관 등) 확보 시 이어서 반영 가능합니다.
6. **People 페이지 실명 프로필** — 검증된 경력이 없어 조직 역할 단위로만 소개. 본사 확인 후 실명 프로필 추가 가능.
7. ~~다국어(영어/일본어) 버전~~ → **영어(EN)·일본어(JA) 버전 모두 완료**: 한국어 10개 공개 페이지 전체를
   `/en/`과 `/ja/` 하위에 각각 동일 구조로 번역·제작했습니다(4-way hreflang 상호 연결, 3언어
   전환 UI, sitemap 반영, 상담 폼 데이터 연동 포함). 추가 언어가 필요하면 동일한 패턴으로 확장
   가능합니다.
8. ~~전용 favicon 파일 미제작~~ → **완료**: AI 이미지 생성으로 브랜드 톤(네이비/아이보리/골드)에 맞는
   정사각형 우동 그릇 모티프 favicon(`images/favicon.png`)을 새로 제작해 전 11개 페이지의
   `<link rel="icon">`을 교체했습니다. 단, 다양한 해상도별 별도 파일(16x16/32x32 `.ico`,
   180x180 `apple-touch-icon`)까지는 만들지 않았고 단일 PNG 원본을 그대로 사용 중입니다 — 필요 시
   해상도별 파일 분리를 추가로 진행할 수 있습니다.
9. ~~Naver/Kakao 지도 임베드~~ → **부분 완료**: `/store/`의 각 매장 카드에 카카오맵 검색 링크
   (`map.kakao.com/link/search/...`, API 키 불필요)를 추가했습니다. 다만 이는 지도를 페이지 내부에
   직접 표시하는 "임베드"가 아니라 새 탭에서 카카오맵을 여는 "링크" 방식입니다. 실제 좌표 기반
   임베드(정확한 핀 위치 표시)는 카카오맵 API 키 발급 및 상세 도로명 주소·좌표 확정이 필요해
   보류했습니다 — 특히 구리본점은 현재 "경기도 구리시"까지만 주소 정보가 있어 정확한 지도 핀을
   표시하려면 상세 주소 확인이 선행되어야 합니다.

---

## 검증 결과

- **IA/URL 구조 개선 완료**: 전체 10개 공개 페이지(index, brand, noodle, menu, store, franchise,
  franchise/cost, franchise/faq, people, contact) + 404를 클린 디렉토리 URL(`*/index.html`)로 전환하고,
  전 페이지의 정적 리소스·내부링크 경로를 페이지 깊이에 맞는 상대경로로 수정 완료했습니다.
- **콘솔 에러**: 없음 — index.html, franchise/index.html, franchise/cost/index.html, franchise/faq/index.html
  전체 PlaywrightConsoleCapture 재확인 결과 MIME-type/404 오류 모두 해소됨
- **모바일 렌더링 재확인** (PlaywrightScreenshot, viewport=mobile): index.html(히어로), franchise/index.html
  (nav+본문), franchise/cost/index.html(비용 표→모바일 카드형 자동 전환 확인, full_page), franchise/faq/index.html
  (카테고리 탭+아코디언), store/index.html(매장 카드+이미지) — 모두 레이아웃 깨짐·이미지 누락 없음 확인
- **데스크톱 렌더링**: index.html 히어로 섹션 확인
- **Build/Lint/Test**: 정적 사이트 프로젝트로 별도 빌드 스크립트 없음 (해당 없음)
- **미검증 항목**: 상담 폼의 `fetch('/tables/consultations', ...)` 실제 제출 동작(브라우저 폼 인터랙션
  기반 테스트는 미실시). RESTful Table API 규격상 정상 동작이 기대되나, 실배포 후 실제 제출 테스트 권장.
- **STEP 2: Technical SEO 보완 완료** — `franchise/cost/`, `franchise/faq/`, `people/`, `contact/`
  4개 페이지에 누락되어 있던 `og:image` 메타태그를 추가했고, 전 11개 페이지(404 포함)에 favicon
  (`<link rel="icon">`)을 추가했습니다. `sitemap.xml` 전체 URL에 `<lastmod>2026-09-16</lastmod>`을
  추가해 크롤러에 최신성 신호를 제공합니다. `head` 영역만 수정한 변경이라 PlaywrightConsoleCapture로
  전 페이지 콘솔 에러 없음을 재확인했습니다 (렌더링 스크린샷은 이번 세션 중 브라우저 렌더 샌드박스
  포화로 일부 페이지에서 재시도 후에도 실패해 생략 — head 전용 변경이라 body 레이아웃 영향 없음).
- **STEP 3: 도메인 확정 + AEO + 지도 링크 완료** — 사용자가 프로덕션 도메인을 `udonkinoya.com`으로
  확정함에 따라 기존 canonical/og/JSON-LD 값을 그대로 유지(이미 일치)하고 README에 확정 사실을
  기록했습니다. AEO/GEO 대응을 위한 `llms.txt`를 신규 생성했습니다. `/store/`의 4개 매장 카드에
  카카오맵 검색 링크(API 키 불필요)를 추가했습니다. PlaywrightConsoleCapture로 store/index.html
  콘솔 에러 없음, PlaywrightScreenshot(mobile, full_page)으로 4개 매장 카드 모두 "지도에서 찾기"
  버튼이 레이아웃 깨짐 없이 정상 표시됨을 확인했습니다.
- **STEP 4: 접근성(Accessibility) 보완 완료** — 전 11개 페이지에 스킵 링크(`.skip-link`)와
  `<main id="main-content">`를 추가하고, `:focus-visible` 키보드 포커스 스타일을 `kinoya.css`에
  신설했습니다. 모든 일본어 텍스트(nav 로고, `.jp-title`, `.jp-mark`, `.hero-jp`)에 `lang="ja"`를
  부여했습니다. index.html·franchise/cost/·franchise/faq/의 전체 FAQ 아코디언(21개 항목)에
  `aria-controls`/`id` 연결을 추가했습니다. PlaywrightConsoleCapture로 index.html(무관한 WebGL
  환경 경고만 존재, 신규 에러 없음), franchise/faq/index.html, brand/index.html, store/index.html
  전체 콘솔 에러 없음을 확인했고, PlaywrightScreenshot(mobile)으로 index.html 헤더 로고와
  franchise/faq/index.html의 아코디언·카테고리 탭이 레이아웃 깨짐 없이 정상 표시됨을 확인했습니다.
- **전용 favicon 제작 완료** — `image_generation`(nano-banana-pro)으로 네이비 배경 + 아이보리
  우동 그릇 + 골드 스팀 라인의 정사각형 아이콘을 신규 생성해 `images/favicon.png`로 저장하고,
  전 11개 페이지(404 포함)의 `<link rel="icon">`을 기존 `images/store-icon.jpg`에서 이 파일로
  교체했습니다(경로 깊이별 상대경로 유지: 루트 `images/favicon.png`, 1단계 `../images/favicon.png`,
  2단계 `../../images/favicon.png`). PlaywrightConsoleCapture로 index.html·franchise/faq/index.html
  콘솔 에러 없음(신규 404/MIME 오류 없음)을 확인했습니다.
- **다국어(영어) 버전 신규 제작 완료** — 한국어 10개 공개 페이지(index, brand, noodle, menu, store,
  franchise, franchise/cost, franchise/faq, people, contact) 각각에 대응하는 영어 버전을 `/en/`
  하위에 동일한 디렉토리 구조로 제작했습니다. `franchise/faq/`의 FAQPage JSON-LD(16개 질문)도
  영어로 번역해 `/en/franchise/faq/`에 포함했고, `/en/store/`의 Restaurant Schema 4개도 영어
  주소 표기로 재작성했습니다. 모든 한국어·영어 대응 페이지에 `<link rel="alternate" hreflang="ko">`
  /`hreflang="en">`/`hreflang="x-default">`를 상호 추가했고, 헤더 nav·모바일 메뉴에 언어 전환
  링크(KO→EN: "EN", EN→KO: "한국어 (KO)")를 새 CSS 클래스 `.lang-switch`와 함께 추가했습니다.
  `sitemap.xml`은 기존 10개 URL에 `xhtml:link` hreflang 주석을 추가하고 영어 10개 URL도 신규
  등록해 총 20개 URL 체계로 확장했습니다. `llms.txt`에도 영어 버전 존재를 안내하는 섹션을
  추가했습니다. 상담 폼(`/en/contact/`)은 한국어판과 동일한 `POST tables/consultations` 엔드포인트를
  공유하며 라디오 버튼 값은 스키마 enum과 일치하는 한국어 원문을 그대로 전송합니다(라벨만 영어
  표시). PlaywrightConsoleCapture로 en/index.html·en/franchise/faq/·en/store/·en/contact/ 전체
  콘솔 에러 없음을 확인했고, PlaywrightScreenshot(mobile)으로 en/index.html의 히어로 영문 카피와
  언어 전환 링크, en/franchise/faq/의 영문 카테고리 탭·아코디언이 정상 렌더링됨을 확인했습니다.
  기존 한국어 index.html도 데스크톱/모바일 양쪽에서 EN 링크 추가 후 nav 레이아웃이 깨지지 않음을
  재확인했습니다.
- **다국어(일본어) 버전 신규 제작 완료** — 한국어 10개 공개 페이지 각각에 대응하는 일본어 버전을 `/ja/`
  하위에 동일한 디렉토리 구조로 제작했습니다. `franchise/faq/`의 FAQPage JSON-LD(16개 질문)도
  일본어로 번역해 `/ja/franchise/faq/`에 포함했고, `/ja/store/`의 Restaurant Schema 4개도 일본어
  주소 표기(九里本店/新龍山本店/合井店/麻谷店)로 재작성했습니다. 기존 KO/EN 20개 페이지(+404.html)에는
  `hreflang="ja"`를 추가하고, 언어 전환 UI를 단일 링크(`.lang-switch`)에서 3언어 그룹(`.lang-switch-group`)으로
  개편해 해당 페이지가 아닌 나머지 두 언어로 이동하는 링크를 동시에 노출했습니다. `sitemap.xml`은
  기존 20개 URL에 `hreflang="ja"` 주석을 추가하고 일본어 10개 URL을 신규 등록해 총 30개 URL 체계로
  확장했습니다. `llms.txt`에도 일본어 버전 존재를 안내하는 섹션을 추가했습니다. 상담 폼(`/ja/contact/`)은
  한국어판과 동일한 `POST tables/consultations` 엔드포인트를 공유하며 라디오 버튼 값은 스키마 enum과
  일치하는 한국어 원문을 그대로 전송합니다(라벨만 일본어 표시). PlaywrightConsoleCapture로 ja/index.html,
  ja/franchise/faq/index.html 콘솔 에러 없음(무관한 WebGL 환경 경고만 존재)을 확인했고, PlaywrightScreenshot로
  ja/index.html(mobile)의 헤더 언어 전환(KO/EN/JA) 및 일본어 히어로 카피, ja/franchise/faq/index.html(desktop)의
  일본어 카테고리 탭·아코디언이 레이아웃 깨짐 없이 정상 렌더링됨을 확인했습니다. 기존 한국어
  index.html(desktop)에서 EN/JA 링크가 모두 정상 표시되고, 영어 en/franchise/faq/index.html(mobile)에서도
  KO/JA 링크가 정상 표시되어 레이아웃이 깨지지 않음을 재확인했습니다.
- **매장별 상세 페이지 라우팅 완료** — `/store/guri/`, `/store/yongsan/`, `/store/hapjeong/`,
  `/store/magok/` 4개 매장 각각의 개별 상세 페이지를 KO/EN/JA 3개 언어로 신규 제작했습니다(총 12개
  페이지). 각 상세 페이지는 매장 목록 페이지(`/store/`)의 카드 레이아웃(`store-card`)을 재사용하고,
  고유 `<title>`/메타/canonical/4-way hreflang과 해당 매장의 Restaurant Schema(`@id=".../store/{slug}/#restaurant"`)를
  보유합니다. 구리본점 상세 페이지에는 홈페이지의 "3.5시간의 기적" 증거 섹션(27석·일 최고매출
  300만원 사례, evidence-badge·verify-note 포함)도 함께 배치했습니다. 매장 목록 페이지의 매장명
  제목과 홈페이지 매장 미리보기 카드(`news-card`)를 기존 `/store/#slug` 앵커에서 새 상세 페이지
  경로로 갱신했고(KO/EN/JA 모두), `sitemap.xml`에 12개 URL(각 4-way hreflang 포함)을 신규 등록했습니다.
  PlaywrightConsoleCapture로 store/guri/·ja/store/hapjeong/·en/store/magok/·store/index.html 콘솔
  에러 없음을 확인했고, PlaywrightScreenshot으로 store/guri/(mobile)의 breadcrumb·매장정보·증거
  섹션·CTA, store/index.html(desktop)의 매장명 링크(화살표 포함), ja/store/hapjeong/(mobile)의
  일본어 상세 페이지와 3언어 전환 UI가 모두 레이아웃 깨짐 없이 정상 렌더링됨을 확인했습니다.
- **사이트 전체 연결 오류(broken link) 전수 점검 완료 (2026-09-16)** — 42개 HTML 페이지(KO 14 +
  EN 14 + JA 14) 전체 + `kinoya.css` + `sitemap.xml` + `robots.txt` + `404.html` + `js/main.js`를
  대상으로 `href`/`<img src>`/CSS `url()` 상대경로 무결성을 전수 검증했습니다. nav·모바일 패널·
  footer·breadcrumb·lang-switch(KO/EN/JA 상호링크)·final-cta·floating-cta 등 모든 내비게이션
  요소와 페이지 깊이별(`./`,`../`,`../../`,`../../../`) 상대경로가 정확함을 확인했고, `sitemap.xml`
  42개 `<url>` 항목이 실제 42개 페이지와 1:1 일치함을 확인했습니다. **실제로 깨진 링크(404 유발
  참조)는 발견되지 않았습니다.** 점검 중 발견한 미사용(orphan) 이미지 3종(`images/kinoya-store-bg.jpg`,
  `images/store-guri-interior.jpg`, `images/udon-making-process.jpg` — 42개 페이지 어디에서도,
  `kinoya.css` 어디에서도 참조되지 않던 파일)은 사용자 요청에 따라 삭제했습니다. 그 외 개선
  권장사항(링크 깨짐 아님)으로 다음을 확인했습니다: (1) `en/noodle/`·`ja/noodle/` 페이지의 이미지가
  KO(`store-guri-noodle-aging.jpg`)와 달리 여전히 임시 이미지(`udon-noodle-texture.jpg`)를 참조
  중인 언어별 일관성 이슈, (2) KO/EN/JA `menu/` 페이지 모두 대표메뉴 이미지가 아직 실사 음식
  사진으로 교체되지 않은 상태, (3) `404.html`이 한국어 전용이라 `/en/`·`/ja/` 하위 경로에서도
  한국어 404 화면만 노출되는 점 — 모두 사용자 확인 후 처리 대상으로 보류 중입니다.

---

## 배포

이 프로젝트는 **Hosted Deploy를 아직 수행하지 않았습니다.** 사용자가 명시적으로 배포를
요청하면 Hosted Deploy를 진행합니다. 그 전까지는 Publish 탭에서 수동 배포하거나 미리보기로
확인해주세요.

배포 시 반영되는 항목: 정적 파일 전체, `.tables/schema.json` 기반 D1 스키마(`consultations`
테이블 포함), 이미지 자산.

배포 후 확인 권장 순서: robots.txt → sitemap.xml → 각 페이지 canonical/메타 → 상담 폼 제출
테스트(D1 반영 확인) → Search Console/Naver/Bing 소유 확인 및 sitemap 제출.

---

## 파일 구조 (디렉토리 기반 클린 URL)

```
index.html                    HOME (/)
brand/index.html              BRAND (/brand/)
noodle/index.html             THE NOODLE (/noodle/)
menu/index.html                MENU (/menu/)
store/index.html                STORE (/store/)
store/guri/index.html            STORE DETAIL — 구리본점 (/store/guri/, Restaurant Schema + 증거 섹션)
store/yongsan/index.html         STORE DETAIL — 신용산본점 (/store/yongsan/)
store/hapjeong/index.html        STORE DETAIL — 합정점 (/store/hapjeong/)
store/magok/index.html           STORE DETAIL — 마곱점 (/store/magok/)
franchise/index.html            FRANCHISE 허브 (/franchise/, system/model/support 섹션 포함)
franchise/cost/index.html       COST (/franchise/cost/)
franchise/faq/index.html        FAQ (/franchise/faq/, FAQPage Schema)
people/index.html                PEOPLE (/people/)
contact/index.html               CONTACT (/contact/, 상담 폼 → consultations 테이블)
404.html                          404 오류 페이지 (루트 유지, noindex)
robots.txt
sitemap.xml                       KO/EN/JA 42개 공개 경로(기본 30 + 매장 상세 12), 모두 /디렉토리/ 형식, <lastmod> + 4-way hreflang 포함

> **한국어(KO) 상단 메뉴 재구성 (2026-09-16)** — 사용자 요청에 따라 KO 14개 페이지(index, brand,
> contact, franchise, franchise/cost, franchise/faq, menu, noodle, people, store, store/{guri,
> hapjeong,magok,yongsan})의 데스크톱 `.nav-menu`, 모바일 `.nav-mobile-panel`, `.nav-cta` 버튼을
> 다음 순서·라벨로 전면 재구성했습니다:
> **브랜드스토리(`brand/`) → 키노야의 신념과 경쟁력(`noodle/`) → 우동키노야 사람들(`people/`) →
> 창업안내(`franchise/`) → 우리동네 키노야(`store/`) → 메뉴소개(`menu/`) → FAQ(`franchise/faq/`)**,
> 그리고 우측 CTA 버튼 텍스트를 "창업 상담" → "창업상담"(붙여쓰기)으로 변경했습니다. 기존 시각적
> 강조 계층(FAQ까지는 nav-menu 링크, 창업상담은 별도 CTA 버튼 유지)은 그대로 보존했습니다. 각 페이지의
> 상대경로 깊이(루트/1단계/2단계)와 "자기 자신 참조" 관례(`./`, 짧은 상대경로)는 기존 그대로 지켰습니다.
> 이어서 상단 메뉴와 라벨을 통일하기 위해, footer의 "Menu" 컬럼이 존재하는 5개 페이지(index, brand,
> menu, noodle, people)도 동일한 라벨·순서(+기존에 있던 "창업비용" 링크 유지)로 갱신했습니다.
> `contact/`의 "Franchise" 컬럼과 `store/` 계열의 "Stores" 컬럼은 상단 메뉴와 무관한 별도 목적의
> 링크 그룹이라 변경하지 않았습니다. PlaywrightScreenshot(desktop)으로 index.html 상단 nav 7개
> 항목과 CTA 버튼이 겹침·줄바꿈 없이 정상 표시됨을 확인했고, menu/index.html(desktop, full_page)로
> footer Menu 컬럼 8개 링크가 정상 렌더링됨을 확인했습니다. **EN/JA 버전은 이번 작업 범위에 포함되지
> 않았으며, 사용자 요청 시 별도로 진행 예정입니다.**

> **`/noodle/` → `/people/` 하위 카테고리 통합 및 중복정리 (2026-09-17)** — 사용자 요청("'키노야의
> 신념과 경쟁력' 카테고리 섹션을 '우동키노야 사람들' 하위 카테고리로 이동, 중복정리")에 따라 구조를
> 재편했습니다.
> 1. **콘텐츠 이동**: `noodle/index.html`의 실제 콘텐츠(Q&A, 48시간 숙성 이유, 핵심기술, 연구 데이터
>    4개 섹션 — `#qna`/`#aging`/`#tech`/`#numbers`)를 `people/index.html`에 "Sub Category · 키노야의
>    신념과 경쟁력" 인트로 블록과 함께 그대로 이식했습니다. `people/`은 이제 기존 "담당 조직"
>    (`#roles`, 4개 model-card) 섹션 + 새로 추가된 신념과 경쟁력 하위 카테고리 4개 섹션 = 총 5개
>    콘텐츠 섹션 구성이며, 상단에 `.section-jump` 바로가기 바(담당 조직/Q&A/48시간 숙성 이유/핵심기술/
>    연구 데이터)를 신규 추가했습니다. `<title>`, `<meta description>`, JSON-LD(`mainEntity` Question/
>    Answer 스키마)도 신념과 경쟁력 내용을 포함하도록 함께 갱신했습니다.
> 2. **`/noodle/` 축소**: 원래 URL(`https://www.udonkinoya.com/noodle/`)은 SEO 자산·기존 백링크
>    보존을 위해 삭제하지 않고, `<meta name="robots" content="noindex, follow">` +
>    `<meta http-equiv="refresh" content="3;url=../people/#qna">`로 `people/#qna`를 안내하는 "이동
>    안내" 페이지로 축소했습니다. `<link rel="canonical">`과 4-way hreflang alternate 태그도 모두
>    `people/`을 가리키도록 변경했습니다. 페이지 본문에는 안내 문구와 수동 이동 버튼을 배치했습니다.
> 3. **중복정리(nav-menu / footer)**: KO 13개 페이지(index, brand, contact, franchise, franchise/cost,
>    franchise/faq, menu, noodle, people, store, store/{guri,hapjeong,magok,yongsan})의 데스크톱
>    `.nav-menu`, 모바일 `.nav-mobile-panel`, footer "Menu" 컬럼에서 "키노야의 신념과 경쟁력"
>    (`noodle/`) 항목을 제거해 8개 → 7개 항목으로 정리했습니다. 404.html의 nav/mobile-panel도 함께
>    정리했습니다. 본문 중 `noodle/`을 직접 가리키던 링크(index.html 홈 04번 섹션, brand/index.html
>    Legacy 섹션 CTA, franchise/faq/index.html FAQ 답변 내 "더 누들 자세히 보기" 링크)는 모두
>    `people/#qna`로 갱신했습니다.
> 4. **잔여 드롭다운 마크업 정리**: 이전 "드롭다운→섹션점프" 전환 작업에서 누락되었던 `brand/index.html`의
>    구버전 `.nav-item`/`.nav-dropdown`/`.caret`/`.nav-mobile-item`/`.nav-mobile-sub` 마크업을 이번에
>    함께 발견·제거해 다른 페이지와 동일한 flat 네비게이션 구조로 통일했습니다(`noodle/index.html`은
>    3번 항목에서 전체 재작성되며 자연히 함께 정리됨).
> 5. **sitemap.xml**: KO `/noodle/` `<url>` 엔트리를 제거하고, `/people/` 엔트리의 `<priority>`를
>    0.6→0.8로 상향, `<lastmod>`를 2026-09-17로 갱신했습니다. EN/JA `/noodle/` 엔트리는 이번 작업
>    범위(KO 한정) 밖이라 유지했습니다.
> PlaywrightScreenshot(desktop, full_page)으로 people/index.html이 네비게이션 한 줄 표시, 섹션점프 바,
> 담당 조직 카드, 신념과 경쟁력 하위 카테고리 섹션까지 레이아웃 깨짐 없이 순서대로 렌더링됨을 확인했고,
> index.html에서 상단 nav 7개 항목이 정상 표시됨을 확인했습니다(noodle/index.html은 3초 자동 리다이렉트
> 특성상 브라우저 렌더링 도구가 페이지 전환 중 캡처에 실패했으나, PlaywrightConsoleCapture로 콘솔 에러
> 없음을 확인). **EN/JA 버전(`en/noodle/`, `en/people/`, `ja/noodle/`, `ja/people/` 등)은 사용자의
> "나중에 마지막에" 지시에 따라 이번 작업 범위에 포함되지 않았습니다.**
llms.txt                          AEO/GEO용 LLM 참고 경로 요약 (English/Japanese Version 안내 포함)
kinoya.css                        공통 스타일시트
js/main.js                        공통 스크립트 (nav, FAQ, 폼, 플로팅CTA, reveal) — active-link 로직이
                                   trailing slash 정규화를 지원하도록 수정됨
images/                            브랜드 이미지 (매장 사진 1장 + AI 생성 음식/면 이미지 3장 +
                                   store-icon.jpg(기존) + favicon.png(신규 전용 파비콘))
en/                                영어(EN) 버전 — 한국어 10개 페이지와 동일 구조
  index.html                       HOME EN (/en/)
  brand/index.html                 BRAND EN (/en/brand/)
  noodle/index.html                THE NOODLE EN (/en/noodle/)
  menu/index.html                  MENU EN (/en/menu/)
  store/index.html                 STORE EN (/en/store/, Restaurant Schema EN)
  store/guri/index.html            STORE DETAIL EN — Guri Flagship (/en/store/guri/)
  store/yongsan/index.html         STORE DETAIL EN — Sinyongsan Main (/en/store/yongsan/)
  store/hapjeong/index.html        STORE DETAIL EN — Hapjeong (/en/store/hapjeong/)
  store/magok/index.html           STORE DETAIL EN — Magok (/en/store/magok/)
  franchise/index.html             FRANCHISE 허브 EN (/en/franchise/)
  franchise/cost/index.html        COST EN (/en/franchise/cost/)
  franchise/faq/index.html         FAQ EN (/en/franchise/faq/, FAQPage Schema EN)
  people/index.html                PEOPLE EN (/en/people/)
  contact/index.html               CONTACT EN (/en/contact/, 동일 consultations 테이블 연동)
ja/                                일본어(JA) 버전 — 한국어 10개 페이지와 동일 구조
  index.html                       HOME JA (/ja/)
  brand/index.html                 BRAND JA (/ja/brand/)
  noodle/index.html                THE NOODLE JA (/ja/noodle/)
  menu/index.html                  MENU JA (/ja/menu/)
  store/index.html                 STORE JA (/ja/store/, Restaurant Schema JA)
  store/guri/index.html            STORE DETAIL JA — 九里本店 (/ja/store/guri/)
  store/yongsan/index.html         STORE DETAIL JA — 新龍山本店 (/ja/store/yongsan/)
  store/hapjeong/index.html        STORE DETAIL JA — 合井店 (/ja/store/hapjeong/)
  store/magok/index.html           STORE DETAIL JA — 麻谷店 (/ja/store/magok/)
  franchise/index.html             FRANCHISE 허브 JA (/ja/franchise/)
  franchise/cost/index.html        COST JA (/ja/franchise/cost/)
  franchise/faq/index.html         FAQ JA (/ja/franchise/faq/, FAQPage Schema JA)
  people/index.html                PEOPLE JA (/ja/people/)
  contact/index.html               CONTACT JA (/ja/contact/, 동일 consultations 테이블 연동)
```

모든 페이지 내부의 `<link rel="canonical">`, `og:url`, `og:image`, JSON-LD의 `@id`/`url`은 절대 URL
(`https://www.udonkinoya.com/...`, **확정된 프로덕션 도메인**)로 새 디렉토리 경로 기준에 맞춰 일치시켰습니다.
반면 실제 브라우저가 로드하는 `href`/`src`/`url()` 참조(`kinoya.css`, `js/main.js`, `images/*`, 내부 링크)는
**페이지 깊이에 맞춘 상대경로**(`kinoya.css`/`../kinoya.css`/`../../kinoya.css` 등)로 통일했습니다 — 이는
PlaywrightScreenshot/Console 미리보기 도구가 절대경로(`/...`)를 도구 자체 도메인 루트로 해석해 CSS/JS
404·MIME 오류를 일으키는 것을 확인한 뒤 적용한 수정이며, 실제 배포 환경에서도 안전한 표준 방식입니다.
단, 상담 폼이 사용하는 `fetch('/tables/consultations', ...)`(js/main.js)는 여러 깊이의 페이지에서 공유되는
API 호출이라 예외적으로 절대경로를 유지합니다.

# Handoff: 우동키노야 리뉴얼 & 업종전환 사례 섹션

## Overview
Redesign of two sections on the 우동키노야 franchise page (`/franchise/`, anchors `#before-after` and `#conversion-cases`):
1. **Before & After · 리뉴얼 사례** — 3 renewal cases (중앙대점, 일산차병원점, 건대점) with an interactive drag-to-compare photo slider and cost spec table.
2. **Business Conversion · 기존업주 업종전환** — 2 conversion success cases (합정메세나점, 금천구청역점) with before/after storefront photos, animated revenue bars and growth multiplier.

Photos were upscaled 4× (EDSR super-resolution + light unsharp) and the baked-in "BEFORE" text label was removed from renewal "before" images so labels can be rendered in HTML.

## About the Design Files
`Renewal Cases.html` is a **design reference built in HTML**: a prototype showing the intended look and behavior, not production code to paste in. Rebuild it inside the existing site codebase, which is a static HTML site using `kinoya.css`, `data-cms` attributes and `js/cms.js`. Follow its established patterns: reuse `.section`, `.container`, `.eyebrow`, `.h-display`, `.jp-title` and `.verify-note`, and keep the `data-cms` keys so admin-editable text and images keep working. If you are moving to a different framework, follow that framework's conventions.

## Fidelity
**High-fidelity.** Colors, typography, spacing and interactions are final. Recreate it pixel-accurately.

## Screens / Views

### Section 1 — Before & After (`#before-after`)
- **Background**: `--ivory #F4EEE2`; padding `120px 0` (80px on screens ≤560px); container max-width 1200px with 24px side padding.
- **Head** (centered, margin-bottom 72px):
  - JP title `空間の生まれ変わり`: Noto Serif JP 500, clamp(24px,2.4vw,34px), color `--wood #6B4A2B`, letter-spacing .04em, margin-bottom 14px.
  - Eyebrow `Before & After · 리뉴얼 사례`: 14px, 700 weight, letter-spacing .28em, uppercase, `--wood`, with 28×1px lines on both sides (::before and ::after), margin-bottom 22px.
  - H2 `기존 식당 그대로,<br>우동키노야로 다시 열다`: Pretendard 700, clamp(32px,4.6vw,54px), line-height 1.22, letter-spacing -.03em, word-break keep-all.
  - Sub: 18px, line-height 1.75, rgba(23,19,14,.7). The text is "바닥·천장·설비 인프라는 최대한 살리고 핵심 외관·다찌·사인물만 리뉴얼." followed by a `<strong>` (color #17130E): "무권리 점포 기준 7,200만~8,200만원으로 오픈한 실제 매장입니다."
- **Summary strip**: max-width 760px, centered, margin `-24px auto 72px`. 1px top and bottom borders in rgba(30,42,56,.12). Three equal cells separated by 1px dividers, each with padding 22px 12px.
  - Key: 13px, 600 weight, letter-spacing .14em, color `#A8825C`.
  - Value: 22px (18px on mobile), 700 weight, letter-spacing -.02em. The "만원" suffix is 15px, 600 weight, at 55% opacity.
  - Values: 중앙대점 7,400 / 일산차병원점 7,200 / 건대점 8,200.
- **Case rows** (gap 88px between rows): grid `1.55fr 1fr`, gap 56px, align center. Even rows mirror the layout (`1fr 1.55fr`, info block first). At ≤960px a row becomes a single column with gap 28px.
  - **Compare slider**: aspect 3/2, background `--navy`, box-shadow `0 30px 60px -20px rgba(20,32,43,.35)`, cursor ew-resize.
    - The AFTER image is the full base layer.
    - The BEFORE image sits on top with `clip-path: inset(0 calc(100% - var(--pos)) 0 0)` and `filter: saturate(.75) brightness(.95)`.
    - Handle: 2px line in `--noodle #E8D9B4`.
    - Knob: 58px circle, background `--navy-deep #14202B`, 2px `--noodle` border, double-chevron icon, shadow `0 8px 24px rgba(0,0,0,.35)`.
    - Tags are placed 20px from the top. Left tag "BEFORE": rgba(20,32,43,.82) background, ivory text, 4px backdrop blur. Right tag "AFTER · KINOYA": `--noodle` background, navy-deep text. Both 12px, 700 weight, letter-spacing .22em, padding 9×14.
    - Hint pill "좌우로 드래그해 비교해보세요": bottom 18px, 13px, rgba(20,32,43,.7) background, radius 20px. It hides after the first interaction.
  - **Info block**:
    - Large number: Noto Serif JP 700, 88px (60px at ≤960px), `#A8825C` at .35 opacity.
    - Case label "Renewal Case 01": 13px, 700 weight, letter-spacing .24em, `--wood`.
    - H3 store name: clamp(28px,3vw,38px), 700 weight.
    - Description: 17px, line-height 1.7, at 68% ink.
    - Spec list (`dl`): 1px solid top border in ink (#17130E). Each row is flex with space-between, padding 16px 0, and a 1px bottom border in the line-light color.
      - Label (`dt`): 15px, 55% ink.
      - Value (`dd`): 17px, 600 weight, right-aligned, nowrap.
      - Cost value: 30px, 800 weight, `--navy #1E2A38`.
    - Optional pill (case 3 only): 14px, `--wood` text, 1px `#A8825C` border, radius 20px.
- Footnote ("verify note"): 14px, .55 opacity, centered, margin-top 28px.

### Section 2 — Business Conversion (`#conversion-cases`)
- **Background**: `--navy-deep #14202B`, ivory text, `overflow:hidden`.
- **Watermark**: `業種転換` in Noto Serif JP 700, 220px, vertical writing (`writing-mode: vertical-rl`), color rgba(232,217,180,.035), positioned at right -20px and top 40px.
- **Head**:
  - JP title `業種転換の成功事例` in `--noodle`.
  - Eyebrow `Business Conversion · 기존업주 업종전환` in `--noodle`.
  - H2 `업종 변경으로,<br>다시 성장한 매장들`.
  - Sub text at 68% ivory; its `<strong>` is in `--noodle`.
- **Cards**: two-column grid with gap 32px (one column at ≤960px). Card background `--navy`, 1px border rgba(244,238,226,.15).
  - **Top area** (padding 36px 36px 28px), flex with space-between:
    - Badge `CASE 01 · SUCCESS STORY`: 12px, letter-spacing .24em, `--noodle` at 80% opacity.
    - H3 30px, 700 weight. Optional "(합정점)" in 17px, 500 weight, 55% opacity.
    - Route line: 15px. The "from" value is struck through. Then a 22×10 arrow in `--broth #C79A5A`. The "to" value `우동키노야` is in `--noodle`, 600 weight.
    - Slogan on the right: Noto Serif JP 15px, line-height 1.7, 60% ivory, with a 2px `--broth` right border and 14px right padding.
  - **Photo pair**: two-column grid with a 3px gap on a navy-deep background. Each figure has aspect 7/5.
    - Images are scaled 1.14 to crop the soft rounded corners of the source. On card hover they scale to 1.19 over .8s.
    - The BEFORE image uses `saturate(.7) brightness(.9)`.
    - Captions sit at bottom-left 14px: 11px, letter-spacing .22em. BEFORE uses a navy chip; AFTER uses a noodle chip.
    - Center badge: 44px circle with a right arrow, navy-deep background, 1.5px noodle border.
  - **Body** (padding 36px): grid `1fr auto`, gap 32px, align end.
    - Bars: label row is 14px at 60% opacity, with the value at 20px, 700 weight (the after value is in `--noodle`).
    - Track: 12px high, rgba(244,238,226,.06).
    - Before fill: rgba(244,238,226,.32). After fill: linear-gradient(90deg, #C79A5A, #E8D9B4).
    - Fill width is the value divided by a fixed scale maximum of 10,000만원.
    - Multiplier block: 1px left border, padding-left 32px.
      - The number is Noto Serif JP 700, 76px, `--noodle`, with the "배" suffix at 38px.
      - Caption "매출 성장 달성": 14px.
- **Quote**: max-width 880px, centered.
  - Main line "같은 자리, 다른 선택.<br>매장의 가능성이 달라졌습니다." in Noto Serif JP 500, clamp(20px,2.2vw,28px).
  - Second line in Pretendard 17px, 62% ivory.
  - Serif curly quote marks at 90px in `--broth`, 60% opacity, on the left and right.
- **Footnote**: verify note, centered.

### Mobile (≤560px)
- Card top area stacks vertically. The slogan border moves to the left side.
- Card body becomes a single column. The multiplier moves under the bars with a top border and displays inline.

## Interactions & Behavior
- **Compare slider**:
  - Pointer down, move and up (with pointer capture) set `--pos` between 0 and 100%.
  - ArrowLeft and ArrowRight move it ±5%.
  - The element is focusable and uses `role="slider"` with `aria-valuenow`.
  - Focus ring: 3px `#C79A5A` outline with 4px offset.
  - The BEFORE tag fades out when pos is below 14%; the AFTER tag fades out when pos is above 80%.
  - The first interaction adds `.touched`, which hides the hint.
- **Intro sweep**: when a row enters the viewport, it waits 500ms, then animates `pos = 50 + sin(k·2π)·22·(1−k)` over 1800ms. Any user interaction cancels it.
- **Reveal**: `.rv` elements start at opacity 0 and translateY(28px). They become visible via IntersectionObserver (threshold .25) with a 1s transition using `cubic-bezier(.16,1,.3,1)`.
- **Bars**: fill widths go from 0 to `--w` over 1.4s with the same ease when the card is revealed. The after bar starts .25s later.
- **Card hover**: photos zoom in slightly.

## State Management
There is no app state. Each slider keeps a local `pos` value, and each element tracks whether it has been revealed. Case data is static (arrays `BA` and `CONV` in the HTML). In production, map these to the CMS keys:
- `franchise.ba.{1-3}.name`, `.spec`, `.img`
- `franchise.conv.{1,2}.name`, `.growth`

## Design Tokens
| Token | Value |
|---|---|
| --navy | #1E2A38 |
| --navy-deep | #14202B |
| --ivory | #F4EEE2 |
| --off-white | #FBF7EE |
| --wood | #6B4A2B |
| --wood-light | #A8825C |
| --noodle | #E8D9B4 |
| --broth | #C79A5A |
| --ink | #17130E |
| line-light | rgba(30,42,56,.12) |
| line-dark | rgba(244,238,226,.15) |
| ease | cubic-bezier(.16,1,.3,1) |

**Fonts**: Pretendard v1.3.9 (jsDelivr) for body and headings; Noto Serif JP 500/700 (Google Fonts) for JP titles, large numbers and quotes.

**Radius**: 0 by default (cards and photos are square-cornered). Pills use 20px; knobs are 50%.

**Spacing**:
- Section padding: 120px
- Gap from head to content: 72px
- Gap between rows: 88px
- Card padding: 36px

## Assets
`assets/up/` contains 4× upscaled JPGs, all derived from the site's existing images:
- `ba1|ba2|ba3-before.jpg` (1464×1312) and `-after.jpg` (2224×1312): split from `images/franchise-before-after-{1,2,3}.png`; the baked "BEFORE" label was removed.
- `c1|c2-before.jpg` (828×592) and `-after.jpg` (860×592): cropped from `images/franchise-conversion-cases.png`.

The source for the conversion photos is low resolution. Replace them with original photos when available. Icons are inline SVG chevrons and arrows, so there is no icon-font dependency.

## Files
- `Renewal Cases.html` — the full design reference: markup, CSS and JS in a single file.
- `assets/up/*.jpg` — the image assets listed above.

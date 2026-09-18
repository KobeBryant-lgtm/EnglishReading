# Design QA: photographic article covers

## Evidence

- Source visual truth: `C:\Users\LEGION\.codex\visualizations\2026\09\18\01a0b283-37c9-7cf2-9155-a52683cff21e\reference-photographic-covers.png`
- Final implementation screenshot: `C:\Users\LEGION\.codex\visualizations\2026\09\18\01a0b283-37c9-7cf2-9155-a52683cff21e\local-photographic-covers-qa-final.png`
- Full-view comparison, reference on the left and implementation on the right: `C:\Users\LEGION\.codex\visualizations\2026\09\18\01a0b283-37c9-7cf2-9155-a52683cff21e\cover-design-qa-full.jpg`
- Focused card comparison, reference on the left and implementation on the right: `C:\Users\LEGION\.codex\visualizations\2026\09\18\01a0b283-37c9-7cf2-9155-a52683cff21e\cover-design-qa-focused.jpg`
- Source pixels: 2549 x 1391.
- Implementation pixels: 2048 x 1118 at a 2048 x 1118 CSS viewport and device scale factor 1.
- Normalization: source resized to 2048 x 1118 before full-view comparison; focused cards were independently cropped and normalized to 628 x 272.
- State: home page, light theme, article grid visible below the sticky navigation, `scrollY = 480`.
- Browser checks: all 13 desktop images decoded with non-zero natural width; meaningful page content present; no Next.js error overlay; no page errors; only the development React DevTools informational message appeared in the console. At 390 x 844, there was no horizontal overflow and all three in-viewport images decoded successfully.

## Findings

- No actionable P0, P1, or P2 differences remain within the requested cover scope.
- Fonts and typography: serif article headings, compact metadata, source labels, line height, and truncation preserve the reference hierarchy.
- Spacing and layout rhythm: cards retain the reference's horizontal image-and-copy composition, rounded corners, compact row gaps, and approximately 40% image share.
- Colors and visual tokens: neutral white surfaces, restrained borders, muted metadata, and warm difficulty accents align with the source.
- Image quality and asset fidelity: abstract SVG covers were removed. Twelve original local WebP editorial photographs now supply natural lifestyle, wildlife, science, architecture, landscape, community, culture, and transit scenes. Images use crop-safe `object-fit: cover`, blur placeholders, responsive `sizes`, and stable local delivery.
- Copy and content: the implementation uses current live article data rather than the older articles shown in the reference. This is expected and does not affect cover fidelity.

## Comparison History

1. Initial implementation used abstract generated SVG gradients. This was the reported mismatch.
2. First revision restored publisher images over photographic fallbacks, but several publisher assets were poster-like illustrations rather than photography.
3. Second revision used a local photographic pool exclusively, but a hash-based assignment repeated images within the first rows.
4. Final revision expanded the pool to 12 original photographs and assigns each result position a unique cover. Post-fix evidence is the final implementation screenshot and both comparison images listed above.

## Implementation Checklist

- [x] Replace abstract covers with real photographic assets.
- [x] Keep every visible article covered immediately, independent of third-party image hosts.
- [x] Prevent duplicate covers within a 12-article page.
- [x] Preserve responsive cropping and loading performance.
- [x] Verify visual output, image decoding, interactive page content, and browser errors.

## Follow-up Polish

- P3: the raw wide-screen capture is slightly denser than the reference because the source screenshot appears to use a different browser scale. The focused card proportions match, so no layout-wide zoom compensation was added.

final result: passed

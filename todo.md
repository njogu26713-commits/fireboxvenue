# fireboxStudios Update Tasks

- [x] Add a staged typewriter reveal for the three-line hero headline.
- [x] Preserve the existing orange emphasis on “SIGNAL” and the headline layout.
- [x] Respect `prefers-reduced-motion` so the complete headline appears immediately when requested.
- [x] Verify the headline on desktop and mobile breakpoints and save a new checkpoint.

## Completed

- [x] Existing Signal Furnace cyberpunk hero is implemented and tested.

## Solutions and Admin Update

- [x] Upgrade the project architecture for database-backed content management.
- [x] Define service and project content structures and sample firebox tech entries.
- [x] Build the cyberpunk Solutions page with service and project sections.
- [x] Build the open Admin page for adding, editing, and removing entries.
- [x] Add navigation between the hero, Solutions page, and Admin area.
- [x] Verify admin content rendering, public rendering, and responsive layouts.

## Admin Access Change

- [x] Remove authentication checks from the Admin page for the current prototype phase.
- [x] Keep the admin data flow easy to secure later when login is requested.
- [x] Re-test the public Solutions page and open Admin page after the access change.

## Verification Follow-up

- [x] Verify `/solutions` and `/admin` on mobile and tablet breakpoints and fix any responsive issues.
- [x] Exercise Admin add and delete flows in-browser, confirm the public Solutions page reflects the new record, and cover update/delete through tests.
- [x] Add explicit loading and error states so content failures are visible instead of silently relying on fallback content.

## Responsive Navigation Update

- [x] Make the Solutions link a full-size CTA matching Open Channel on desktop.
- [x] Add a collapsible mobile navigation toggle with Solutions and Open Channel actions.
- [x] Verify the header fits and remains usable on phone and desktop breakpoints.

## Solutions Page Simplification

- [x] Remove the Solutions page hero copy and large hero treatment.
- [x] Keep services and projects as the direct page content below the header.
- [x] Verify the simplified page on desktop and phone widths.

## Image-led Services Update

- [x] Add an image reference to service content records and Admin service controls.
- [x] Restyle Services as image-led cards matching Projects.
- [x] Verify service image cards on desktop and phone widths.

## Admin Service Image Controls

- [x] Make the Services Admin image field clearly visible and editable.
- [x] Add a live preview for the selected service image.
- [x] Verify the image control on the Admin page and save a checkpoint.

## Service and Project Links

- [x] Add optional live URL and GitHub URL fields to services and projects.
- [x] Add the URL fields to the Admin create and edit forms.
- [x] Show accessible live and GitHub icons on public service and project cards.
- [x] Verify links open in a new browser tab and remain usable on phone layouts.

## Link Verification Follow-up

- [x] Click the live-site and GitHub icons from a public card to confirm they open correctly in a new tab or window.
- [x] Re-check the Solutions page on a phone viewport after the link-icon update.

## Public Navigation Cleanup

- [x] Remove CONTENT CONTROL from the public Solutions header.
- [x] Keep the direct `/admin` route available for content management.
- [x] Verify the public Solutions header on desktop and phone widths.

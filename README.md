# Renai website – frontend redesign

Static, single-page site. Open `final.html` in a browser (keep the files in this folder together).

Files
- final.html – page (HTML, CSS, JS). Only CSS values, logo placements and an appended style block changed; text, anchors and scripts are unchanged.
- Renai-logo.jpeg – official logo, used as supplied (header, footer).
- renai-mark.png – phoenix from the logo (favicon, chat icons, decorative use).
- BG2.jpeg – wave reference (hero, marquee, closing banner).
- wave-light.svg, wave-tint.svg – section dividers.

Backend: this project contains none. The chat widget script/config in final.html (OceanRAG, Render URLs) is untouched.
Wordmark font for "renai" text: Quicksand (Google Fonts), closest match to the logo lettering.

Section backgrounds (assets/): bg-hero (Blue-waves6, mirrored horizontally in CSS), bg-features (5), bg-how (4), bg-compare (3), bg-developers (2), bg-pricing (Blue-waves.png). Resized to max 1600px JPEG for speed.

Bird mark: Renai-Bird-Logo.png (original, as supplied) -> assets/renai-bird.png (transparent, cropped copy used on the site: favicon, chat/assistant icons, quote section, closing banner, comparison header, footer watermark). The hero's top-right phoenix still uses renai-mark.png; header and footer full logos still use Renai-logo.jpeg.
adb2a5


## Renai-ChatBot-6 changes
1. Index chatbox is white again; only the answer bubble is a stronger blue (styles.css, last block).
2. "Why RenAI" section background = assets/bg-wave.jpg, cover, behind the whole section (`.why-renai`).
3. Moving-text bars 1 and 3 now pause on hover and have a Pause/Resume button, same as the middle bar.
4. Knowledge Studio steps (1 Connect -> 2 Understand -> 3 Answer) auto-advance every 5 s (`AUTO_MS` in final.html). Clicking a tab still works and restarts the 5 s timer.
5. CTA form: send-enquiry.php rewritten (tries port 587 then 465, reports the real reason when `'debug' => true`).
Also cleaned: stray pasted HTML/script inside the hero answer bubble, a stray ``` line, and the broken `G:\Downloads\rag-knowledge.jpg` image path (now assets/rag-knowledge.jpg).

## Running the site (the form needs PHP)
Do NOT double-click final.html or use Live Server - PHP will not run and the form fails with "Failed to fetch".
```
cd Renai-ChatBot-5
php -S localhost:8000
```
Open http://localhost:8000/final.html. PHP errors from the mail form print in that terminal.

## If the form says it could not send
Set `'debug' => true` in mail-config.php, submit once, and read the message:
- "Gmail rejected the login"  -> 2-Step Verification ON, create a NEW Google App Password, paste in `smtp_app_password`.
- "TLS certificate check failed" -> download cacert.pem, set `openssl.cafile` in php.ini (or put its path in `'cafile'`), restart PHP.
- "Could not connect to smtp.gmail.com" -> network/firewall/antivirus blocks ports 587 and 465, or the host blocks SMTP (many free hosts do).
- "openssl extension is turned off" -> enable `extension=openssl` in php.ini.
Set `'debug' => false` before going live. Never publish mail-config.php.

# عمر ومروة — Wedding Invitation (updated version)

A mobile-first Arabic wedding invitation with the original premium ivory-and-gold envelope animation preserved.

## Changes delivered

1. **Opening:** the original envelope, seal, lighting, geometry, and ~6.3-second opening sequence are unchanged. Guests may tap the seal immediately. If they do nothing, the *same* animation starts **3 seconds after the page has fully loaded**. Manual opening cancels the pending auto-open.
2. **First page:** the former couple-illustration page and separate family page have been consolidated into one clean floral invitation page, without people. It shows the basmala, the complete Qur'an 30:21 verse (without its reference line), the four family names, the invitation sentence, and the names عمر and مروة without diacritics, with the supplied parental details. The old "بحضوركم ..." paragraph does not appear.
3. **Second page:** immediately visible ٥ / ديسمبر / ٢٠٢٦ date panels (no scratch-to-reveal interaction), the requested Arabic introduction, including "يوم السبت الموافق:", and a working Google Maps button linking to Le Ciel Hotel. The former time section and its "بعد صلاة المغرب" label have been removed from this page. The times on the programme page remain as supplied.
4. **Final page:** the original programme illustration remains; an additional thank-you message follows the programme, without obscuring any event details.
5. **Maintenance:** the formerly missing `assets/seal.webp` has been restored by cropping the supplied `cover.webp`. Replaced text is now live HTML for accessibility and future editing.

## Venue location — linked

The supplied destination is **Le Ciel Hotel, Nasr City, Cairo, Egypt**. The **"اضغط هنا لفتح رابط الموقع"** button on the date/location page opens the exact user-supplied Google Maps location in a new tab. The site displays **"Le Ciel Hotel – مدينة نصر، القاهرة، مصر"**. Both `config.js` and the HTML link are populated, so the link also works if the JavaScript file fails to load.

To change the venue later, edit `venueName` and `googleMapsUrl` in `config.js`; also update the fallback `#venueName` and `#mapsLink` fields in `index.html`. Confirm that the selected hotel and event hall are correct with the wedding hosts before distribution.

**Family names:** The four complete family names were updated exactly as supplied on 02/11/2026: آل صلاح عبد الله محمد محمد صالح؛ آل احمد سيد احمد احمد؛ آل امين صبري احمد عبدالعال؛ آل الرشيد احمد جلي. Verify spelling with the families before publishing.

## Revision on 02/11/2026 (latest)

- Completed verse 30:21 to «إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ» and removed the printed reference line.
- Removed the tashkeel from عمر and مروة only; the verse retains Qur'anic diacritics.
- Inserted the four full family names exactly as supplied.
- Date is now **Saturday, 5 December 2026** / **السبت الموافق: ٥ ديسمبر ٢٠٢٦**. Updated HTML metadata and accessible labels.
- All envelope behaviour, programme content, and Le Ciel Hotel Google Maps URL remain unchanged.

## Files

- `index.html`: the three displayed invitation pages and the original envelope structure.
- `style.css`: original envelope animation, decorative layers, scroll/transition styles.
- `invitation-updates.css`: new editable Arabic page layouts and thank-you footer.
- `script.js`: envelope interaction, three-second automatic start, scroll observer, and Google Maps button configuration.
- `config.js`: editable venue label and location URL.
- `assets/`: required artwork and cutout masks, including restored `seal.webp`.

The original obsolete couple hero and scratch-date illustrations were removed from the *delivered* build because they are not rendered; they remain available in the user's original reference ZIP.

## Preview locally

```bash
cd Wedding-Invitations-tech
python -m http.server 8000
```

Open `http://localhost:8000` in your browser. The envelope opens automatically three seconds after the page loads. To preview the opening immediately for testing, visit `http://localhost:8000/?preview=open`.

The site is static HTML/CSS/JavaScript and needs no package installation or build command. It can be hosted on GitHub Pages, Cloudflare Pages or any ordinary static host.

## QA carried out

- JavaScript syntax checking.
- Headless Chromium layout checks at 320px, 390px and 620px widths; no page JavaScript errors and no horizontal overflow in interactive content.
- Manual envelope initiation and automatic start after the three-second idle threshold checked in Chromium.
- No scratch canvases present; all 3 stages accounted for.
- Visual screenshots of each section checked at 320px and 390px widths. The thank-you section is after the final programme event.

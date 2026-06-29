# Wedding Invitation Setup

The website works immediately with preview details and demo guests. Follow these
steps to make it yours.

## 1. Change the wedding details

Open `config.js` and replace:

- Couple's names
- Wedding date and RSVP deadline
- Ceremony and reception details
- Google Maps links
- Dress code and love story

The background music is already set to the YouTube link you provided.

## 2. Add prenup photos

Place three photos inside an `assets` folder, then replace each
`placeholder-photo` block in `index.html` with an image:

```html
<figure class="gallery__photo gallery__photo--tall reveal">
  <img src="assets/prenup-1.jpg" alt="The couple during their prenup shoot">
</figure>
```

For the large story photo, replace the `story__image placeholder-photo` element
the same way. Add this to `styles.css` if needed:

```css
.gallery__photo img, .story__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

## 3. Connect Google Sheets

1. Create a Google Sheet.
2. Rename the first tab to `Guests`.
3. Add headers in row 1: `Name` and `Invited Pax`.
4. Add each principal guest in column A and their reserved seats in column B.
5. In the Sheet, open **Extensions → Apps Script**.
6. Copy everything from `google-apps-script/Code.gs` into the editor and save.
7. Select **Deploy → New deployment → Web app**.
8. Set **Execute as** to yourself and **Who has access** to anyone.
9. Deploy, authorize, and copy the Web App URL.
10. Paste the URL into `googleScriptUrl` in `config.js`.

RSVP submissions will be added to an `RSVPs` tab. If a guest responds again,
their existing row is updated instead of creating a duplicate.

## 4. Publish

This is a static website and can be published using GitHub Pages, Netlify,
Cloudflare Pages, or any regular web host. Upload `index.html`, `styles.css`,
`script.js`, `config.js`, and the `assets` folder together.

Note: modern browsers do not allow sound to start without interaction. The
opening screen is intentional—music begins after the guest taps “Open
invitation.”

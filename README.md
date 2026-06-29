# Wedding Website Invitation

Open `index.html` in a browser to view the invitation.

## What to Replace

- Couple names and date: edit `index.html`.
- Ceremony and reception names, times, and map links: edit the `Wedding Details` section in `index.html`.
- Love story: edit the three story cards in `index.html`.
- Prenup photos: replace the image links in the `Prenup Photos` section with your real photo files or URLs.
- Guest list and pax: edit `WEDDING_CONFIG.guests` in `script.js`.
- Google Form link: replace `googleFormUrl` in `script.js`.
- Background music: add an MP3 file named `Palagi` inside the `assets` folder.

## Google Form Prefill

To prefill the guest name and pax count, create your Google Form first, then get the prefilled field IDs.

1. Open your Google Form.
2. Choose `Get pre-filled link`.
3. Type sample answers into the name and pax fields.
4. Copy the generated URL.
5. Look for values like `entry.123456789`.
6. Put those IDs in `script.js`:

```js
googleFormFields: {
  name: "entry.123456789",
  pax: "entry.987654321",
}
```

If those fields are left blank, guests will still be sent to the Google Form, but their answers will not be prefilled.

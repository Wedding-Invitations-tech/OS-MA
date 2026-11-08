# Regal Plum Continuum — balanced side edges

This website preserves the original envelope, the six-second opening sequence and automatic opening after 3 seconds of inactivity.

The three page illustrations have been reworked to make the outer gold architectural borders balanced on both the left and right. The duplicate transparent frame was removed, because it caused extra arches and ghost details during transitions. The scroll experience still cross-fades smoothly among the invitation, date/location, and programme.

The Le Ciel Google Maps hotspot is a clickable HTML anchor aligned with the button shown on the second illustration. Its URL is configured in `config.js`.

## Run locally

```sh
python -m http.server 8000
```

Open `http://localhost:8000` and scroll after opening the envelope.

## Important

The Arabic text is embedded in the source illustration rather than editable HTML. Please proofread all the wording against your approved invitation before sharing widely.

The `previews` directory includes static PNGs (not used by the website itself).

## Latest refinements
- Replaced flat outer margins with softly extended artwork matching the current page. The main artwork stays fully visible with its original proportions.
- Corrected the Google Maps button click area on Page 2 and added a short 3px pressed/sink animation.
- Kept the original Google Maps destination, envelope, three-second auto-opening, scroll timing and source artwork unchanged.

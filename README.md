# Regal Plum Continuum — balanced side edges

This website preserves the original envelope and six-second opening sequence. The first tap/click anywhere on the envelope starts the music and the opening together; the envelope does not auto-open.

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
- Kept the original Google Maps destination, envelope, tap-to-open envelope, scroll timing and source artwork unchanged.

## Edge-to-edge mobile finish
- Full-width mobile scenes with no flat side gutters.
- Scene-specific edge extensions match the original illustration; no change to central art, aspect ratio, Arabic lettering, or envelope.
- The Google Maps hitbox remains aligned with the gold button via the inner-art placement wrapper.


## Automatic scene rotation

Once the original envelope-opening sequence finishes, the invitation advances
automatically: Scene 1 for 12 seconds, Scene 2 for 8 seconds, Scene 3 for
8 seconds, and repeats. Each change is a 1.3-second cross-fade.

Visitors can still scroll or swipe manually. A gesture pauses automatic
rotation; after 12 seconds without interaction, rotation resumes from the
current scene. Rotation pauses when the browser tab is in the background.

The Scene 2 Google Maps click target and pressed-state artwork are aligned
with the current Scene 2 image. The destination URL remains unchanged.

## Discreet swipe cue

The Arabic "اسحب للأعلى" labels were removed from the Scene 1 and Scene 2 illustrations. A small, transparent-background, champagne-gold three-chevron CSS animation (modelled on the supplied reference GIF) appears only during the final 3 seconds of each automatic hold. It is not displayed on Scene 3, during the envelope opening, or while a visitor manually scrolls. Scene timings are 12 / 8 / 8 seconds; cross-fades and envelope opening animation are unchanged.


### Final position alignment
Scenes 1 and 2 use the supplied updated image assets (red annotation marks removed). The three gold swipe chevrons display in the clear area below each final floral divider, and the Scene 2 Google Maps hit area and pressed-face graphic are aligned with the moved button. All timing and transitions remain unchanged.


## Soundtrack — envelope tap starts playback

The entire envelope, including the O&M wax seal and surrounding background, is
clickable/tappable. The first interaction starts the soundtrack and the original
6.3-second envelope opening animation at the same time. There is no music button
and no automatic envelope opening. Keyboard users can activate the wax-seal button
using Enter or Space.

Place an audio file you are authorised to use here:

    assets/music/wedding-soundtrack.mp3

This ZIP does not include a commercial recording. If you have already added the
MP3 to your local copy, copy it into this folder using the exact filename above.
The song plays once, to its natural end, while invitation scenes continue rotating.
The scene cycle remains 12 / 8 / 8 seconds with unchanged 1.3-second transitions.

Note: audio playback is directly invoked by the visitor's tap, which satisfies
normal browser user-activation requirements. Playback still requires a readable
media file and audio output permitted by the visitor's device.

To run: `python -m http.server 8000` in this folder and open
`http://localhost:8000`.

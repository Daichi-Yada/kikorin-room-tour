# Reservation demo

Public URL: https://daichi-yada.github.io/kikorin-room-tour/reservation/

Static, unofficial presentation prototype inspired by APA HOTEL's reservation interface. This folder is published by the existing GitHub Pages setup on `main`.

- Kikorin Room is the first selectable room. The initial value is 「選択してください」 with no room selected; reservation links become available after the visitor chooses a room.
- Every 「予約する」 link opens https://daichi-yada.github.io/kikorin-room-tour/ without submitting guest information.
- Booker, guest and receipt names default to 「住林倫」. Contact and address fields contain fictitious examples.
- Date, guest count, room count and room selection update the example total locally. Single rooms are hidden for two guests per room. If a selected room becomes incompatible, selection resets to the placeholder; no room is automatically chosen.
- No backend, analytics, cookies, local storage, payment integration or official reservation API. CSP blocks forms and network API requests.
- Rates, facilities and plans are illustrative. The page identifies itself as an unofficial demo and asks visitors not to enter real personal information.

## Sources

- Proposal text: local `中間発表.pptx`, notably slides 3, 4, 11 and 12. The deck itself is not included in the deployment.
- Kikorin image: existing project `project/assets/wood-upgrade-20260912/detail/PANO_01_ENTRANCE/f.png`, copied unchanged.
- Reference interface: https://www.apahotel.com/hotel/syutoken/tokyo/kanda-jimbocho-ekihigashi/roomtype/ (reviewed 2026-09-15).
- Single reference photo: https://apreserve.apahotel.com/pic/room/832-1-1.jpg?20251126094804
- Double reference photo: https://apreserve.apahotel.com/pic/room/832-5-2.jpg?20251127124901

## Preview

From the repository root, run `python3 -m http.server 8765 --bind 127.0.0.1`, then open http://127.0.0.1:8765/reservation/.

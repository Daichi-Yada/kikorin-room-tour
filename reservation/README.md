# Reservation demo

Public URL: https://daichi-yada.github.io/kikorin-room-tour/reservation/

Static, unofficial presentation prototype inspired by APA HOTEL's reservation interface. This folder is published by the existing GitHub Pages setup on `main`.

- Four choices are available: Family, Business Premium, Basic, and Standard. Family is listed first. The initial value is 「選択してください」 with no room selected; reservation links become available after the visitor chooses a room.
- Every 「予約する」 link opens `../?room=<selected-id>` without submitting guest information. Both directions preserve the room choice via this query parameter.
- Booker, guest and receipt names default to 「住林倫」. Contact and address fields contain fictitious examples.
- Date, guest count, room count and room selection update the example total locally. Only Family is available for 3–4 guests per room; the other rooms have an illustrative capacity of 2. If a selected room becomes incompatible, selection resets to the placeholder; no room is automatically chosen.
- No backend, analytics, cookies, local storage, payment integration or official reservation API. CSP blocks forms and network API requests.
- Rates, facilities and plans are illustrative. The page identifies itself as an unofficial demo and asks visitors not to enter real personal information.

## Sources

- Proposal text: local `中間発表.pptx`, notably slides 3, 4, 11, 12 and 13. The deck itself is not included in the deployment.
- Kikorin room images: `../assets/rooms/`, generated and revised 2026-09-15; see the root README and image prompt log.
- Reference interface: https://www.apahotel.com/hotel/syutoken/tokyo/kanda-jimbocho-ekihigashi/roomtype/ (reviewed 2026-09-15).
- Single reference photo: https://apreserve.apahotel.com/pic/room/832-1-1.jpg?20251126094804
- Double reference photo: https://apreserve.apahotel.com/pic/room/832-5-2.jpg?20251127124901

## Preview

From the repository root, run `python3 -m http.server 8765 --bind 127.0.0.1`, then open http://127.0.0.1:8765/reservation/.

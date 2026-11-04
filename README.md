# Escape room ACTAM - 2025/2026

test

Escape room musicale nel browser: ogni stanza è un enigma sul suono.

## Structure

Il progetto ha tre parti: le risorse comuni a tutte le stanze (`shared/`), le stanze vere e proprie (`rooms/`) e la documentazione (`docs/`).

```
Escape_room_ACTAM/
├── README.md
├── docs/
│   └── Idee per progetto ACTAM.docx
├── shared/
│   ├── base.css
│   └── doodles.js
└── rooms/
    ├── template/
    │   ├── index.html
    │   ├── style.css
    │   └── main.js
    └── first_room/
        ├── index.html
        ├── style.css
        ├── main.js
        └── audio.js
```

## `shared/`: risorse comuni a tutte le stanze

**`base.css`** contiene lo stile grafico di tutto il gioco, diviso in sezioni:
- **Palette:** colori in variabili CSS (`--paper`, `--ink`, `--wine`, `--gold`, `--ok`, `--bad`…). Per cambiare un colore in tutto il gioco basta modificarlo qui.
- **Base:** reset, font serif e contenitore `main` centrato (larghezza massima 980px).
- **Doodle background:** posizione dello sfondo a disegni.
- **Header (`.banner`):** la fascia nera con il titolo della stanza.
- **Card (`.card`):** i riquadri color crema con l'ombra netta.
- **Intro (`.intro`):** il blocco "Di cosa si tratta / Come uscire".
- **Status message (`.status`):** la riga di feedback sotto l'enigma (`.bad` la colora di rosso).
- **Buttons:** `.key` (tasti in rilievo, `.go` per quello principale) e `.ghost` (pulsante secondario leggero).
- **Win screen (`#win`):** il velo "Porta aperta!" che copre la pagina.
- **Shared animations:** `.shake`, la vibrazione per le risposte sbagliate.

**`doodles.js`** disegna lo sfondo con icone musicali (onde, note, altoparlanti, diapason…). Contiene la libreria di disegni SVG e la inserisce da solo nella pagina. Le icone vengono distribuite a griglia, con rotazioni e dimensioni variate, e ridisegnate quando la finestra cambia dimensione. Per funzionare, la pagina deve contenere `<svg id="doodles">`.

## `rooms/`: le stanze

Ogni stanza è una cartella autonoma con la stessa struttura di base:

| File | Cosa contiene |
|---|---|
| `index.html` | solo il markup; collega `shared/` e i file della stanza |
| `style.css` | solo gli stili specifici di quella stanza |
| `main.js` | la logica di gioco |

Gli script sono caricati con `defer`, quindi partono dopo che la pagina è pronta, in questo ordine: `doodles.js` → (`audio.js`) → `main.js`.

### `template/`: punto di partenza per le stanze nuove
- **`index.html`:** contiene questi blocchi:
  - banner con titolo segnaposto;
  - card intro;
  - card `#puzzle` con l'area vuota `#puzzle-area` e la riga `#status`;
  - schermata di vittoria.
- **`main.js`:** scheletro con sezioni già pronte (Config, State, Helpers, Puzzle, Events, Init). Funzioni disponibili:
  - `setStatus(msg, bad)` mostra un messaggio;
  - `shake(el)` fa vibrare un elemento;
  - `winRoom()` mostra la schermata di vittoria;
  - `buildPuzzle()` è vuota: qui va costruito l'enigma;
  - `window.onRoomComplete` è l'hook per passare alla stanza successiva.
- **`style.css`:** quasi vuoto, solo la sezione Puzzle e una media query da riempire.

### `first_room/`: Il laboratorio delle onde
È l'enigma sui timbri: il giocatore ascolta 3 tracce, riconosce la forma d'onda di ciascuna e inserisce il codice di 3 cifre.
- **`index.html`:**
  - intro;
  - "Libro dei timbri", la tabella delle 4 forme d'onda;
  - "Decifratore di segnali", con le tracce e i pulsanti play;
  - "Serratura", con il display, il tastierino e il contatore dei tentativi;
  - schermata di vittoria.
- **`main.js`:**
  - **Config:** l'array `TYPES` (sinusoidale, triangolare, quadra, dente di sega, ognuna con la sua funzione matematica e una descrizione) e `CODE_LEN = 3`.
  - **Legend:** genera la tabella e disegna in SVG il grafico di ogni onda.
  - **Track generation:** sceglie a caso 3 onde diverse e calcola il codice. Il pulsante "Nuove tracce" rigenera tutto.
  - **Playback:** chiama `window.onPlayTrack` e anima l'equalizzatore per la durata del suono.
  - **Keypad:** il tastierino, che funziona anche da tastiera (tasti 1–4, Backspace, Enter), il controllo del codice e la vibrazione sull'errore.
- **`audio.js`:** contiene solo `window.onPlayTrack({ index, id, type })`, dove `type` è il tipo di oscillatore (`'sine'`, `'triangle'`, `'square'`, `'sawtooth'`). Può restituire la durata del suono in ms (di default 1650). **Per ora non produce suoni:** il suono vero va scritto qui, ad esempio con la Web Audio API. Il file è separato apposta perché chi lavora sull'audio non tocchi la logica di gioco.
- **`style.css`:** stili della tabella, delle tracce, dell'equalizzatore animato e della serratura. Sotto i 760px di larghezza le due colonne diventano una sola e la colonna descrizioni della tabella viene nascosta.

## New room

1. Copia la cartella: `cp -r rooms/template rooms/<nome_stanza>`
2. Sostituisci i testi segnaposto in `index.html` e i `TODO` in `main.js`.
3. Costruisci l'enigma dentro `#puzzle-area` e chiama `winRoom()` quando è risolto.

Gli stili comuni stanno in `shared/base.css`. Se servono a più stanze vanno lì, altrimenti nello `style.css` della stanza.

## Room navigation

Per ora non c'è navigazione tra le stanze. Il pulsante della schermata di vittoria chiama `window.onRoomComplete()`, che oggi mostra solo un `alert`. Quando le stanze saranno pronte, basterà cambiarlo in un redirect, ad esempio:

```js
location.href = '../<stanza_successiva>/index.html';
```

## Run

Non serve nessun server né build: si apre `rooms/<stanza>/index.html` direttamente nel browser.

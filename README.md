# SplitText

SplitText is a state-of-the-art TypeScript library for splitting text content into words, characters, and lines. With support for debounced updates via ResizeObserver and optional MutationObserver, SplitText offers dynamic re-calculation of text groups to help you create stunning text animations and effects with precision.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Overview](#api-overview)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Flexible Splitting:** Split text into words, characters, and/or lines.
- **Dynamic Updates:** Automatically re-group text elements on window resize and content changes.
- **Performance Optimized:** Uses debounced resize and mutation observers to efficiently process dynamic layouts.
- **Customizable:** Configure wrapper elements and CSS classes for words, characters, and lines.
- **Accurate Line Grouping:** Leverages DOM measurements with a configurable pixel threshold to determine line breaks.

## Installation

If you use npm, you can install SplitText using:

```bash
npm install split-text
```

Alternatively, you can include the source code directly in your project if you prefer manual integration.

## Usage

Import and initialize SplitText by passing a target element (or a selector string) and configuration options.

```typescript
import { SplitText } from 'split-text';
import gsap from 'gsap';

const splitInstance = new SplitText('#quote', {
  type: 'words,chars,lines',      // defines the splitting types
  tag: 'span',                    // element tag for wrapper elements
  wordsClass: 'word',             // optional CSS class for words
  charsClass: 'char',             // optional CSS class for characters
  linesClass: 'line',             // optional CSS class for lines
  reduceWhiteSpace: true,         // collapse white spaces
  wordDelimiter: ' ',             // delimiter for splitting words
  lineThreshold: 5,               // pixel threshold for grouping lines
  debounceTime: 100,              // debounce time for resize/mutation events
  observeMutations: true          // attach MutationObserver for dynamic updates
});

// Animate characters using GSAP.
gsap.set('#quote', { perspective: 400 });
gsap.from(splitInstance.chars, {
  duration: 0.8,
  opacity: 0,
  scale: 0,
  y: 80,
  rotationX: 180,
  transformOrigin: '0% 50% -50',
  ease: 'back',
  stagger: 0.01,
});

// Manually update line grouping if necessary.
// splitInstance.updateLines();

// Revert to original content when done.
// splitInstance.revert();
```

## API Overview

### Constructor

`new SplitText(target: HTMLElement | string, options: SplitTextOptions)`

- **target:** A DOM element or a selector string.
- **options:** Configuration object with properties such as:
  - `type` (string): Comma-delimited string specifying which splits to perform (e.g., `"words,chars,lines"`).
  - `tag` (string): HTML tag used for wrappers (default is `"span"`).
  - `wordsClass`, `charsClass`, `linesClass`: Optional CSS classes for styling.
  - `reduceWhiteSpace` (boolean): Collapses white spaces if true (default is `true`).
  - `wordDelimiter` (string): Delimiter to split words (default is a space).
  - `lineThreshold` (number): Pixel threshold for line grouping (default is `5`).
  - `debounceTime` (number): Debounce timeout in milliseconds (default is `100`).
  - `observeMutations` (boolean): If true, watches for dynamic text changes (default is `false`).

### Methods

- **updateLines():**  
  Updates the line grouping by re-calculating positions of cached elements.

- **revert():**  
  Reverts the target element back to its original HTML and disconnects observers.

### Properties

- **target:** The target HTML element.
- **words:** Array of word wrapper elements (if applicable).
- **chars:** Array of character wrapper elements (if applicable).
- **lines:** Array of line wrapper elements (if applicable).

## Examples

### Basic Example

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SplitText Example</title>
  <style>
    .word { margin-right: 4px; }
    .char { display: inline-block; }
    .line { display: block; }
  </style>
</head>
<body>
  <div id="quote">The quick brown fox jumps over the lazy dog.</div>
  <script type="module">
    import { SplitText } from './path-to-splittext.js';
    const splitInstance = new SplitText('#quote', {
      type: 'words,chars,lines',
      wordsClass: 'word',
      charsClass: 'char',
      linesClass: 'line',
      observeMutations: true
    });
  </script>
</body>
</html>
```

### Animation Example with GSAP

```typescript
import { SplitText } from 'split-text';
import gsap from 'gsap';

const splitInstance = new SplitText('#quote', {
  type: 'words,chars,lines',
  wordsClass: 'word',
  charsClass: 'char',
  linesClass: 'line',
  observeMutations: true,
  lineThreshold: 5,
  debounceTime: 100
});

gsap.set('#quote', { perspective: 400 });
gsap.from(splitInstance.chars, {
  duration: 0.8,
  opacity: 0,
  scale: 0,
  y: 80,
  rotationX: 180,
  transformOrigin: '0% 50% -50',
  ease: 'back',
  stagger: 0.01,
});
```

## Contributing

Contributions are welcome! If you find an issue or have a feature suggestion, please open an issue or a pull request. For major changes, please open an issue first to discuss your ideas.

1. Fork the repository.
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

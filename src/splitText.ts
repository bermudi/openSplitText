// Import debounce from lodash. If you don't have lodash, you can implement your own debounce.
import { debounce } from 'lodash';

export interface SplitTextOptions {
  /**
   * A comma-delimited string that specifies which splits to perform.
   * Valid options include: 'chars', 'words', 'lines' (e.g., "words,chars").
   */
  type: string;

  /**
   * The HTML tag to use for wrapper elements. Default is "span".
   */
  tag?: string;

  /**
   * Optional CSS class assigned to each word wrapper.
   */
  wordsClass?: string;

  /**
   * Optional CSS class assigned to each character wrapper.
   */
  charsClass?: string;

  /**
   * Optional CSS class assigned to each line wrapper.
   */
  linesClass?: string;

  /**
   * If true, collapses white spaces. Defaults to true.
   */
  reduceWhiteSpace?: boolean;

  /**
   * Delimiter used to split words. Default is a space.
   */
  wordDelimiter?: string;

  /**
   * A pixel threshold for determining line breaks. Defaults to 5.
   */
  lineThreshold?: number;

  /**
   * Debounce time in milliseconds for update callbacks on Resize/Mutation events. Defaults to 100ms.
   */
  debounceTime?: number;

  /**
   * If true, attaches a MutationObserver to update lines when content changes. Defaults to false.
   */
  observeMutations?: boolean;
}

export interface SplitTextResult {
  /**
   * The target element that was split.
   */
  target: HTMLElement;

  /**
   * Array of word wrapper elements (if applicable).
   */
  words: HTMLElement[];

  /**
   * Array of character wrapper elements (if applicable).
   */
  chars: HTMLElement[];

  /**
   * Array of line wrapper elements (if applicable).
   */
  lines: HTMLElement[];

  /**
   * Reverts the target element back to its original HTML.
   */
  revert: () => void;

  /**
   * Triggers an update of the line grouping.
   */
  updateLines: () => void;
}

/**
 * SplitText
 *
 * A state‐of‐the‐art TypeScript library for splitting text into words, characters,
 * and/or lines. This implementation caches comprehensive DOM measurements, debounces
 * update callbacks via ResizeObserver (and optionally MutationObserver), and offers
 * configurable threshold values.
 *
 * @example
 * import { SplitText } from './SplitText';
 * import gsap from 'gsap';
 *
 * const splitInstance = new SplitText('#quote', { type: 'words,chars,lines', lineThreshold: 5, debounceTime: 100, observeMutations: true });
 * gsap.set('#quote', { perspective: 400 });
 * gsap.from(splitInstance.chars, {
 *   duration: 0.8,
 *   opacity: 0,
 *   scale: 0,
 *   y: 80,
 *   rotationX: 180,
 *   transformOrigin: '0% 50% -50',
 *   ease: 'back',
 *   stagger: 0.01
 * });
 *
 * // Later, if needed:
 * // splitInstance.updateLines();
 * // or
 * // splitInstance.revert();
 *
 * @license MIT
 */
export class SplitText implements SplitTextResult {
  public target: HTMLElement;
  public originalHTML: string;
  public words: HTMLElement[] = [];
  public chars: HTMLElement[] = [];
  public lines: HTMLElement[] = [];

  // Base elements (words or characters) used for grouping into lines.
  private baseElements: HTMLElement[] = [];

  // Options provided by the user.
  private options: SplitTextOptions;

  // Observers for dynamic updates.
  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;

  /**
   * Creates a new SplitText instance.
   * @param target A DOM element or a selector string.
   * @param options Configuration options.
   */
  constructor(target: HTMLElement | string, options: SplitTextOptions) {
    if (typeof target === "string") {
      const el = document.querySelector(target);
      if (!el) {
        throw new Error("Target element not found");
      }
      this.target = el as HTMLElement;
    } else {
      this.target = target;
    }
    this.originalHTML = this.target.innerHTML;
    this.options = options;
    this.split();
  }

  /**
   * Creates a wrapper element around the given text.
   * @param content The text content to wrap.
   * @param className Optional CSS class for the wrapper.
   * @returns A new HTMLElement.
   */
  private createWrapper(content: string, className?: string): HTMLElement {
    const el = document.createElement(this.options.tag || "span");
    if (className) el.className = className;
    el.textContent = content;
    return el;
  }

  /**
   * Splits the target element's text content into words and/or characters,
   * and groups them into lines if requested.
   */
  private split(): void {
    const typeString = this.options.type.toLowerCase();
    const types = typeString.split(",").map((t) => t.trim());

    let splitWords = types.includes("words");
    const splitChars = types.includes("chars");
    const splitLines = types.includes("lines");

    // If no explicit words/chars are provided but line splitting is requested, default to words.
    if (splitLines && !splitWords && !splitChars) {
      splitWords = true;
    }

    const reduceWhiteSpace =
      this.options.reduceWhiteSpace !== undefined ? this.options.reduceWhiteSpace : true;
    const wordDelimiter = this.options.wordDelimiter || " ";

    // Get the plain text and reduce white spaces if enabled.
    let text = this.target.textContent || "";
    if (reduceWhiteSpace) {
      text = text.replace(/\s+/g, " ").trim();
    }
    // Clear the target element.
    this.target.innerHTML = "";

    // Split text into words (and further into characters if requested).
    if (splitWords) {
      const wordsArray = text.split(wordDelimiter);
      wordsArray.forEach((word, index) => {
        const wordEl = document.createElement(this.options.tag || "span");
        if (this.options.wordsClass) {
          wordEl.className = this.options.wordsClass;
        }
        if (splitChars) {
          // Wrap each character in its own element.
          for (const char of word) {
            const charEl = this.createWrapper(char, this.options.charsClass);
            wordEl.appendChild(charEl);
            this.chars.push(charEl);
          }
        } else {
          wordEl.textContent = word;
        }
        this.target.appendChild(wordEl);
        this.words.push(wordEl);
        // Preserve spacing between words.
        if (index < wordsArray.length - 1) {
          this.target.appendChild(document.createTextNode(" "));
        }
      });
    } else if (splitChars) {
      // If the split is only by characters.
      for (const char of text) {
        const charEl = this.createWrapper(char, this.options.charsClass);
        this.target.appendChild(charEl);
        this.chars.push(charEl);
      }
    } else {
      // If no splitting is specified, restore the text.
      this.target.textContent = text;
    }

    // If lines splitting is enabled, store the base elements and group them.
    if (splitLines) {
      this.baseElements = Array.from(this.target.childNodes).filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
      ) as HTMLElement[];

      this.groupLines();

      // Read debounce time from options (default to 100ms)
      const debounceTime = this.options.debounceTime || 100;

      // Attach a debounced ResizeObserver to update line grouping on resize.
      if (window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(
          debounce(() => {
            this.updateLines();
          }, debounceTime)
        );
        this.resizeObserver.observe(this.target);
      }

      // Optionally, attach a MutationObserver to detect dynamic content changes.
      if (this.options.observeMutations && window.MutationObserver) {
        this.mutationObserver = new MutationObserver(
          debounce(() => {
            this.updateLines();
          }, debounceTime)
        );
        this.mutationObserver.observe(this.target, {
          childList: true,
          subtree: true,
          characterData: true,
        });
      }
    }
  }

  /**
   * Groups the base elements into lines based on their cached DOM measurements.
   * It caches measurements such as offsetTop, offsetHeight, and offsetWidth.
   */
  private groupLines(): void {
    // Use the stored baseElements or fallback to current element nodes.
    const elements = this.baseElements.length
      ? this.baseElements.slice()
      : (Array.from(this.target.childNodes).filter(
          (node) => node.nodeType === Node.ELEMENT_NODE
        ) as HTMLElement[]);

    // Cache comprehensive measurements for each element.
    const measurements = elements.map((el) => ({
      el,
      top: el.offsetTop,
      height: el.offsetHeight,
      width: el.offsetWidth,
    }));

    // Use a configurable threshold; defaults to 5 pixels.
    const threshold = this.options.lineThreshold !== undefined ? this.options.lineThreshold : 5;

    // Group elements by comparing their top offsets.
    const groups: { top: number; elements: HTMLElement[] }[] = [];
    measurements.forEach(({ el, top }) => {
      if (groups.length === 0) {
        groups.push({ top, elements: [el] });
      } else {
        const lastGroup = groups[groups.length - 1];
        if (Math.abs(top - lastGroup.top) <= threshold) {
          lastGroup.elements.push(el);
        } else {
          groups.push({ top, elements: [el] });
        }
      }
    });

    // Clear the container and re-build grouped lines.
    this.target.innerHTML = "";
    this.lines = [];
    groups.forEach((group) => {
      const lineWrapper = document.createElement(this.options.tag || "span");
      if (this.options.linesClass) {
        lineWrapper.className = this.options.linesClass;
      }
      group.elements.forEach((el) => lineWrapper.appendChild(el));
      this.target.appendChild(lineWrapper);
      this.lines.push(lineWrapper);
    });
  }

  /**
   * Updates the line grouping by re-inserting the cached base elements and grouping them.
   * This method can be called manually or automatically via observers.
   */
  public updateLines(): void {
    if (!this.baseElements || this.baseElements.length === 0) return;
    // Clear the container.
    this.target.innerHTML = "";
    // Reinsert the cached base elements.
    this.baseElements.forEach((el) => this.target.appendChild(el));
    // Regroup into lines.
    this.groupLines();
  }

  /**
   * Reverts the target element to its original HTML content and disconnects all observers.
   */
  public revert(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    this.target.innerHTML = this.originalHTML;
    this.words = [];
    this.chars = [];
    this.lines = [];
    this.baseElements = [];
  }
}

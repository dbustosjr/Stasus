/** First focusable control: jump past chrome to the page main landmark. */
export function SkipLink() {
  return (
    <a href="#main-content" className="stasus-skip-link">
      Skip to main content
    </a>
  );
}

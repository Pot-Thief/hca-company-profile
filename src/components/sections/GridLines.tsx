// The page showing its own measure. The two lines are the container's real
// edges — where the page's column begins and ends — drawn in the gutter rather
// than on the content edge, so no line ever lands against the first or last
// character of a line of text.
//
// It was three lines: the rail boundary was drawn too, which put two lines in
// the small space beside every section title and made the eye read a bracket
// where there was only a label. One line to the left of a heading says the same
// thing the pair said, quieter.
//
// They align down the whole page because every block is built on the same
// container, and they follow the surface because --color-grid flips with it, so
// they lighten over ink for free. Positioned absolutely rather than drawn as
// borders so they add no width and cannot push the content they are measuring
// off by a pixel.
const LINE = 'absolute inset-y-0 w-px bg-grid';

export function GridLines() {
  return (
    <div data-grid aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="relative mx-auto h-full max-w-page">
        <span data-grid-line className={`${LINE} left-0`} />
        <span data-grid-line className={`${LINE} right-0`} />
      </div>
    </div>
  );
}

// The page showing its own coordinate system. These are the layout's real
// column edges — where content starts, where the rail ends, where content stops
// — not a lattice laid over it, which is the failure the design research names
// outright: a grid that marks nothing becomes wallpaper. So a block without a
// rail draws two lines, not three.
//
// They align down the whole page because every block is built on the same
// container, and they follow the surface because --color-grid flips with it, so
// they lighten over ink for free. Positioned absolutely rather than drawn as
// borders so they add no width and cannot push the content they are measuring
// off by a pixel.
const LINE = 'absolute inset-y-0 w-px bg-grid';

export function GridLines({ rail = false }: { rail?: boolean }) {
  return (
    <div data-grid aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="relative mx-auto h-full max-w-page px-[var(--space-gutter)]">
        <span data-grid-line className={`${LINE} left-[var(--space-gutter)]`} />
        {rail ? (
          <span
            data-grid-line
            className={`${LINE} left-[calc(var(--space-gutter)+8rem)] hidden md:block`}
          />
        ) : null}
        <span data-grid-line className={`${LINE} right-[var(--space-gutter)]`} />
      </div>
    </div>
  );
}

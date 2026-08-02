// Your backend stores category icons as semantic name strings (e.g. "bulb",
// "droplet") rather than emoji or image URLs — this maps those names to
// actual line icons so category cards show a real icon instead of raw text.
// Add more entries here as new categories are added on the backend.

const ICONS: Record<string, JSX.Element> = {
  bulb: (
    <path d='M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.7V16h5.6v-.5c0-.7.3-1.3.8-1.7A6 6 0 0 0 12 3Z' />
  ),
  droplet: <path d='M12 3s6 6.5 6 10.5a6 6 0 1 1-12 0C6 9.5 12 3 12 3Z' />,
  antenna: (
    <path d='M12 21V9m0 0 6-6M12 9 6 3m9 12-3-3-3 3M4 9a8 8 0 0 1 16 0' />
  ),
  wash: (
    <path d='M4 5h16v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Zm2-2h12M12 13a4 4 0 1 0 0 .01M6 7h.01M9 7h.01' />
  ),
  brush: (
    <path d='M9 15 4 20m5-5c3-1 8-6 9-9 .3-1-.5-1.8-1.5-1.5-3 1-8 6-9 9m1.5 1.5A2.1 2.1 0 0 1 9 15Z' />
  ),
  hammer: (
    <path d='m14.5 6.5 3 3L9 18l-4 1 1-4 8.5-8.5Zm3-3 3 3-2 2-3-3 2-2Z' />
  ),
  tools: (
    <path d='M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4L14.7 6.3Z' />
  ),
  engine: <path d='M4 13v-2h3l2-3h4l1 2h4l2 2v3h-2v2H8v-2H4v-2Zm5-5V5h6v3' />,
  snowflake: (
    <path d='M12 2v20M4.9 4.9l14.2 14.2M19.1 4.9 4.9 19.1M8 6l4-2 4 2M8 18l4 2 4-2M6 8l-2 4 2 4M18 8l2 4-2 4' />
  ),
  book: (
    <path d='M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Zm0 0A2.5 2.5 0 0 0 6.5 8H20' />
  ),
  building: (
    <path d='M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M6 21h12M6 21H4m14 0h2M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1' />
  ),
  plant: (
    <path d='M12 21v-8m0 0c0-4-3-6-7-6 0 4 3 6 7 6Zm0 0c0-5 3-7 7-7 0 5-3 7-7 7Z' />
  ),
};

const DEFAULT_ICON = (
  <path d='M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4L14.7 6.3Z' />
);

export function CategoryIcon({
  name,
  size = 24,
}: {
  name: string;
  size?: number;
}) {
  const path = ICONS[name] ?? DEFAULT_ICON;
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      {path}
    </svg>
  );
}

export function AshokaChakraIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
      <circle cx="12" cy="12" r="1.5" />
      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={`spoke-${i}`}
          x1="12"
          y1="12"
          x2="12"
          y2="4"
          transform={`rotate(${i * 15} 12 12)`}
        />
      ))}
    </svg>
  );
}

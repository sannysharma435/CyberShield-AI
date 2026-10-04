function BrandMark({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 96 96"
      fill="none"
      focusable="false"
    >
      <path
        d="M48 10 82 25v23c0 22-14 39-34 50C28 87 14 70 14 48V25L48 10Z"
        fill="#966EFF"
      />
      <path
        d="M48 10 82 25v23c0 22-14 39-34 50V10Z"
        fill="#EEE8FF"
      />
      <path
        d="M48 18 74 29v19c0 17-10 31-26 41-16-10-26-24-26-41V29l26-11Z"
        fill="#17113E"
      />
      <path
        d="M48 30 68 38v12c0 13-7 23-20 31-13-8-20-18-20-31V38l20-8Z"
        fill="#211847"
        stroke="#7650F4"
        strokeWidth="2"
      />
      <path
        d="M48 41c3.2 6.8 5.2 8.8 12 12-6.8 3.2-8.8 5.2-12 12-3.2-6.8-5.2-8.8-12-12 6.8-3.2 8.8-5.2 12-12Z"
        fill="#F4EDFF"
      />
    </svg>
  );
}

export default BrandMark;

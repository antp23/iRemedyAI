const FileUploader = () => {
  return (
    <div className="rounded-xl border-2 border-dashed border-navy/15 bg-navy/[0.02] p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy/5">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 16V4m0 0L8 8m4-4l4 4"
            stroke="#0A1628"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.5}
          />
          <path
            d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2"
            stroke="#0A1628"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.5}
          />
        </svg>
      </div>
      <p className="mt-4 text-sm font-medium text-navy/70">
        Upload Formulary / NDC List
      </p>
      <p className="mt-2 text-xs text-navy/50">
        Batch upload coming in V1.5. Currently analyzing your tracked products.
      </p>
    </div>
  );
};

export default FileUploader;

"use client";

import React from "react";

type SectionTitleProps = {
  title: string;
};

const SectionTitle = ({ title }: SectionTitleProps) => {
  return (
    <div className="w-full rounded-xl  px-6 py-4">
      <div className="flex items-center gap-4">
        {/* Left accent bar */}
        <div className="h-8 w-1.5 rounded-full bg-white/80" />

        {/* Title */}
        <h2 className="text-2xl font-extrabold tracking-tight dark:text-white">
          {title}
        </h2>
      </div>
    </div>
  );
};

export default SectionTitle;
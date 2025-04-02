import React from "react";

type Props = {};

export function Announcement({}: Props) {
  return (
    <div className="flex items-center justify-between rounded bg-secondary-100/80  dark:bg-secondary-900/80 px-4 py-2 text-secondary-foreground dark:text-primary-foreground">
      <span> </span>

      <i className="text-sm font-medium px-8">
        Resume download is currently disabled. Please contact me directly for a
        copy.
      </i>
    </div>
  );
}

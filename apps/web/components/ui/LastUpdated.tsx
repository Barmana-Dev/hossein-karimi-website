"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function LastUpdated() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true, // client
    () => false, // server
  );

  if (!isClient) {
    return (
      <span className="inline-block w-24 h-4 bg-border/30 rounded animate-pulse" />
    );
  }

  return <>{new Date().toLocaleDateString("fa-IR")}</>;
}

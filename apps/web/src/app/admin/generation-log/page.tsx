"use client";

import { GenerationLog } from "@/components/admin/GenerationLog";
import { LogPage } from "@/components/admin/LogPage";
import { listGenerationLog } from "@/lib/firestore";

export default function GenerationLogPage() {
  return (
    <LogPage title="Generation log" loadingText="Loading generation log" fetchPage={listGenerationLog}>
      {(entries, requests) => <GenerationLog entries={entries} requests={requests} />}
    </LogPage>
  );
}

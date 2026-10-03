"use client";

import { CronRunLog } from "@/components/admin/CronRunLog";
import { LogPage } from "@/components/admin/LogPage";
import { listCronRunLog } from "@/lib/firestore";

export default function CronLogPage() {
  return (
    <LogPage title="Cron run log" loadingText="Loading cron run log" fetchPage={listCronRunLog}>
      {(entries, requests) => <CronRunLog entries={entries} requests={requests} />}
    </LogPage>
  );
}

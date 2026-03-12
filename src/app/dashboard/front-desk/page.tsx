import Link from "next/link";
import { getTodaysPasses } from "@/lib/actions/front-desk";
import { requireRole } from "@/lib/auth-utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { FrontDeskActions } from "@/components/front-desk-actions";
import { OfflineCacheManager } from "@/components/offline-cache-manager";
import { OverdueStatCard, OverdueTimer } from "@/components/overdue-timer";

export default async function FrontDeskPage() {
  await requireRole("ADMIN", "FRONT_DESK");
  const passes = await getTodaysPasses();

  const now = new Date();
  const soonThreshold = new Date(now.getTime() + 60 * 60 * 1000);

  const active = passes.filter((p) => p.status === "ACTIVE");
  const out = passes.filter((p) => p.status === "USED");
  const completed = passes.filter((p) => p.status === "COMPLETED");
  const overdue = out.filter((p) => p.scheduledReturn < now);
  const returningSoon = out.filter(
    (p) => p.scheduledReturn >= now && p.scheduledReturn <= soonThreshold
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Front Desk</h1>
          <p className="mt-1 text-sm text-gray-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OfflineCacheManager />
          <Link
            href="/dashboard/front-desk/scan"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-gray-200 transition-colors"
          >
            Scan QR Code
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Scheduled" value={active.length} color="text-white" />
        <StatCard label="Currently Out" value={out.length - returningSoon.length - overdue.length} color="text-blue-400" />
        <StatCard label="Returning Soon" value={returningSoon.length} color="text-yellow-400" />
        <StatCard label="Returned" value={completed.length} color="text-green-400" />
        <OverdueStatCard
          count={overdue.length}
          earliestOverdueSince={
            overdue.length > 0
              ? overdue.reduce((earliest, p) =>
                  p.scheduledReturn < earliest ? p.scheduledReturn : earliest,
                  overdue[0].scheduledReturn
                ).toISOString()
              : null
          }
        />
      </div>

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <div className="animate-overdue-flash rounded-lg border border-red-800 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-red-300">
            ⚠ Overdue Returns ({overdue.length})
          </h2>
          {overdue.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-red-900 bg-red-950/50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{p.residentFullName}</p>
                  <p className="text-xs text-red-400">
                    {p.residentInmateNumber} · {p.employerName} · Due back{" "}
                    {p.scheduledReturn.toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })}{" "}
                    {p.scheduledReturn.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · Overdue by <OverdueTimer since={p.scheduledReturn.toISOString()} />
                  </p>
                </div>
                <FrontDeskActions passId={p.id} passStatus={p.status} />
              </div>
          ))}
        </div>
      )}

      {/* Returning Soon */}
      {returningSoon.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-400">
            Returning Soon ({returningSoon.length})
          </h2>
          <div className="space-y-2">
            {returningSoon.map((p) => (
              <PassRow key={p.id} pass={p} highlight="yellow" />
            ))}
          </div>
        </section>
      )}

      {/* Currently Out */}
      {out.filter((p) => !overdue.includes(p) && !returningSoon.includes(p)).length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-blue-400">
            Currently Out ({out.filter((p) => !overdue.includes(p) && !returningSoon.includes(p)).length})
          </h2>
          <div className="space-y-2">
            {out
              .filter((p) => !overdue.includes(p) && !returningSoon.includes(p))
              .map((p) => (
                <PassRow key={p.id} pass={p} />
              ))}
          </div>
        </section>
      )}

      {/* Scheduled Today */}
      {active.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Scheduled Departures ({active.length})
          </h2>
          <div className="space-y-2">
            {active.map((p) => (
              <PassRow key={p.id} pass={p} />
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Completed ({completed.length})</h2>
          <div className="space-y-2">
            {completed.map((p) => (
              <PassRow key={p.id} pass={p} />
            ))}
          </div>
        </section>
      )}

      {passes.length === 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-950 px-6 py-16 text-center">
          <p className="text-gray-500">No passes scheduled for today.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function PassRow({
  pass,
  highlight,
}: {
  pass: {
    id: string;
    passDisplayId: string;
    residentFullName: string;
    residentInmateNumber: string;
    employerName: string;
    scheduledDeparture: Date;
    scheduledReturn: Date;
    actualDeparture: Date | null;
    actualReturn: Date | null;
    status: string;
  };
  highlight?: "yellow";
}) {
  const borderColor =
    highlight === "yellow"
      ? "border-yellow-600 bg-yellow-950/40"
      : "border-gray-800 bg-gray-950";

  return (
    <div className={`flex items-center justify-between rounded-lg border px-4 py-3 ${borderColor}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-white">{pass.residentFullName}</p>
          <StatusBadge status={pass.status} />
        </div>
        <p className="mt-0.5 text-xs text-gray-400">
          {pass.residentInmateNumber} · {pass.employerName} ·{" "}
          {pass.scheduledDeparture.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })}{" "}
          {pass.scheduledDeparture.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" "}–{" "}
          {pass.scheduledReturn.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })}{" "}
          {pass.scheduledReturn.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {pass.actualDeparture && (
          <p className="text-xs text-gray-500">
            Left:{" "}
            {pass.actualDeparture.toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })}{" "}
            {pass.actualDeparture.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {pass.actualReturn &&
              ` · Returned: ${pass.actualReturn.toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })} ${pass.actualReturn.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`}
          </p>
        )}
      </div>
      <FrontDeskActions passId={pass.id} passStatus={pass.status} />
    </div>
  );
}

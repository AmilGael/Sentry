import { getNotifications, markAllAsRead } from "@/lib/actions/notifications";
import { getSession } from "@/lib/auth-utils";
import { MarkReadButton } from "@/components/mark-read-button";

const TYPE_ICONS: Record<string, string> = {
  NEW_REQUEST: "📋",
  APPROVED: "✅",
  DENIED: "❌",
  REVOKED: "🚫",
  EXPIRING: "⏳",
  SELF_APPROVAL_ALERT: "⚠️",
  OVERDUE: "🔴",
  AWOL: "🚨",
  LATE_RETURN: "🕐",
  INCIDENT: "⚡",
};

export default async function NotificationsPage() {
  await getSession();
  const notifications = await getNotifications();

  const unread = notifications.filter((n) => !n.isRead);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="mt-1 text-sm text-gray-400">
            {unread.length > 0
              ? `${unread.length} unread notification${unread.length !== 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unread.length > 0 && (
          <form action={markAllAsRead}>
            <button
              type="submit"
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              Mark All Read
            </button>
          </form>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="rounded-lg border border-gray-800 bg-gray-950 px-6 py-16 text-center">
            <p className="text-gray-500">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                notif.isRead
                  ? "border-gray-800 bg-gray-950"
                  : "border-gray-700 bg-gray-900"
              }`}
            >
              <span className="mt-0.5 text-lg">
                {TYPE_ICONS[notif.type] ?? "🔔"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${notif.isRead ? "text-gray-400" : "text-white"}`}>
                    {notif.title}
                  </p>
                  <span className="whitespace-nowrap text-xs text-gray-500">
                    {notif.createdAt.toLocaleDateString()} {notif.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className={`mt-0.5 text-sm ${notif.isRead ? "text-gray-500" : "text-gray-300"}`}>
                  {notif.body}
                </p>
              </div>
              {!notif.isRead && <MarkReadButton notificationId={notif.id} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

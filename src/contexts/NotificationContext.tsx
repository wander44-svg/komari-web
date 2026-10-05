import React from "react";

export type OfflineNotification = {
  client: string;
  enable: boolean;
  cooldown: number;
  grace_period: number;
  last_notified: string;
};

interface OfflineNotificationContextType {
  offlineNotification: OfflineNotification[]
  loading?: boolean;
  error?: Error | null;
  refresh: () => Promise<void>;
}

const NotificationContext = React.createContext<OfflineNotificationContextType | undefined>(undefined);

export const OfflineNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [offlineNotification, setOfflineNotification] = React.useState<OfflineNotification[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const firstLoad = React.useRef(true);
  const [error, setError] = React.useState<Error | null>(null);

  const refresh = async () => {
    if (firstLoad.current) setLoading(true);
    try {
      // This endpoint is read immediately after a create/update.  Do not let
      // the browser or an installed PWA return the pre-update empty list.
      const response = await fetch(`/api/admin/notification/offline?_=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch offline notifications");
      }
      const data = await response.json();
      setOfflineNotification(data.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching offline notifications:", error);
      const refreshError = error instanceof Error ? error : new Error(String(error));
      setError(refreshError);
      throw refreshError;
    } finally {
      if (firstLoad.current) {
        setLoading(false);
        firstLoad.current = false;
      }
    }
  };

  React.useEffect(() => {
    void refresh().catch(() => undefined);
  }, []);

  return (
    <NotificationContext.Provider value={{ offlineNotification, refresh, loading, error }}>
      {children}
    </NotificationContext.Provider>
  );
}
export const useOfflineNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useOfflineNotification must be used within a OfflineNotificationProvider");
  }
  return context;
}

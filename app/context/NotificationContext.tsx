"use client";

import {
  createContext,
  useContext,
  useState,
} from "react";

import Notification from "@/app/components/ui/Notification";

type NotificationData = {
  title: string;
  message: string;
  icon?: string;
};

type NotificationContextType = {
  showNotification: (
    notification: NotificationData
  ) => void;
};

const NotificationContext =
  createContext<NotificationContextType | null>(
    null
  );

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notification, setNotification] =
    useState<NotificationData | null>(null);

  function showNotification(
    notification: NotificationData
  ) {
    console.log("NOTIFICATION:", notification);

    setNotification(notification);

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  }

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
      }}
    >
      {children}

      <Notification
        show={!!notification}
        title={notification?.title ?? ""}
        message={notification?.message ?? ""}
        icon={notification?.icon}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context =
    useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification must be used inside NotificationProvider."
    );
  }

  return context;
}
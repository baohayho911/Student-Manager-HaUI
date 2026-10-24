"use client";
import { useEffect, useState, useCallback } from "react";
import { api, message } from "@/lib/api";
export function useData<T>(path: string) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    api<T>(path)
      .then((d) => {
        if (active) {
          setData(d);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(message(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, revision]);
  const refresh = useCallback(() => {
    setLoading(true);
    setRevision((v) => v + 1);
  }, []);
  return { data, error, loading, refresh };
}

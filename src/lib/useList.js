"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, qs } from "@/lib/api";

export function useList(path, params, enabled = true) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reqId = useRef(0);
  const key = path + qs(params);

  const load = useCallback(() => {
    if (!enabled) return;
    const id = ++reqId.current;
    setLoading(true);
    setError("");
    api
      .get(key)
      .then((r) => {
        if (id === reqId.current) {
          setData(r.data);
          setPagination(r.pagination);
        }
      })
      .catch((e) => {
        if (id === reqId.current) setError(e.message);
      })
      .finally(() => {
        if (id === reqId.current) setLoading(false);
      });
  }, [key, enabled]);

  useEffect(load, [load]);
  return { data, pagination, loading, error, reload: load };
}

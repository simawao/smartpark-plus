"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MODULE_KEYS, ModuleKey, OPERATION_SEEDS, OperationRow, isActive } from "../data/operations";
import { recordsApi } from "../services/api";

type State = Record<ModuleKey, OperationRow[]>;
type OperationsContextValue = {
  data: State;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  createRow: (module: ModuleKey, record: Omit<OperationRow, "id">) => Promise<OperationRow>;
  updateRow: (module: ModuleKey, id: number, record: Omit<OperationRow, "id">) => Promise<OperationRow>;
  removeRow: (module: ModuleKey, id: number) => Promise<void>;
};

const emptyState = Object.fromEntries(MODULE_KEYS.map(key => [key, []])) as unknown as State;
const OperationsContext = createContext<OperationsContextValue | null>(null);

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<State>(emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const syncStaff = useCallback(async (tasks: OperationRow[], current: State) => {
    const updates = current.staff.map(async staff => {
      const activeTasks = tasks.filter(task => task.assignee === staff.name && isActive(task)).length;
      const protectedStatus = ["İzinli", "Pasif"].includes(String(staff.status));
      const status = protectedStatus ? String(staff.status) : activeTasks > 0 ? "Sahada" : "Müsait";
      if (Number(staff.activeTasks) === activeTasks && staff.status === status) return staff;
      return recordsApi.update<OperationRow>("staff", staff.id, { ...staff, activeTasks, status });
    });
    const staff = await Promise.all(updates);
    return { ...current, staff, tasks };
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const entries = await Promise.all(MODULE_KEYS.map(async key => {
        let rows = await recordsApi.list<OperationRow>(key);
        if (rows.length === 0 && OPERATION_SEEDS[key].length) {
          rows = await recordsApi.bootstrap<OperationRow>(key, OPERATION_SEEDS[key]);
        } else if (OPERATION_SEEDS[key].length) {
          const identity = (row: OperationRow) => String(row.name ?? row.title ?? "");
          const migrated = await Promise.all(OPERATION_SEEDS[key].map(async seed => {
            const current = rows.find(row => identity(row) === identity(seed));
            if (!current) return recordsApi.create<OperationRow>(key, seed);
            const defaults = Object.fromEntries(Object.entries(seed).filter(([field, value]) => field !== "id" && (current[field] === undefined || current[field] === "" || (field === "criticalReason" && Boolean(value) && current[field] !== value))));
            if (key === "staff" && current.status === "Görevde") defaults.status = "Sahada";
            if (key === "tasks" && current.status === "Gecikti") defaults.status = "Devam Ediyor";
            for (const dateField of ["start", "due", "completedAt", "date", "startAt", "endAt"]) {
              if (typeof current[dateField] === "string" && String(current[dateField]).includes(".") && seed[dateField]) defaults[dateField] = seed[dateField];
            }
            if (seed.priority === "Kritik" || Number(seed.score ?? 0) >= 80) {
              defaults.priority = seed.priority ?? current.priority;
              defaults.score = seed.score ?? current.score;
              defaults.criticalReason = seed.criticalReason;
            }
            if (seed.archived === true) {
              defaults.archived = true;
              defaults.status = seed.status;
              defaults.completedAt = seed.completedAt ?? current.completedAt;
            }
            if (!Object.keys(defaults).length) return current;
            return recordsApi.update<OperationRow>(key, current.id, { ...current, ...defaults });
          }));
          const seededNames = new Set(migrated.map(identity));
          rows = [...migrated, ...rows.filter(row => !seededNames.has(identity(row)))];
        }
        return [key, rows] as const;
      }));
      const loaded = Object.fromEntries(entries) as State;
      setData(await syncStaff(loaded.tasks, loaded));
      setError("");
    } catch (exception) {
      setData(Object.fromEntries(MODULE_KEYS.map(key => [key, OPERATION_SEEDS[key]])) as State);
      setError(exception instanceof Error ? exception.message : "API bağlantısı kurulamadı.");
    } finally {
      setLoading(false);
    }
  }, [syncStaff]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const createRow = useCallback(async (module: ModuleKey, record: Omit<OperationRow, "id">) => {
    const created = await recordsApi.create<OperationRow>(module, record);
    const next = { ...data, [module]: [...data[module], created] };
    setData(next);
    if (module === "tasks") {
      const synced = await syncStaff(next.tasks, next);
      setData(synced);
    }
    return created;
  }, [data, syncStaff]);

  const updateRow = useCallback(async (module: ModuleKey, id: number, record: Omit<OperationRow, "id">) => {
    const updated = await recordsApi.update<OperationRow>(module, id, record);
    const next = { ...data, [module]: data[module].map(row => row.id === id ? updated : row) };
    setData(next);
    if (module === "tasks") {
      const synced = await syncStaff(next.tasks, next);
      setData(synced);
    }
    return updated;
  }, [data, syncStaff]);

  const removeRow = useCallback(async (module: ModuleKey, id: number) => {
    await recordsApi.remove(module, id);
    const next = { ...data, [module]: data[module].filter(row => row.id !== id) };
    setData(next);
    if (module === "tasks") {
      const synced = await syncStaff(next.tasks, next);
      setData(synced);
    }
  }, [data, syncStaff]);

  const value = useMemo(() => ({ data, loading, error, refresh, createRow, updateRow, removeRow }), [data, loading, error, refresh, createRow, updateRow, removeRow]);
  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}

export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) throw new Error("useOperations, OperationsProvider içinde kullanılmalıdır.");
  return context;
}

import { writable } from "svelte/store";

export type ToastVariant = "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  message: string;
  title: string;
  variant: ToastVariant;
  duration: number;
}

export interface ToastOptions {
  variant?: ToastVariant;
  duration?: number;
  title?: string;
}

const _store = writable<ToastItem[]>([]);

let _idCounter = 0;

function push(message: string, options?: ToastOptions): string {
  const id = `toast-${++_idCounter}`;
  const item: ToastItem = {
    id,
    message,
    title: options?.title ?? '',
    variant: options?.variant ?? "success",
    duration: options?.duration ?? 5000,
  };
  _store.update((items) => [...items, item]);
  return id;
}

function dismiss(id: string): void {
  _store.update((items) => items.filter((t) => t.id !== id));
}

export const toast = {
  subscribe: _store.subscribe,
  push,
  dismiss,
};

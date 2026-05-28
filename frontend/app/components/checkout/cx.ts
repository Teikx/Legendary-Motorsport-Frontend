"use client";

type ClassValue = string | false | null | undefined;

export const cx = (...classes: ClassValue[]) => classes.filter(Boolean).join(" ");

export const sortCx = <T extends Record<string, Record<string, string>>>(
  classes: T,
) => classes;

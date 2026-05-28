"use client";
import React from "react";

export const MastercardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="36"
    height="22"
    viewBox="0 0 36 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="11" cy="11" r="11" fill="#EB001B" />
    <circle cx="25" cy="11" r="11" fill="#F79E1B" fillOpacity="0.9" />
  </svg>
);

export const MastercardIconWhite = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="36"
    height="22"
    viewBox="0 0 36 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="11" cy="11" r="11" fill="#FFFFFF" fillOpacity="0.5" />
    <circle cx="25" cy="11" r="11" fill="#FFFFFF" fillOpacity="0.8" />
  </svg>
);

export const PaypassIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Símbolo de pago sin contacto (Contactless / Paypass) */}
    <path d="M8.5 8.5c1.33 1.92 1.33 4.08 0 6" />
    <path d="M12 5.5c2.67 3.83 2.67 8.17 0 12" />
    <path d="M15.5 2.5c4 5.75 4 12.25 0 18" />
  </svg>
);
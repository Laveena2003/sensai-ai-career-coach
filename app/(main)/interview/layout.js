"use client";

import React, { Suspense } from "react";
import { BarLoader } from "react-spinners";
import { Toaster } from "sonner";

const Layout = ({ children }) => {
  return (
    <div className="px-5">
      <Suspense
        fallback={<BarLoader className="mt-4" width="100%" color="gray" />}
      >
        {children}
      </Suspense>

      {/* Toast notifications provider */}
      <Toaster richColors position="top-right" />
    </div>
  );
};

export default Layout;

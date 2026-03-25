"use client";
import MainLayout from "@/components/layout/app-layout/main-layout";
// import TestPanel from "@/components/common/test-panel"; //(only dev)
import React, { memo } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MainLayout>
      {/* <TestPanel /> */}
      {children}
    </MainLayout>
  );
};

export default memo(Layout);

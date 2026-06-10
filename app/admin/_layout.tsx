import { Slot } from 'expo-router';
import React from 'react';
import { AdminShell } from '@/src/components/admin/AdminShell';

export default function AdminLayout() {
  return (
    <AdminShell>
      <Slot />
    </AdminShell>
  );
}

'use client';

import { ShoppingBag } from 'lucide-react';

export default function ShopPage() {
  return (
    <div className="p-4 space-y-6 pb-24 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-4">
        <ShoppingBag size={40} />
      </div>
      <h1 className="text-2xl font-bold">Shop</h1>
      <p className="text-muted-foreground text-center max-w-xs">
        Merchandise and digital goods coming soon.
      </p>
      
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-xs w-full">
        <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center">
          <strong>Note:</strong> A $0.20 platform sign-in fee will be required for shop access in Phase 4.
        </p>
      </div>
    </div>
  );
}

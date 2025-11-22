'use client';

import { usePDF } from 'react-to-pdf';
import { Button } from "@/components/ui/button"; // or your preferred button

export function TransactionTableWithPdf({ transactions }) {
  const { toPDF, targetRef } = usePDF({ filename: 'transactions.pdf' });

  return (
    <div className="space-y-4">
      <Button onClick={() => toPDF()}>Download as PDF</Button>

      <div ref={targetRef} className="border p-4 rounded-md bg-white">
        <table className="w-full text-left border-collapse mt-4">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Category</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id} className="border-b">
                <td className="py-2 px-4">{new Date(txn.date).toLocaleDateString()}</td>
                <td className="py-2 px-4">{txn.type}</td>
                <td className="py-2 px-4">Kes ${txn.amount.toFixed(2)}</td>
                <td className="py-2 px-4">{txn.category}</td>
                <td className="py-2 px-4">{txn.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

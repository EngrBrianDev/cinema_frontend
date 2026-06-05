"use client";

import { useMemo, useState } from "react";
import { buyers } from "@/lib/mock-data/cinema-data";

export function BuyersTable() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return buyers.filter((buyer) => `${buyer.name} ${buyer.email}`.toLowerCase().includes(term));
  }, [search]);

  return (
    <div className="rounded border-2 border-black bg-white">
      <div className="flex flex-col gap-3 border-b-2 border-black p-4 md:flex-row md:items-center md:justify-between">
        <h3 className="font-headline text-2xl font-bold uppercase">Recent Ticket Buyers</h3>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded border-2 border-black p-2"
          placeholder="Search by name or email"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-surface-variant text-left font-label text-xs uppercase">
              <th className="p-3">Buyer Name</th>
              <th className="p-3">Email Address</th>
              <th className="p-3">Seats</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((buyer) => (
              <tr key={buyer.email} className="border-t border-outline-variant">
                <td className="p-3 font-body-md">{buyer.name}</td>
                <td className="p-3">{buyer.email}</td>
                <td className="p-3">{buyer.seatLabel}</td>
                <td className="p-3 font-label text-xs uppercase">{buyer.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

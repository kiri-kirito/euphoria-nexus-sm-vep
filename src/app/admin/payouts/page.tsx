export default function AdminPayoutsPage() {
  const payouts = [
    { id: 'PAY-1001', seller: 'Tech Store Plus', amount: 4500.00, method: 'Bank Transfer', requestedAt: '2023-11-01', status: 'Pending' },
    { id: 'PAY-1002', seller: 'Fashion Boutique', amount: 1250.50, method: 'bKash', requestedAt: '2023-11-02', status: 'Pending' },
    { id: 'PAY-1003', seller: 'Gadget Hub', amount: 8900.00, method: 'Bank Transfer', requestedAt: '2023-11-03', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Pending Payouts</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="px-6 py-4 font-medium">Payout ID</th>
              <th className="px-6 py-4 font-medium">Seller</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Method</th>
              <th className="px-6 py-4 font-medium">Requested</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {payouts.map((payout) => (
              <tr key={payout.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-500">{payout.id}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{payout.seller}</td>
                <td className="px-6 py-4 font-bold text-slate-800">${payout.amount.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    payout.method === 'bKash' ? 'bg-pink-100 text-pink-700' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {payout.method}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{payout.requestedAt}</td>
                <td className="px-6 py-4 text-right">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded shadow-sm transition-colors">
                    Process Payout
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payouts.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No pending payouts to process.
          </div>
        )}
      </div>
    </div>
  );
}

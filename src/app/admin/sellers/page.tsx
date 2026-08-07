export default function AdminSellersPage() {
  const applications = [
    { id: 1, name: 'Tech Store Plus', applicant: 'Evan Wright', email: 'evan@techstore.com', date: '2023-10-25', status: 'Pending' },
    { id: 2, name: 'Fashion Boutique', applicant: 'Fiona Gallagher', email: 'fiona@fboutique.com', date: '2023-10-26', status: 'Pending' },
    { id: 3, name: 'Home Essentials', applicant: 'George Miller', email: 'george@homeess.com', date: '2023-10-27', status: 'Pending' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Seller Applications</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="px-6 py-4 font-medium">Store Name</th>
              <th className="px-6 py-4 font-medium">Applicant</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Applied Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-800">{app.name}</td>
                <td className="px-6 py-4 text-slate-600">{app.applicant}</td>
                <td className="px-6 py-4 text-slate-600">{app.email}</td>
                <td className="px-6 py-4 text-slate-600">{app.date}</td>
                <td className="px-6 py-4">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    {app.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button className="bg-green-500 hover:bg-green-600 text-white font-medium px-3 py-1.5 rounded shadow-sm transition-colors">
                    Approve
                  </button>
                  <button className="bg-red-500 hover:bg-red-600 text-white font-medium px-3 py-1.5 rounded shadow-sm transition-colors">
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No pending seller applications at this time.
          </div>
        )}
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function SupportDashboard() {
  const tickets = [
    { id: '1', user: 'Alice Smith', issue: 'Missing item in order', status: 'Open', priority: 'High' },
    { id: '2', user: 'Bob Jones', issue: 'Late delivery', status: 'In Progress', priority: 'Medium' },
    { id: '3', user: 'Charlie Brown', issue: 'Defective product', status: 'Open', priority: 'Critical' },
  ];

  return (
    <div className="p-8 h-full overflow-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Support Dashboard</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ticket ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Issue</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{ticket.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{ticket.user}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{ticket.issue}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    ticket.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    ticket.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                    ticket.priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/support/tickets/${ticket.id}`} className="text-teal-600 hover:text-teal-900 font-medium bg-teal-50 px-3 py-1.5 rounded-md hover:bg-teal-100 transition-colors">
                    Open Ticket
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

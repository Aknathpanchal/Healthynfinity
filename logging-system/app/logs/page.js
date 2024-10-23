"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

const Logs = () => {
    const router = useRouter(); // Initialize useRouter
    const [logs, setLogs] = useState([]);
    const [filters, setFilters] = useState({ actionType: '', startDate: '', endDate: '', page: 1 });
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login'); // Redirect to login if token is not found
            return;
        }

        const fetchLogs = async () => {
            try {
                const query = new URLSearchParams({
                    actionType: filters.actionType,
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    page: filters.page,
                }).toString();
                
                const res = await fetch(`/api/logs?${query}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || 'Failed to fetch logs');
                }

                const data = await res.json();
                setLogs(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchLogs();
    }, [filters, router]); // Add router to dependencies

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/logs`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to delete log');
            }

            setLogs(logs.filter(log => log._id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleExport = async (format) => {
        const token = localStorage.getItem('token');
        const query = new URLSearchParams({
            actionType: filters.actionType,
            startDate: filters.startDate,
            endDate: filters.endDate,
            page: filters.page,
        }).toString();
        const response = await fetch(`/api/logs?format=${format}&${query}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `logs.${format === 'csv' ? 'csv' : 'json'}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            console.error('Export failed:', response.statusText);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove token from localStorage
        router.push('/login'); // Redirect to login page
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Logs</h1>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="mb-4 flex items-center">
                <input
                    type="text"
                    placeholder="Filter by Action Type"
                    value={filters.actionType}
                    onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
                    className="border border-gray-300 rounded-lg p-2 mr-2"
                />
                <input
                    type="date"
                    placeholder="Start Date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="border border-gray-300 rounded-lg p-2 mr-2"
                />
                <input
                    type="date"
                    placeholder="End Date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="border border-gray-300 rounded-lg p-2 mr-2"
                />
                <button
                    onClick={() => setFilters({ ...filters, page: 1 })}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                    Filter
                </button>

                <button onClick={() => handleExport('json')} className="bg-green-500 text-white px-4 py-2 rounded-lg ml-2">Export to JSON</button>
                <button onClick={() => handleExport('csv')} className="bg-green-500 text-white px-4 py-2 rounded-lg ml-2">Export to CSV</button>
                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg ml-2">Logout</button> {/* Logout button */}
            </div>
            <table className="min-w-full bg-white border border-gray-300 table-auto">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Action Type</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Timestamp</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">User ID</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Role</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.length > 0 ? (
                        logs.map((log) => (
                            <tr key={log._id} className="border-t border-gray-200">
                                <td className="px-4 py-2">{log.actionType}</td>
                                <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-4 py-2">{log.userId}</td>
                                <td className="px-4 py-2">{log.role}</td>
                                <td className="px-4 py-2">
                                    <button onClick={() => handleDelete(log._id)} className="text-red-500">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-4 py-2 text-center text-gray-500">
                                No logs available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="mt-4">
                <button
                    onClick={() => setFilters({ ...filters, page: Math.max(filters.page - 1, 1) })}
                    disabled={filters.page <= 1}
                    className="px-4 py-2 bg-gray-200 rounded-lg mr-2"
                >
                    Previous
                </button>
                <span> Page {filters.page} </span>
                <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    className="px-4 py-2 bg-gray-200 rounded-lg ml-2"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Logs;


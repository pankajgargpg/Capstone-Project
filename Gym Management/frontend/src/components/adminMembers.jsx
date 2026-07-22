
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminMembers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [nName, setNName] = useState('');
  const [nEmail, setNEmail] = useState('');
  const [nPass, setNPass] = useState('');
  const [nRole, setNRole] = useState('member');

  // Fetch all users on mount
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('${import.meta.env.VITE_API_URL}/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const members = users.filter(u => u.role === 'member');
  const trainers = users.filter(u => u.role === 'trainer');

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Using the auth/register route. Note: The backend should ideally allow admin to bypass password requirements or send an invite link.
      await axios.post('${import.meta.env.VITE_API_URL}/api/auth/register', {
        name: nName,
        email: nEmail,
        password: nPass,
        role: nRole
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNName(''); setNEmail(''); setNPass('');
      fetchUsers(); // Refresh the list
      alert("User added successfully!");
    } catch (error) {
      alert("Failed to add user: " + (error.response?.data?.message || error.message));
    }
  };

  const assignTrainer = async (memberId, trainerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${memberId}/assign-trainer`, {
        trainerId: trainerId || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchUsers(); // Refresh to see the new trainer assigned
    } catch (error) {
      alert("Failed to assign trainer");
      console.error(error);
    }
  };

  const renewMembership = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${memberId}/renew`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchUsers(); // Refresh to see the new expiry date
    } catch (error) {
      alert("Failed to renew membership");
      console.error(error);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading members...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Manage Members</h2>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Member List Table */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 text-gray-500 text-sm uppercase">
                  <th className="p-3">Name</th>
                  <th className="p-3">Expiry</th>
                  <th className="p-3">Trainer</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 && (
                   <tr><td colSpan="4" className="p-4 text-center text-gray-500">No members found in database.</td></tr>
                )}
                {members.map(m => {
                  const isExpired = !m.membershipExpiry || new Date(m.membershipExpiry) < new Date();
                  return (
                    <tr key={m._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-800">{m.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {m.membershipExpiry ? new Date(m.membershipExpiry).toLocaleDateString() : 'Pending'}
                        </span>
                      </td>
                      <td className="p-3">
                        <select 
                          className="p-1 border rounded bg-white text-sm"
                          value={m.assignedTrainer || ''}
                          onChange={(e) => assignTrainer(m._id, e.target.value)}
                        >
                          <option value="">None</option>
                          {trainers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                      </td>
                      <td className="p-3">
                         <button 
                            onClick={() => renewMembership(m._id)}
                            className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded hover:bg-blue-200 transition"
                          >
                            Renew (30d)
                          </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <h3 className="text-xl font-bold mb-4">Add New User</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <input type="text" placeholder="Name" required value={nName} onChange={e=>setNName(e.target.value)} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="email" placeholder="Email" required value={nEmail} onChange={e=>setNEmail(e.target.value)} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="password" placeholder="Password" required value={nPass} onChange={e=>setNPass(e.target.value)} className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={nRole} onChange={e=>setNRole(e.target.value)} className="w-full p-2 border rounded bg-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="member">Member</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="w-full py-2 bg-gray-900 text-white rounded font-bold hover:bg-gray-800 transition">Create</button>
          </form>
        </div>

      </div>
    </div>)};
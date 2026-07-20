import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Icons
const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconUser = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;

export default function AdminHome() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading overview...</div>;

  const membersCount = users.filter(u => u.role === 'member').length;
  const trainersCount = users.filter(u => u.role === 'trainer').length;
  
  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
           <div>
             <p className="text-gray-500 text-sm font-medium">Total Members</p>
             <p className="text-3xl font-bold text-blue-600">{membersCount}</p>
           </div>
           <div className="p-4 bg-blue-50 rounded-full text-blue-500"><IconUsers/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
           <div>
             <p className="text-gray-500 text-sm font-medium">Active Trainers</p>
             <p className="text-3xl font-bold text-green-600">{trainersCount}</p>
           </div>
           <div className="p-4 bg-green-50 rounded-full text-green-500"><IconUser/></div>
        </div>
      </div>
    </div>
  )};
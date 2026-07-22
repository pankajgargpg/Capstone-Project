import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- MOCK DATABASE (For fallback) ---
const initDB = () => {
  if (!localStorage.getItem('gymDB')) {
    localStorage.setItem('gymDB', JSON.stringify({
      settings: { standardFee: 1500, trainerFee: 3000 },
      users: [],
      attendance: []
    }));
  }
  return JSON.parse(localStorage.getItem('gymDB'));
};

const saveDB = (data) => localStorage.setItem('gymDB', JSON.stringify(data));

// --- ICONS ---
const IconUser = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>;
const IconSettings = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const IconCheck = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const IconHome = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const IconUsers = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const IconCalendar = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconCard = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [db, setDb] = useState(initDB());
  const [isLoginView, setIsLoginView] = useState(true);
  const [currentView, setCurrentView] = useState('home');

  const updateDB = (newDb) => {
    setDb(newDb);
    saveDB(newDb);
  };

  // YEH FUNCTION TAB SWITCH PAR USER KO UPDATED RAKHEGA
  const updateCurrentUser = (updatedData) => {
    setUser(prevUser => ({ ...prevUser, ...updatedData }));
  };

  if (!user) {
    return isLoginView ? (
      <LoginScreen onLogin={setUser} onSwitchToSignup={() => setIsLoginView(false)} />
    ) : (
      <SignupScreen onLogin={setUser} onSwitchToLogin={() => setIsLoginView(true)} />
    );
  }

  // Sidebar Menu Definition
  const getSidebarMenu = () => {
    switch (user.role) {
      case 'admin':
        return [
          { id: 'home', label: 'Home', icon: <IconHome /> },
          { id: 'members', label: 'Members', icon: <IconUsers /> },
          { id: 'settings', label: 'Settings', icon: <IconSettings /> }
        ];
      case 'trainer':
        return [
          { id: 'home', label: 'Home', icon: <IconHome /> },
          { id: 'clients', label: 'My Clients', icon: <IconUsers /> },
          { id: 'attendance', label: 'Attendance', icon: <IconCalendar /> }
        ];
      case 'member':
        return [
          { id: 'home', label: 'Home', icon: <IconHome /> },
          { id: 'plan', label: 'My Plan', icon: <IconCard /> }
        ];
      default:
        return [];
    }
  };

  const renderContent = () => {
    switch (user.role) {
      case 'admin':
        if (currentView === 'home') return <AdminHome />;
        if (currentView === 'members') return <AdminMembers />;
        if (currentView === 'settings') return <AdminSettings db={db} updateDB={updateDB} />;
        break;
      case 'trainer':
        if (currentView === 'home') return <TrainerHome user={user} db={db} />;
        if (currentView === 'clients') return <TrainerClients user={user} db={db} updateDB={updateDB} />;
        if (currentView === 'attendance') return <TrainerAttendanceLog user={user} db={db} />;
        break;
      case 'member':
        if (currentView === 'home') return <MemberHome user={user} db={db} updateDB={updateDB} />;
        if (currentView === 'plan') return <MemberPlan user={user} db={db} updateCurrentUser={updateCurrentUser} />;
        break;
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      <div className="w-full md:w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold tracking-wider border-b border-gray-800 text-blue-400">
          Desi<span className="text-white">Jim</span>
        </div>
        <div className="p-4 flex-1">
          <p className="text-gray-400 text-sm mb-6 pb-4 border-b border-gray-800">Welcome, {user.name}</p>
          <div className="space-y-2">
            {getSidebarMenu().map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition ${
                  currentView === item.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => { setUser(null); localStorage.removeItem('token'); setCurrentView('home'); }}
          className="m-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}

// --- AUTH SCREENS ---

function LoginScreen({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Gym Login</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={isLoading} className={`w-full py-3 text-white rounded-lg font-bold transition ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600 text-sm">
          Don't have an account? <button onClick={onSwitchToSignup} className="text-blue-600 font-bold hover:underline">Sign up</button>
        </p>
      </div>
    </div>
  );
}

function SignupScreen({ onLogin, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { name, email, password, role: 'member' });
      localStorage.setItem('token', response.data.token);
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Join the Gym</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={isLoading} className={`w-full py-3 text-white rounded-lg font-bold transition ${isLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600 text-sm">
          Already a member? <button onClick={onSwitchToLogin} className="text-blue-600 font-bold hover:underline">Login</button>
        </p>
      </div>
    </div>
  );
}


// --- ADMIN VIEWS ---

function AdminHome() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
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
  );
}

function AdminMembers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [nName, setNName] = useState('');
  const [nEmail, setNEmail] = useState('');
  const [nPass, setNPass] = useState('');
  const [nRole, setNRole] = useState('member');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
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
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        name: nName, email: nEmail, password: nPass, role: nRole
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setNName(''); setNEmail(''); setNPass('');
      fetchUsers();
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
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      fetchUsers();
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
      fetchUsers();
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
                         <button onClick={() => renewMembership(m._id)} className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded hover:bg-blue-200 transition">
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
    </div>
  );
}

function AdminSettings({ db, updateDB }) {
  const [newFee, setNewFee] = useState(db.settings.standardFee);
  const [newTrainerFee, setNewTrainerFee] = useState(db.settings.trainerFee);
  const [message, setMessage] = useState('');

  const updateSettings = () => {
    updateDB({ ...db, settings: { standardFee: Number(newFee), trainerFee: Number(newTrainerFee) } });
    setMessage('Fees updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <h2 className="text-3xl font-bold text-gray-800">Gym Settings</h2>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
         {message && <div className="p-3 bg-green-50 text-green-700 rounded-lg font-medium">{message}</div>}
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Standard Fee (₹ / month)</label>
            <input type="number" value={newFee} onChange={e => setNewFee(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
         </div>
         <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Trainer Fee (₹ / month)</label>
            <input type="number" value={newTrainerFee} onChange={e => setNewTrainerFee(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" />
         </div>
         <button onClick={updateSettings} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">Update Fees</button>
      </div>
    </div>
  );
}

// --- TRAINER VIEWS ---

function TrainerHome({ user }) {
  const [myClientsCount, setClientsCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        const token = localStorage.getItem('token');
        // 1. Fetch Clients
        const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
        const clients = usersRes.data.filter(u => u.role === 'member' && u.assignedTrainer === user._id);
        setClientsCount(clients.length);

        // 2. Fetch Attendance Logs
        const attRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance`, { headers: { Authorization: `Bearer ${token}` } });
        setRecentLogs(attRes.data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch trainer data", error);
      }
    };
    fetchTrainerData();
  }, [user._id]);

  return (
    <div className="space-y-8 animate-fade-in">
       <h2 className="text-3xl font-bold text-gray-800 mb-6">Trainer Overview</h2>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
               <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">My Active Clients</p>
               <p className="text-5xl font-bold text-blue-600 mt-2">{myClientsCount}</p>
               <p className="text-sm text-gray-400 mt-4">Manage them in the 'My Clients' tab.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Attendance Marked</h3>
                <div className="space-y-3">
                    {recentLogs.length > 0 ? recentLogs.map(log => (
                        <div key={log._id} className="flex justify-between items-center text-sm p-2 border-b border-gray-50 last:border-0">
                            <div>
                                <p className="font-medium text-gray-700">{log.memberId?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-400">{new Date(log.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {log.status}
                            </span>
                        </div>
                    )) : <p className="text-sm text-gray-500 italic">No attendance marked recently.</p>}
                </div>
            </div>
        </div>
    </div>
  );
}

function TrainerClients({ user }) {
  const [myClients, setMyClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW: State to track which client got marked inline
  const [markedStatus, setMarkedStatus] = useState({});

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const clients = response.data.filter(u => u.role === 'member' && u.assignedTrainer === user._id);
        setMyClients(clients);
      } catch (error) {
        console.error("Failed to fetch clients", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [user._id]);

  const markAttendance = async (memberId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/attendance`, {
        memberId,
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // REMOVED ALERT! Instead, we update the local state to show the success tick
      setMarkedStatus(prev => ({ ...prev, [memberId]: status }));
      
    } catch (error) {
      console.error("Failed to mark attendance", error);
      setMarkedStatus(prev => ({ ...prev, [memberId]: 'Error' }));
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading clients...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">My Clients</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myClients.length === 0 ? (
          <p className="text-gray-500 col-span-3">No clients assigned yet. Wait for the admin to assign members to you.</p>
        ) : (
          myClients.map(client => (
            <div key={client._id} className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
              <h4 className="font-bold text-xl text-gray-800">{client.name}</h4>
              <p className="text-sm text-gray-500 mb-6">{client.email}</p>
              
              <div className="flex gap-3 flex-wrap">
                {markedStatus[client._id] === 'Present' ? (
                  <div className="flex-1 py-2 bg-green-100 text-green-700 font-bold rounded-lg flex items-center justify-center gap-2 border border-green-200">
                    <IconCheck /> Marked Present
                  </div>
                ) : markedStatus[client._id] === 'Absent' ? (
                  <div className="flex-1 py-2 bg-red-100 text-red-700 font-bold rounded-lg flex items-center justify-center gap-2 border border-red-200">
                    <IconCheck /> Marked Absent
                  </div>
                ) : (
                  <>
                    <button onClick={() => markAttendance(client._id, 'Present')} className="flex-1 py-2 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition border border-green-200">Present</button>
                    <button onClick={() => markAttendance(client._id, 'Absent')} className="flex-1 py-2 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition border border-red-200">Absent</button>
                  </>
                )}
                {markedStatus[client._id] === 'Error' && <p className="text-red-500 text-sm w-full text-center mt-2">Error saving. Try again.</p>}
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
}


function TrainerAttendanceLog({ user }) {
  const [myLogs, setMyLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/attendance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyLogs(response.data);
      } catch (error) {
        console.error("Failed to fetch attendance logs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="p-8 text-gray-500">Loading logs...</div>;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
       <h2 className="text-3xl font-bold text-gray-800">Attendance Log</h2>
       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200 text-gray-500 text-sm uppercase">
                  <th className="p-4">Date</th>
                  <th className="p-4">Client Name</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {myLogs.length === 0 ? (
                  <tr><td colSpan="3" className="p-4 text-center text-gray-500">No logs found.</td></tr>
                ) : (
                  myLogs.map(log => (
                    <tr key={log._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4">{new Date(log.date).toLocaleDateString()} {new Date(log.date).toLocaleTimeString()}</td>
                      {/* Backend populates memberId with name and email */}
                      <td className="p-4 font-medium">{log.memberId?.name || 'Unknown'}</td>
                      <td className="p-4">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                           {log.status}
                         </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
       </div>
    </div>
  )
}

// --- MEMBER VIEWS ---

function MemberHome({ user, db }) {
  const myAttendance = db.attendance.filter(a => a.memberId === user.id).sort((a,b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="space-y-8 animate-fade-in">
       <h2 className="text-3xl font-bold text-gray-800">Welcome back, {user.name.split(' ')[0]}</h2>
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 text-gray-800">Recent Attendance</h3>
        {myAttendance.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {myAttendance.slice(0,4).map(record => (
              <div key={record.id} className={`p-4 rounded-xl border ${record.status === 'Present' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <p className="text-sm text-gray-500 mb-1">{new Date(record.date).toLocaleDateString()}</p>
                <p className={`font-bold ${record.status === 'Present' ? 'text-green-700' : 'text-red-700'}`}>{record.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">No recent attendance records.</div>
        )}
      </div>
    </div>
  )
}

function MemberPlan({ user, db, updateCurrentUser }) {
  const [isPaying, setIsPaying] = useState(false);
  const [expiryDate, setExpiryDate] = useState(user.membershipExpiry);
  const [assignedTrainerObj, setAssignedTrainerObj] = useState(null);

  const isActive = expiryDate && new Date(expiryDate) > new Date();
  const showPaymentButton = !isActive;

  useEffect(() => {
    // Fetch trainer name from backend if assigned
    const fetchTrainer = async () => {
      if (!user.assignedTrainer) return;
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const trainer = response.data.find(u => u._id === user.assignedTrainer);
        if (trainer) setAssignedTrainerObj(trainer);
      } catch (error) {
        console.error("Failed to fetch trainer info", error);
      }
    };
    fetchTrainer();
  }, [user.assignedTrainer]);

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${user._id}/renew`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newExpiryDate = response.data.membershipExpiry;
      setExpiryDate(newExpiryDate);
      
      if (updateCurrentUser) {
         updateCurrentUser({ membershipExpiry: newExpiryDate });
      }
      
    } catch (error) {
      console.error("Payment failed", error);
      alert("Error processing payment. Please check your backend.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
       <h2 className="text-3xl font-bold text-gray-800">My Plan</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-2 h-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <h3 className="text-lg font-semibold text-gray-500 mb-4">Membership Status</h3>
          <div className="space-y-6">
             <div className="flex items-end gap-4">
                 {isActive ? (
                  <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-bold flex items-center gap-2 border border-green-100">
                    <IconCheck/> Active
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-bold border border-red-100">
                    {!expiryDate ? 'Pending Initial Payment' : 'Expired'}
                  </div>
                )}
                <p className="text-gray-600 text-sm pb-1">
                   {expiryDate ? `Valid till ${new Date(expiryDate).toLocaleDateString()}` : ''}
                </p>
             </div>
             
             {showPaymentButton && (
              <button onClick={handlePayment} disabled={isPaying} className={`w-full py-4 text-white font-bold rounded-xl transition ${isPaying ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}`}>
                {isPaying ? 'Processing Payment...' : 'Pay Now Online'}
              </button>
            )}

            <div className="pt-6 border-t border-gray-100">
              <p className="text-gray-500 text-sm mb-1">Assigned Trainer</p>
              <p className="text-lg font-medium text-gray-800">{assignedTrainerObj ? assignedTrainerObj.name : 'No trainer assigned'}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-lg">
          <h3 className="text-2xl font-bold mb-8 text-blue-400">Gym Fee Structure</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-gray-700 pb-4">
              <span className="text-gray-300">Standard Membership</span>
              <span className="text-2xl font-bold">₹{db.settings?.standardFee || 1500} <span className="text-sm font-normal text-gray-400">/mo</span></span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-700 pb-4">
              <span className="text-gray-300">Personal Training</span>
              <span className="text-2xl font-bold">₹{db.settings?.trainerFee || 3000} <span className="text-sm font-normal text-gray-400">/mo</span></span>
            </div>
          </div>
        </div>

       </div>
    </div>
  );
}
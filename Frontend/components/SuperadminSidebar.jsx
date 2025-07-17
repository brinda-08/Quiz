import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetAuth } from "../store/slices/authslice";

export default function SuperadminSidebar({ isCollapsed, setIsCollapsed, isMobile }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");
    dispatch(resetAuth());
    navigate("/login");
  };

  const links = [
    { to: "/superadmin-dashboard/dashboard-section", label: "Dashboard", icon: "🏠" },
    { to: "/superadmin-dashboard/custom-quiz-list", label: "Custom Quizzes", icon: "🧠" },
    { to: "/superadmin-dashboard/admin-requests", label: "Admin Requests", icon: "📝" },
    { to: "/superadmin-dashboard/registered-users", label: "Registered Users", icon: "👥" },
    { to: "/superadmin-dashboard/approved-admins", label: "Approved Admins", icon: "✅" },  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          className="fixed top-5 left-5 z-50 bg-slate-900 text-white p-3 text-xl rounded-md shadow-md hover:bg-slate-800 transition"
          onClick={toggleSidebar}
        >
          ☰
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 bg-slate-900 text-white shadow-2xl overflow-y-auto transition-transform duration-300 ease-in-out
          ${isMobile 
            ? (isCollapsed ? 'translate-x-0 w-64 px-5 py-8' : '-translate-x-full') 
            : (isCollapsed ? 'w-16 px-2 py-8' : 'w-64 px-5 py-8')
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {!isMobile && (
            <button
              className="text-white text-xl hover:bg-white/10 p-1 rounded transition hidden md:block"
              onClick={toggleSidebar}
            >
              {isCollapsed ? '→' : '←'}
            </button>
          )}
          {(!isCollapsed || isMobile) && (
            <h2 className="text-2xl font-semibold">☰ Menu</h2>
          )}
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-2">
            {links.map(({ to, label, icon }) => (
              <li key={label}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center text-gray-300 py-2.5 px-3 rounded-md transition-all hover:bg-blue-500 hover:text-white ${
                      isActive ? 'bg-blue-500 text-white' : ''
                    } ${isCollapsed ? 'justify-center' : 'justify-start'}`
                  }
                  title={isCollapsed ? label : ''}
                >
                  <span className={`text-lg ${isCollapsed ? '' : 'mr-2'}`}>{icon}</span>
                  {!isCollapsed && <span className="text-sm">{label}</span>}
                </NavLink>
              </li>
            ))}

            {/* Logout */}
            <li>
              <button
                onClick={handleLogout}
                className={`flex items-center text-gray-300 py-2.5 px-3 w-full rounded-md hover:bg-red-500/20 hover:text-red-400 transition ${
                  isCollapsed ? 'justify-center' : 'justify-start'
                }`}
                title={isCollapsed ? "Logout" : ""}
              >
                <span className={`text-lg ${isCollapsed ? '' : 'mr-2'}`}>🚪</span>
                {!isCollapsed && <span className="text-sm">Logout</span>}
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}

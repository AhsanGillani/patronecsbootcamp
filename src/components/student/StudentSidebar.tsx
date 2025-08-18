import { 
  BookOpen, 
  User, 
  Play, 
  Award, 
  MessageSquare, 
  Settings,
  GraduationCap,
  Home,
  Target,
  TrendingUp,
  Zap,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const menuItems = [
  { 
    id: 'home', 
    title: 'Dashboard', 
    icon: Home,
    description: 'Overview & progress'
  },
  { 
    id: 'courses', 
    title: 'My Courses', 
    icon: BookOpen,
    description: 'Enrolled courses'
  },
  { 
    id: 'learning', 
    title: 'Continue Learning', 
    icon: Play,
    description: 'Resume learning'
  },
  { 
    id: 'certificates', 
    title: 'Certificates', 
    icon: Award,
    description: 'Achievements earned'
  },
  { 
    id: 'profile', 
    title: 'Profile & Settings', 
    icon: User,
    description: 'Account management'
  },
];

interface StudentSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  studentName?: string;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function StudentSidebar({ 
  activeTab, 
  onTabChange, 
  studentName, 
  isOpen, 
  onClose, 
  isCollapsed, 
  onToggleCollapse 
}: StudentSidebarProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${isCollapsed ? 'w-20' : 'w-80'} bg-white border-r border-slate-200 shadow-xl
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              {!isCollapsed && (
                <div>
                  <h2 className="font-bold text-slate-900 text-xl">Student Portal</h2>
                  <p className="text-slate-600 text-sm">Learning Dashboard</p>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Collapse Button - Desktop Only */}
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100 transition-colors"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                )}
              </button>
              {/* Close Button - Mobile Only */}
              <button
                onClick={onClose}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
          {!isCollapsed && studentName && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200">
              <p className="text-sm text-emerald-600 font-semibold text-center">
                Welcome, {studentName}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="p-4">
          <div className="mb-6">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">
                Learning Hub
              </h3>
            )}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose(); // Close sidebar on mobile after selection
                  }}
                  className={`
                    w-full flex items-start text-left rounded-xl transition-all duration-300
                    ${isCollapsed ? 'p-3 justify-center' : 'p-4'}
                    ${activeTab === item.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                      : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 hover:shadow-md border border-transparent hover:border-slate-200'
                    }
                  `}
                  title={isCollapsed ? item.title : undefined}
                >
                  <div className={`
                    ${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl flex items-center justify-center flex-shrink-0
                    ${activeTab === item.id 
                      ? 'bg-white/20' 
                      : 'bg-slate-100 group-hover:bg-emerald-100 transition-colors'
                    }
                  `}>
                    <item.icon className={`
                      ${isCollapsed ? 'w-4 h-4' : 'w-5 h-5'}
                      ${activeTab === item.id 
                        ? 'text-white' 
                        : 'text-slate-600 group-hover:text-emerald-600'
                      }
                    `} />
                  </div>
                  {!isCollapsed && (
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="font-semibold text-base leading-tight">{item.title}</div>
                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</div>
                    </div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Stats - Only show when not collapsed */}
          {!isCollapsed && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200/50">
                <div className="flex items-center space-x-2 mb-3">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-900">Today's Goal</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Learning Time</span>
                    <span className="font-semibold text-slate-900">45/60 min</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Lessons</span>
                    <span className="font-semibold text-slate-900">2/3</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer - Only show when not collapsed */}
          {!isCollapsed && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200/50">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-900">Learning Streak</span>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">7</div>
                <div className="text-xs text-slate-600">days in a row</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
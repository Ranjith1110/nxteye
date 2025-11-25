import React from "react";
import {
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  TrendingUp,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Layout from "../components/dashboard/Layout";

const Dashboard = () => {
  const stats = [
    {
      id: 1,
      title: "Total Users",
      value: "1,245",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      growth: "+12%",
      trend: "up",
      bg: "bg-blue-100",
    },
    {
      id: 2,
      title: "Total Orders",
      value: "856",
      icon: <ShoppingCart className="w-6 h-6 text-green-600" />,
      growth: "+8%",
      trend: "up",
      bg: "bg-green-100",
    },
    {
      id: 3,
      title: "Revenue",
      value: "₹12,560",
      icon: <DollarSign className="w-6 h-6 text-yellow-600" />,
      growth: "-3%",
      trend: "down",
      bg: "bg-yellow-100",
    },
    {
      id: 4,
      title: "Active Sessions",
      value: "93",
      icon: <Activity className="w-6 h-6 text-red-600" />,
      growth: "+4%",
      trend: "up",
      bg: "bg-red-100",
    },
  ];

  const activities = [
    { msg: "John placed a new order", time: "2 mins ago" },
    { msg: "Inventory updated", time: "10 mins ago" },
    { msg: "New user registered", time: "1 hr ago" },
    { msg: "Payment received from Sarah", time: "3 hrs ago" },
  ];

  return (
    <Layout>
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Top header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#03214a]">Dashboard</h1>
            <p className="text-gray-600 text-sm">Overview of your business performance</p>
          </div>

          <button className="hidden md:flex items-center gap-2 bg-[#03214a] text-white px-4 py-2 rounded-xl shadow hover:bg-[#5ce1e6] hover:text-[#03214a] transition">
            <Bell size={18} /> Notifications
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((item) => (
            <div
              key={item.id}
              className="bg-gray-50 rounded-2xl border border-gray-100 shadow-md p-5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} mb-3`}>
                {item.icon}
              </div>

              <h2 className="text-gray-500 text-sm font-medium">{item.title}</h2>
              <p className="text-3xl font-extrabold text-[#03214a] mt-1">{item.value}</p>

              <span className={`flex items-center gap-1 text-sm font-semibold mt-2
                ${item.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {item.trend === "up" ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                {item.growth}
              </span>
            </div>
          ))}
        </div>

        {/* Sales Overview */}
        <div className="bg-gradient-to-r from-[#03214a] to-[#06578f] text-white shadow-xl rounded-2xl p-6 mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Sales Overview</h2>
            <TrendingUp size={22} />
          </div>
          <div className="h-56 flex items-center justify-center">
            <span className="opacity-70">📊 Animated chart will be integrated here...</span>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-gray-50 rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <ul className="space-y-3">
            {activities.map((a, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition"
              >
                <span>{a.msg}</span>
                <span className="text-xs text-gray-500">{a.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

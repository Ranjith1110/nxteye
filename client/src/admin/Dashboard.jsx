import React from "react";
import { Users, ShoppingCart, DollarSign, Activity } from "lucide-react";
import Layout from "../components/dashboard/Layout";

const Dashboard = () => {
  const stats = [
    { id: 1, title: "Total Users", value: "1,245", icon: <Users className="w-6 h-6 text-blue-500" /> },
    { id: 2, title: "Total Orders", value: "856", icon: <ShoppingCart className="w-6 h-6 text-green-500" /> },
    { id: 3, title: "Revenue", value: "$12,560", icon: <DollarSign className="w-6 h-6 text-yellow-500" /> },
    { id: 4, title: "Active Sessions", value: "93", icon: <Activity className="w-6 h-6 text-red-500" /> },
  ];

  const recentActivities = [
    "User John placed a new order",
    "Payment received from Sarah",
    "Inventory updated for Item #32",
    "New user account created by Lisa",
  ];

  return (
    <Layout>
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-5 flex items-center justify-between hover:shadow-lg transition"
          >
            <div>
              <h3 className="text-gray-500 text-sm">{item.title}</h3>
              <p className="text-2xl font-bold mt-1">{item.value}</p>
            </div>
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">{item.icon}</div>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-3">Sales Overview</h2>
        <div className="h-64 flex items-center justify-center text-gray-400">
          <span>📊 Chart Coming Soon...</span>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
        <ul className="space-y-2">
          {recentActivities.map((activity, index) => (
            <li
              key={index}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
              {activity}
            </li>
          ))}
        </ul>
      </div>
    </div>
    </Layout>
  );
};

export default Dashboard;

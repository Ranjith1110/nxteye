import React, { useState, useEffect, useMemo } from "react";
import Layout from "../components/dashboard/Layout";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Package,
  Activity,
  ArrowRight,
  Truck,
  Download,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from "recharts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

const API_URL = import.meta.env.VITE_APP_BASE_URL;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [purchaseData, setPurchaseData] = useState([]);
  const [exporting, setExporting] = useState(false);

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [resDelivered, resOrdered, resPurchases] = await Promise.all([
          fetch(`${API_URL}/api/billing/all?type=delivered`),
          fetch(`${API_URL}/api/billing/all?type=ordered`),
          fetch(`${API_URL}/api/purchase-bills/all`)
        ]);

        const delivered = await resDelivered.json();
        const ordered = await resOrdered.json();
        const purchases = await resPurchases.json();

        const allSales = [...(Array.isArray(delivered) ? delivered : []), ...(Array.isArray(ordered) ? ordered : [])];

        setSalesData(allSales);
        setPurchaseData(Array.isArray(purchases) ? purchases : []);

      } catch (error) {
        console.error("Dashboard Load Error:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const analytics = useMemo(() => {
    if (loading) return null;

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    const filteredSales = salesData.filter(item => {
      const itemDate = new Date(item.createdAt || item.date);
      return itemDate >= start && itemDate <= end;
    });

    const filteredPurchases = purchaseData.filter(item => {
      const itemDate = new Date(item.vendor?.purchaseDate || item.createdAt);
      return itemDate >= start && itemDate <= end;
    });

    const totalOrders = filteredSales.length;
    const totalRevenue = filteredSales.reduce((acc, curr) => acc + (Number(curr.grandTotal) || 0), 0);
    const totalExpense = filteredPurchases.reduce((acc, curr) => acc + (Number(curr.grandTotal) || 0), 0);

    const netResult = totalRevenue - totalExpense;
    const isProfit = netResult >= 0;

    const trendMap = {};
    filteredSales.forEach(sale => {
      const d = new Date(sale.createdAt || sale.date);
      const dateKey = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!trendMap[dateKey]) trendMap[dateKey] = 0;
      trendMap[dateKey] += (Number(sale.grandTotal) || 0);
    });

    const chartData = Object.keys(trendMap).map(date => ({
      name: date,
      sales: trendMap[date]
    })).slice(-10);

    const itemMap = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!itemMap[item.itemName]) itemMap[item.itemName] = 0;
        itemMap[item.itemName] += (Number(item.quantity) || 1);
      });
    });

    const topItemsData = Object.entries(itemMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const todayStr = new Date().toISOString().split('T')[0];
    const dueDeliveries = salesData.filter(sale => {
      const isOrdered = sale.orderStatus?.ordered === true && sale.orderStatus?.delivered === false;
      const deliveryDate = sale.deliveryDate ? sale.deliveryDate.split('T')[0] : "";
      return isOrdered && deliveryDate === todayStr;
    });

    return {
      filteredSales,
      filteredPurchases,
      totalOrders,
      totalRevenue,
      totalExpense,
      netResult,
      isProfit,
      chartData,
      topItemsData,
      dueDeliveries
    };

  }, [salesData, purchaseData, dateRange, loading]);

  const handleDateChange = (e) => {
    setDateRange({ ...dateRange, [e.target.name]: e.target.value });
  };

  const handleExportExcel = () => {
    if (!analytics) return;
    setExporting(true);
    try {
      const salesSheetData = analytics.filteredSales.map(sale => ({
        "Date": new Date(sale.createdAt || sale.date).toLocaleDateString(),
        "Invoice No": sale.invoiceNo,
        "Customer": sale.customer?.customerName || "N/A",
        "Mobile": sale.customer?.mobileNumber || "N/A",
        "Total Amount": Number(sale.grandTotal || 0),
        "Status": sale.orderStatus?.delivered ? "Delivered" : "Ordered"
      }));

      const purchaseSheetData = analytics.filteredPurchases.map(pur => ({
        "Date": new Date(pur.vendor?.purchaseDate).toLocaleDateString(),
        "Invoice No": pur.vendor?.invoiceNumber,
        "Vendor": pur.vendor?.vendorName,
        "GSTIN": pur.vendor?.gstin,
        "Total Amount": Number(pur.grandTotal || 0)
      }));

      const workbook = XLSX.utils.book_new();
      
      const salesSheet = XLSX.utils.json_to_sheet(salesSheetData);
      XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales Report");

      const purchaseSheet = XLSX.utils.json_to_sheet(purchaseSheetData);
      XLSX.utils.book_append_sheet(workbook, purchaseSheet, "Expenses Report");

      XLSX.writeFile(workbook, `Analytics_Report_${dateRange.startDate}_to_${dateRange.endDate}.xlsx`);
      toast.success("Excel exported successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to export Excel");
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    const element = document.getElementById("dashboard-content");
    if (!element) return;
    
    setExporting(true);
    toast.info("Generating PDF, please wait...");

    try {
      const dataUrl = await toPng(element, { 
        cacheBust: true,
        backgroundColor: '#f9fafb'
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      
      pdf.save(`Dashboard_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF exported successfully!");

    } catch (error) {
      console.error("PDF Gen Error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      </Layout>
    );
  }

  if (!analytics) return null;

  return (
    <Layout>
      <div id="dashboard-content" className="p-6 min-h-screen bg-gray-50">

        <div className="flex flex-col xl:flex-row justify-between items-end xl:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#03214a]">Analytics Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Business performance overview & insights</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-end md:items-center">
            
            <div className="flex gap-2">
                <button 
                    onClick={handleExportExcel}
                    disabled={exporting}
                    className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md disabled:opacity-50"
                >
                    <FileSpreadsheet size={16} /> Excel
                </button>
                <button 
                    onClick={handleExportPDF}
                    disabled={exporting}
                    className="flex items-center gap-2 px-6 py-2 bg-[#5ce1e6] text-[#03214a] font-bold rounded-full hover:bg-[#03214a] hover:text-white transition shadow-md disabled:opacity-50"
                >
                    <Download size={16} /> PDF
                </button>
            </div>

            <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 border-r border-gray-200">
                <Calendar size={18} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Filter</span>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-400 font-semibold ml-1">Start</label>
                  <input
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    className="border-gray-200 bg-gray-50 rounded-lg text-sm px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-400 font-semibold ml-1">End</label>
                  <input
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    className="border-gray-200 bg-gray-50 rounded-lg text-sm px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Orders"
            value={analytics.totalOrders}
            icon={<ShoppingCart className="text-blue-600" size={24} />}
            bg="bg-blue-50"
            subtext="In selected period"
          />

          <StatCard
            title="Total Revenue"
            value={`₹${analytics.totalRevenue.toLocaleString('en-IN')}`}
            icon={<DollarSign className="text-emerald-600" size={24} />}
            bg="bg-emerald-50"
            subtext="Gross sales"
          />

          <StatCard
            title="Total Expenses"
            value={`₹${analytics.totalExpense.toLocaleString('en-IN')}`}
            icon={<Activity className="text-purple-600" size={24} />}
            bg="bg-purple-50"
            subtext="Purchase bills cost"
          />

          <div className={`relative overflow-hidden rounded-2xl shadow-sm border p-5 transition-all hover:shadow-md ${analytics.isProfit ? 'bg-linear-to-br from-green-50 to-white border-green-100' : 'bg-linear-to-br from-red-50 to-white border-red-100'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${analytics.isProfit ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.isProfit ? 'Net Profit' : 'Net Loss'}
                </p>
                <h3 className={`text-2xl font-extrabold mt-1 ${analytics.isProfit ? 'text-green-700' : 'text-red-700'}`}>
                  ₹{Math.abs(analytics.netResult).toLocaleString('en-IN')}
                </h3>
              </div>
              <div className={`p-3 rounded-xl ${analytics.isProfit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {analytics.isProfit ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100/50">
              <p className="text-xs text-gray-500">
                Based on Sales vs Purchase data
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-600" /> Sales Trend
              </h2>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`₹${value}`, "Sales"]}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#0088FE" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Package size={20} className="text-orange-500" /> Top Items
            </h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={analytics.topItemsData} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" fill="#FF8042" radius={[0, 4, 4, 0]} barSize={20}>
                    {analytics.topItemsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Truck size={20} className="text-[#03214a]" /> Today's Deliveries
            </h2>
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {analytics.dueDeliveries.length} Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 font-bold">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Bill No</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody>
                {analytics.dueDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
                      No deliveries scheduled for today.
                    </td>
                  </tr>
                ) : (
                  analytics.dueDeliveries.map((sale, idx) => (
                    <tr key={idx} className="bg-white border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {sale.customer.customerName}
                        <div className="text-xs text-gray-400 font-normal">{sale.customer.mobileNumber}</div>
                      </td>
                      <td className="px-6 py-4">{sale.invoiceNo}</td>
                      <td className="px-6 py-4">
                        {sale.items.length > 0 ? sale.items[0].itemName : "N/A"}
                        {sale.items.length > 1 && <span className="text-xs text-blue-500 ml-1">+{sale.items.length - 1} more</span>}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-red-500">
                        ₹{sale.remaining}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {analytics.dueDeliveries.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <a href="/ordered" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                Go to Active Orders <ArrowRight size={14} />
              </a>
            </div>
          )}
        </div>

      </div>
      <ToastContainer position="bottom-right" theme="colored" />
    </Layout>
  );
};

const StatCard = ({ title, value, icon, bg, subtext }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:-translate-y-1">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        {icon}
      </div>
    </div>
    <div>
      <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
      <p className="text-2xl font-extrabold text-gray-800 mt-1">{value}</p>
      {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </div>
  </div>
);

export default Dashboard;
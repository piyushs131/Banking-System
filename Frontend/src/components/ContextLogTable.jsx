import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Clock, Globe, Monitor, MapPin, AlertTriangle, MoreHorizontal } from "lucide-react";

const ContextLogTable = ({ logs }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "Unknown";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getRiskLevel = (score) => {
    if (score >= 10) return { level: "Critical", color: "bg-red-100 text-red-800 border-red-200" };
    if (score >= 7) return { level: "High", color: "bg-orange-100 text-orange-800 border-orange-200" };
    if (score >= 4) return { level: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    return { level: "Low", color: "bg-green-100 text-green-800 border-green-200" };
  };

  const toggleRowExpansion = (logId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  if (!logs || logs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 mb-4 max-w-6xl mx-auto"
      >
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Context Logs Available</h3>
          <p className="text-gray-600">Contextual login logs will appear here once you start using the application.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 mb-4 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Activity className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Contextual Login Logs</h2>
          <p className="text-sm text-gray-600">Recent login attempts and security analysis</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-3 text-left font-semibold text-gray-700 w-32">
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  <span>IP Address</span>
                </div>
              </th>
              <th className="py-3 px-3 text-left font-semibold text-gray-700 w-48">
                <div className="flex items-center gap-1">
                  <Monitor className="w-4 h-4" />
                  <span>Device</span>
                </div>
              </th>
              <th className="py-3 px-3 text-left font-semibold text-gray-700 w-40">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Timestamp</span>
                </div>
              </th>
              <th className="py-3 px-3 text-left font-semibold text-gray-700 w-48">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                </div>
              </th>
              <th className="py-3 px-3 text-center font-semibold text-gray-700 w-24">
                <div className="flex items-center gap-1 justify-center">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Risk</span>
                </div>
              </th>
              <th className="py-3 px-3 text-center font-semibold text-gray-700 w-12">
                <span>Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => {
              const riskInfo = getRiskLevel(log.riskScore);
              const isExpanded = expandedRows.has(log._id);
              
              return (
                <React.Fragment key={log._id}>
                  <motion.tr
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-3 px-3 text-gray-800 font-medium text-sm">
                      {truncateText(log.ip, 15)}
                    </td>
                    <td className="py-3 px-3 text-gray-700 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{truncateText(log.device, 40)}</span>
                        {log.device && log.device.length > 40 && (
                          <button
                            onClick={() => toggleRowExpansion(log._id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-600 text-sm">
                      {formatDate(log.timestamp?.$date || log.timestamp)}
                    </td>
                    <td className="py-3 px-3 text-gray-700 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{truncateText(log.location?.locationName, 40)}</span>
                        {log.location?.locationName && log.location.locationName.length > 40 && (
                          <button
                            onClick={() => toggleRowExpansion(log._id)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${riskInfo.color}`}
                      >
                        {log.riskScore}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleRowExpansion(log._id)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                  
                  {/* Expanded Row Details */}
                  {isExpanded && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 border-b border-gray-200"
                    >
                      <td colSpan="6" className="py-4 px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Full Device Information</h4>
                            <p className="text-gray-700 bg-white p-3 rounded border break-all">
                              {log.device || "Unknown"}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Full Location Details</h4>
                            <p className="text-gray-700 bg-white p-3 rounded border">
                              {log.location?.locationName || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Total Logs:</span> {logs.length}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">High Risk:</span> {logs.filter(log => log.riskScore >= 7).length}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Low Risk:</span> {logs.filter(log => log.riskScore < 4).length}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContextLogTable;

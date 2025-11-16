import React from 'react';

export default function ContentManagement({ title, data, columns }) {
  return (
    <div className="bg-gray-800/60 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-300">{title}</h2>
        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Thêm mới
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max table-auto text-left">
          <thead>
            <tr className="border-b border-gray-600">
              {columns.map((col) => (
                <th key={col} className="p-4 text-gray-400 font-semibold uppercase text-sm">{col}</th>
              ))}
              <th className="p-4 text-gray-400 font-semibold uppercase text-sm">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                {Object.values(row).map((value, index) => (
                  <td key={index} className="p-4 text-gray-200">{value}</td>
                ))}
                <td className="p-4">
                  <button className="text-blue-400 hover:text-blue-300 mr-2">Sửa</button>
                  <button className="text-red-400 hover:text-red-300">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

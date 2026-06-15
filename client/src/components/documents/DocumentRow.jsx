import React from 'react';

function DocumentRow({ name, category, size, date, downloadUrl }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-slate-500 capitalize">{category}</td>
      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{size}</td>
      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{date}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
        <a href={downloadUrl || '#'} className="text-society-primary hover:text-yellow-600">
          Download
        </a>
      </td>
    </tr>
  );
}

export default DocumentRow;

import React from 'react';

const StatCard = ({ title, value, icon, color, description }: { title: any; value: any; icon: any; color: any; description?: string }) => {
  return (
    <div className="glass-panel p-6 flex items-center justify-between group hover:border-slate-600 transition-all">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{value}</h3>
        {description && <p className="text-[10px] text-slate-500 mt-1">{description}</p>}
      </div>
      <div className={`p-4 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${color}20`, color: color }}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;

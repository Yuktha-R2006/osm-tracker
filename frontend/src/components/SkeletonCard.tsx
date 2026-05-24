import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="glass-panel p-5 border border-slate-700/50 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-700/50"></div>
          <div className="space-y-2">
            <div className="w-24 h-4 bg-slate-700/50 rounded"></div>
            <div className="w-16 h-3 bg-slate-700/50 rounded"></div>
          </div>
        </div>
        <div className="w-16 h-6 bg-slate-700/50 rounded-full"></div>
      </div>
      
      <div className="mt-8 space-y-3">
        <div className="flex justify-between items-center">
          <div className="w-16 h-4 bg-slate-700/50 rounded"></div>
          <div className="w-12 h-4 bg-slate-700/50 rounded"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="w-16 h-4 bg-slate-700/50 rounded"></div>
          <div className="w-12 h-4 bg-slate-700/50 rounded"></div>
        </div>
        <div className="w-full h-10 mt-4 bg-slate-700/50 rounded-lg"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;

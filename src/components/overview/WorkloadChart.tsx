import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { workloadBreakdownData } from '../../mock';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Database, PieChart as PieIcon } from 'lucide-react';
import { formatNumber } from '../../utils';

export const WorkloadChart: React.FC = () => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs font-mono">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-slate-100">{data.name}</span>
          </div>
          <p className="text-cyan-400 font-semibold">{data.sizeTB} TB ({data.percentage}%)</p>
          <p className="text-slate-400 mt-0.5">{formatNumber(data.objectCount)} objects</p>
        </div>
      );
    }
    return null;
  };

  return (
    <GlassCard
      title="Storage by AI Workload"
      subtitle="Capacity allocation across models, datasets, & embeddings"
      action={
        <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20">
          <PieIcon className="w-3.5 h-3.5" />
          <span>18.4 TB Total</span>
        </div>
      }
      className="h-full flex flex-col justify-between"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Recharts Donut */}
        <div className="h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={workloadBreakdownData}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={85}
                paddingAngle={4}
                dataKey="sizeTB"
              >
                {workloadBreakdownData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#0B1120"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-xl font-display font-bold text-slate-100">18.4 TB</span>
            <span className="text-[10px] text-slate-400 uppercase font-mono">Capacity</span>
          </div>
        </div>

        {/* Breakdown Legend List */}
        <div className="space-y-2 text-xs">
          {workloadBreakdownData.map((item) => (
            <div
              key={item.name}
              className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-200 font-medium truncate">{item.name}</span>
              </div>
              <div className="text-right font-mono shrink-0">
                <span className="text-slate-100 font-bold">{item.sizeTB} TB</span>
                <span className="text-slate-500 text-[10px] ml-1.5">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
};

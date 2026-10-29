import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { WeatherData } from '../../services/api';

interface ForecastChartProps {
  daily: WeatherData['daily'];
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ daily }) => {
  const chartData = daily.map((d) => {
    const dateObj = new Date(d.date);
    const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
    return {
      name: dayLabel,
      MaxTemp: Math.round(d.tempMax),
      MinTemp: Math.round(d.tempMin),
      RainChance: d.precipitationProbability,
      RainSum: d.precipitationSum,
    };
  });

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-stone-900">7-Day Temperature & Rain Forecast</h4>
          <p className="text-xs text-stone-500">Daytime Highs, Night Lows, and Precipitation Probability</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis unit="°C" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
              formatter={(val: any, name: any) => {
                if (name === 'MaxTemp') return [`${val}°C`, 'Max Temperature'];
                if (name === 'MinTemp') return [`${val}°C`, 'Min Temperature'];
                return [val, name];
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
            <Area
              type="monotone"
              dataKey="MaxTemp"
              name="Max Temp (°C)"
              stroke="#ea580c"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMax)"
            />
            <Area
              type="monotone"
              dataKey="MinTemp"
              name="Min Temp (°C)"
              stroke="#0284c7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMin)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mini daily table */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-4 pt-4 border-t border-stone-100">
        {daily.map((d) => (
          <div key={d.date} className="p-2.5 rounded-xl bg-stone-50 text-center flex flex-col justify-between">
            <span className="text-xs font-semibold text-stone-700">
              {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            <span className="text-[11px] text-stone-500 truncate my-1">{d.conditionText}</span>
            <div className="text-xs font-bold text-stone-900">
              <span className="text-orange-600">{Math.round(d.tempMax)}°</span>
              <span className="text-stone-300 mx-1">/</span>
              <span className="text-blue-600">{Math.round(d.tempMin)}°</span>
            </div>
            {d.precipitationProbability > 0 && (
              <span className="text-[10px] text-blue-600 font-medium mt-1">
                💧 {d.precipitationProbability}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '@/lib/mpesa-parser';

interface SpendingTrendsChartProps {
    data: {
        month: string;
        income: number;
        expenses: number;
    }[];
}

const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex justify-center items-center h-64 bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400">No data available for chart</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4 shadow-md">
            <h3 className="text-lg font-medium mb-4">Spending Trends</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: '#9ca3af' }}
                            axisLine={{ stroke: '#444' }}
                        />
                        <YAxis
                            tick={{ fill: '#9ca3af' }}
                            axisLine={{ stroke: '#444' }}
                            tickFormatter={(value) => `${value > 999 ? `${Math.round(value / 1000)}K` : value}`}
                        />
                        <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#e5e7eb' }}
                            labelStyle={{ color: '#e5e7eb' }}
                        />
                        <Legend wrapperStyle={{ color: '#e5e7eb' }} />
                        <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#34d399"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                            name="Income"
                        />
                        <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke="#f87171"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                            name="Expenses"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SpendingTrendsChart; 
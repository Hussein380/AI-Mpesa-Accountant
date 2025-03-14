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
        pdfIncome?: number;
        pdfExpenses?: number;
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

    // Check if we have PDF data - more aggressive check
    const hasPdfData = data.some(item => {
        // Check if PDF income or expenses exist and are greater than 0
        const hasPdfIncome = item.pdfIncome !== undefined && item.pdfIncome > 0;
        const hasPdfExpenses = item.pdfExpenses !== undefined && item.pdfExpenses > 0;
        return hasPdfIncome || hasPdfExpenses;
    });

    console.log('SpendingTrendsChart: Has PDF data:', hasPdfData);
    if (hasPdfData) {
        // Log all items with PDF data
        const pdfItems = data.filter(item =>
            (item.pdfIncome !== undefined && item.pdfIncome > 0) ||
            (item.pdfExpenses !== undefined && item.pdfExpenses > 0)
        );

        console.log('SpendingTrendsChart: PDF data items:', pdfItems);

        // Log total PDF income and expenses
        const totalPdfIncome = data.reduce((sum, item) => sum + (item.pdfIncome || 0), 0);
        const totalPdfExpenses = data.reduce((sum, item) => sum + (item.pdfExpenses || 0), 0);

        console.log('SpendingTrendsChart: Total PDF income:', totalPdfIncome);
        console.log('SpendingTrendsChart: Total PDF expenses:', totalPdfExpenses);
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
                            name="Income (All)"
                        />
                        <Line
                            type="monotone"
                            dataKey="expenses"
                            stroke="#f87171"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                            name="Expenses (All)"
                        />
                        {hasPdfData && (
                            <>
                                <Line
                                    type="monotone"
                                    dataKey="pdfIncome"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    activeDot={{ r: 6 }}
                                    name="Income (PDF)"
                                    dot={{ stroke: '#10b981', strokeWidth: 2, r: 4, fill: '#1f2937' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="pdfExpenses"
                                    stroke="#ef4444"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    activeDot={{ r: 6 }}
                                    name="Expenses (PDF)"
                                    dot={{ stroke: '#ef4444', strokeWidth: 2, r: 4, fill: '#1f2937' }}
                                />
                            </>
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
            {hasPdfData && (
                <div className="mt-2 text-xs text-gray-400">
                    <p>Dashed lines represent data from PDF statements</p>
                </div>
            )}
        </div>
    );
};

export default SpendingTrendsChart; 
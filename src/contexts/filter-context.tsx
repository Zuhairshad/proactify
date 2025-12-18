"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Filter state type
export type ChartFilter = {
    type: 'status' | 'severity' | 'project' | 'heatmap' | null;
    value: string | number | null;
    label?: string;
};

type FilterContextType = {
    activeFilter: ChartFilter;
    setFilter: (filter: ChartFilter) => void;
    clearFilter: () => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
    const [activeFilter, setActiveFilter] = useState<ChartFilter>({
        type: null,
        value: null,
    });

    const setFilter = (filter: ChartFilter) => {
        setActiveFilter(filter);
    };

    const clearFilter = () => {
        setActiveFilter({ type: null, value: null });
    };

    return (
        <FilterContext.Provider value={{ activeFilter, setFilter, clearFilter }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useChartFilter() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useChartFilter must be used within FilterProvider');
    }
    return context;
}

// Helper to filter risks based on active filter
export function applyFilter(risks: any[], filter: ChartFilter) {
    if (!filter.type || !filter.value) return risks;

    switch (filter.type) {
        case 'status':
            return risks.filter(r => {
                const status = r['Risk Status'] || r.Status;
                return status === filter.value;
            });

        case 'severity':
            return risks.filter(r => {
                const score = (r.Probability || 0) * (r['Impact Rating (0.05-0.8)'] || 0);
                const severity = score >= 0.15 ? 'Critical' :
                    score >= 0.08 ? 'High' :
                        score >= 0.03 ? 'Medium' : 'Low';
                return severity === filter.value;
            });

        case 'project':
            return risks.filter(r => {
                const project = r.ProjectCode || r['Project Code'];
                return project === filter.value;
            });

        case 'heatmap':
            // Filter by heatmap cell (score range)
            return risks.filter(r => {
                const score = (r.Probability || 0) * (r['Impact Rating (0.05-0.8)'] || 0);
                // Value is the target score, filter within tolerance
                return Math.abs(score - (filter.value as number)) < 0.05;
            });

        default:
            return risks;
    }
}

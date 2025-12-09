
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeightInsight } from "@/types";
import { LineChart, TrendingDown, TrendingUp } from "lucide-react";

interface WeightInsightCardProps {
  insights: WeightInsight;
  hasEntries: boolean;
}

export const WeightInsightCard: React.FC<WeightInsightCardProps> = ({ insights, hasEntries }) => {
  if (!hasEntries) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Weight Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Record your weight to see insights and trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getEmoji = (status: WeightInsight['status']) => {
    switch(status) {
      case 'on_track': return '🔥';
      case 'slowing': return '🐢';
      case 'gaining': return '⚠️';
      default: return '📊';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Weight Insights {getEmoji(insights.status)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Change</p>
            <div className="flex items-center gap-1">
              {getTrendIcon(insights.total_change)}
              <span className="font-medium">
                {insights.total_change === 0 ? 
                  'No change' : 
                  `${Math.abs(insights.total_change).toFixed(1)} kg ${insights.total_change > 0 ? 'lost' : 'gained'}`}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Average Weekly Change</p>
            <div className="flex items-center gap-1">
              {getTrendIcon(insights.average_weekly_change)}
              <span className="font-medium">
                {insights.average_weekly_change === 0 ? 
                  'No change' : 
                  `${Math.abs(insights.average_weekly_change).toFixed(1)} kg per week`}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Best Performing Week</p>
            {insights.best_week ? (
              <div className="flex items-center gap-1">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="font-medium">{Math.abs(insights.best_week.change).toFixed(1)} kg</span>
              </div>
            ) : (
              <span className="font-medium">Not enough data</span>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Progress Prediction</p>
            {insights.weeks_to_goal !== null ? (
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  Goal in {insights.weeks_to_goal} {insights.weeks_to_goal === 1 ? 'week' : 'weeks'}
                </span>
              </div>
            ) : (
              <span className="font-medium">
                {insights.status === 'no_goal' ? 'No goal set' : 'Unable to predict'}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

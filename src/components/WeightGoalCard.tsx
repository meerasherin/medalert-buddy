
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { WeightGoal, WeightInsight } from "@/types";
import { TrendingUp, TrendingDown, Target } from "lucide-react";

interface WeightGoalCardProps {
  goal: WeightGoal | null;
  insights: WeightInsight;
  currentWeight: number | null;
  onSetGoal: (targetWeight: number) => void;
}

export const WeightGoalCard: React.FC<WeightGoalCardProps> = ({
  goal,
  insights,
  currentWeight,
  onSetGoal
}) => {
  const [targetWeight, setTargetWeight] = useState<string>(goal?.target_weight.toString() || '');
  
  const handleSetGoal = () => {
    const weightValue = parseFloat(targetWeight);
    if (!isNaN(weightValue) && weightValue > 0) {
      onSetGoal(weightValue);
    }
  };
  
  // Calculate progress if goal exists
  let progressPercent = 0;
  let progressColor = "bg-primary";
  
  if (goal && currentWeight) {
    const totalChangeNeeded = goal.start_weight - goal.target_weight;
    const changeAchieved = goal.start_weight - currentWeight;
    
    if (Math.abs(totalChangeNeeded) > 0) {
      progressPercent = Math.min(100, Math.max(0, (changeAchieved / totalChangeNeeded) * 100));
    }
    
    // Determine progress color based on insights status
    switch(insights.status) {
      case 'on_track':
        progressColor = "bg-green-500";
        break;
      case 'slowing':
        progressColor = "bg-yellow-500";
        break;
      case 'gaining':
        progressColor = "bg-red-500";
        break;
      default:
        progressColor = "bg-primary";
    }
  }
  
  // Progress status text & icon
  const getStatusContent = () => {
    if (!goal || !insights) return null;
    
    switch(insights.status) {
      case 'on_track':
        return (
          <div className="flex items-center text-green-600 gap-1 mt-1">
            <TrendingDown className="h-4 w-4" />
            <span>On track to reach goal</span>
          </div>
        );
      case 'slowing':
        return (
          <div className="flex items-center text-yellow-600 gap-1 mt-1">
            <TrendingDown className="h-4 w-4" />
            <span>Progress slowing down</span>
          </div>
        );
      case 'gaining':
        return (
          <div className="flex items-center text-red-600 gap-1 mt-1">
            <TrendingUp className="h-4 w-4" />
            <span>Moving away from goal</span>
          </div>
        );
      case 'no_change':
        return (
          <div className="flex items-center text-slate-600 gap-1 mt-1">
            <span className="h-4 w-4">—</span>
            <span>No change detected yet</span>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Weight Goal Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        {goal && currentWeight ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current</p>
                <p className="text-2xl font-bold">{currentWeight} kg</p>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center">
                  {goal.target_weight < goal.start_weight ? 
                    <TrendingDown className="h-4 w-4" /> : 
                    <TrendingUp className="h-4 w-4" />
                  }
                </div>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Goal</p>
                <p className="text-2xl font-bold">{goal.target_weight} kg</p>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className={`h-2 ${progressColor}`} />
            </div>
            
            {getStatusContent()}
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Goal insights:</p>
              <ul className="text-sm space-y-1">
                <li>Total change: {Math.abs(insights.total_change).toFixed(1)} kg {insights.total_change < 0 ? 'gained' : 'lost'}</li>
                <li>Weekly average: {Math.abs(insights.average_weekly_change).toFixed(1)} kg {insights.average_weekly_change < 0 ? 'gained' : 'lost'} per week</li>
                {insights.weeks_to_goal !== null && (
                  <li>Estimated time to goal: {insights.weeks_to_goal} {insights.weeks_to_goal === 1 ? 'week' : 'weeks'}</li>
                )}
              </ul>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setTargetWeight('')}
            >
              Update Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set a target weight to track your progress over time.
            </p>
            <div className="space-y-2">
              <Label htmlFor="target-weight">Target Weight (kg)</Label>
              <div className="flex gap-2">
                <Input 
                  id="target-weight" 
                  type="number" 
                  step="0.1"
                  min="30"
                  placeholder="e.g., 70.5"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                />
                <Button onClick={handleSetGoal}>Set Goal</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

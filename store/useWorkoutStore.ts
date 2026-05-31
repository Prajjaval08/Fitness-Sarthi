"use client"
import { create } from "zustand"
type WorkoutState={activeExercise:number;completedSets:number;nextSet:()=>void;nextExercise:()=>void;reset:()=>void}
export const useWorkoutStore=create<WorkoutState>((set)=>({activeExercise:0,completedSets:0,nextSet:()=>set(s=>({completedSets:s.completedSets+1})),nextExercise:()=>set(s=>({activeExercise:s.activeExercise+1,completedSets:0})),reset:()=>set({activeExercise:0,completedSets:0})}))

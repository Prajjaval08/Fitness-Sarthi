/**
 * Idempotent seed: safe to run on every deploy (uses upsert on unique names).
 *
 * Run: npx prisma db seed
 */
import { PrismaClient, DifficultyLevel } from "@prisma/client";

const prisma = new PrismaClient();

interface SeedExercise {
  name: string;
  nameHindi?: string;
  description?: string;
  muscleGroups: string[];
  equipment: string[];
  difficulty: DifficultyLevel;
  caloriesPerMin?: number;
}

const EXERCISES: SeedExercise[] = [
  { name: "Push-Up", nameHindi: "पुश-अप", description: "Chest, shoulders and triceps builder. Keep your core tight.", muscleGroups: ["Chest", "Shoulders", "Triceps"], equipment: ["Bodyweight"], difficulty: "BEGINNER", caloriesPerMin: 7 },
  { name: "Bodyweight Squat", nameHindi: "स्क्वाट", description: "Fundamental leg movement. Sit back, chest up.", muscleGroups: ["Quads", "Glutes", "Hamstrings"], equipment: ["Bodyweight"], difficulty: "BEGINNER", caloriesPerMin: 8 },
  { name: "Plank", nameHindi: "प्लैंक", description: "Core stability hold. Don't let hips sag.", muscleGroups: ["Core", "Abs"], equipment: ["Bodyweight"], difficulty: "BEGINNER", caloriesPerMin: 5 },
  { name: "Jumping Jacks", nameHindi: "जंपिंग जैक", description: "Full-body warm-up cardio.", muscleGroups: ["Cardio", "Full Body"], equipment: ["Bodyweight"], difficulty: "BEGINNER", caloriesPerMin: 10 },
  { name: "Mountain Climbers", nameHindi: "माउंटेन क्लाइंबर", description: "Core + cardio burner.", muscleGroups: ["Core", "Cardio"], equipment: ["Bodyweight"], difficulty: "INTERMEDIATE", caloriesPerMin: 11 },
  { name: "Lunges", nameHindi: "लंजेस", description: "Single-leg strength and balance.", muscleGroups: ["Quads", "Glutes"], equipment: ["Bodyweight"], difficulty: "BEGINNER", caloriesPerMin: 8 },
  { name: "Dumbbell Bench Press", nameHindi: "डम्बल बेंच प्रेस", description: "Chest mass builder. Control the negative.", muscleGroups: ["Chest", "Shoulders", "Triceps"], equipment: ["Dumbbells", "Bench"], difficulty: "INTERMEDIATE", caloriesPerMin: 7 },
  { name: "Bent-Over Row", nameHindi: "बेंट-ओवर रो", description: "Back thickness. Squeeze shoulder blades.", muscleGroups: ["Back", "Biceps"], equipment: ["Dumbbells"], difficulty: "INTERMEDIATE", caloriesPerMin: 8 },
  { name: "Overhead Press", nameHindi: "ओवरहेड प्रेस", description: "Shoulder strength. Brace your core.", muscleGroups: ["Shoulders", "Triceps"], equipment: ["Dumbbells"], difficulty: "INTERMEDIATE", caloriesPerMin: 8 },
  { name: "Romanian Deadlift", nameHindi: "डेडलिफ्ट", description: "Hamstring and glute power. Hinge at hips.", muscleGroups: ["Hamstrings", "Glutes", "Back"], equipment: ["Dumbbells"], difficulty: "ADVANCED", caloriesPerMin: 9 },
  { name: "Bicep Curl", nameHindi: "बाइसेप कर्ल", description: "Arm isolation. No swinging.", muscleGroups: ["Biceps"], equipment: ["Dumbbells"], difficulty: "BEGINNER", caloriesPerMin: 6 },
  { name: "Tricep Dip", nameHindi: "ट्राइसेप डिप", description: "Tricep mass using bodyweight.", muscleGroups: ["Triceps", "Shoulders"], equipment: ["Bench", "Chair"], difficulty: "INTERMEDIATE", caloriesPerMin: 7 },
  { name: "Russian Twist", nameHindi: "रशियन ट्विस्ट", description: "Oblique rotation core work.", muscleGroups: ["Core", "Obliques"], equipment: ["Bodyweight"], difficulty: "INTERMEDIATE", caloriesPerMin: 8 },
  { name: "Burpees", nameHindi: "बर्पीज़", description: "Full-body conditioning. Explode up.", muscleGroups: ["Full Body", "Cardio"], equipment: ["Bodyweight"], difficulty: "ADVANCED", caloriesPerMin: 13 },
];

interface SeedWorkoutExercise {
  exercise: string;
  sets: number;
  reps?: number;
  durationSec?: number;
  restSec: number;
}

interface SeedWorkout {
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  durationMins: number;
  category: string;
  thumbnailUrl: string;
  exercises: SeedWorkoutExercise[];
}

const WORKOUTS: SeedWorkout[] = [
  {
    title: "Upper Body Power",
    description: "Build pressing strength across chest, shoulders and triceps.",
    difficulty: "INTERMEDIATE",
    durationMins: 45,
    category: "Strength",
    thumbnailUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    exercises: [
      { exercise: "Push-Up", sets: 3, reps: 15, restSec: 45 },
      { exercise: "Dumbbell Bench Press", sets: 4, reps: 12, restSec: 60 },
      { exercise: "Overhead Press", sets: 4, reps: 10, restSec: 60 },
      { exercise: "Bent-Over Row", sets: 4, reps: 12, restSec: 60 },
      { exercise: "Bicep Curl", sets: 3, reps: 14, restSec: 45 },
      { exercise: "Tricep Dip", sets: 3, reps: 12, restSec: 45 },
    ],
  },
  {
    title: "Full Body Burn",
    description: "Strength meets cardio. Torch calories head to toe.",
    difficulty: "ADVANCED",
    durationMins: 35,
    category: "Strength",
    thumbnailUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    exercises: [
      { exercise: "Jumping Jacks", sets: 2, durationSec: 60, restSec: 30 },
      { exercise: "Bodyweight Squat", sets: 4, reps: 20, restSec: 45 },
      { exercise: "Push-Up", sets: 4, reps: 15, restSec: 45 },
      { exercise: "Mountain Climbers", sets: 3, durationSec: 45, restSec: 30 },
      { exercise: "Burpees", sets: 3, reps: 10, restSec: 60 },
      { exercise: "Plank", sets: 3, durationSec: 60, restSec: 30 },
    ],
  },
  {
    title: "Morning Mobility",
    description: "Gentle movement to wake up joints and ease stiffness.",
    difficulty: "BEGINNER",
    durationMins: 20,
    category: "Recovery",
    thumbnailUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    exercises: [
      { exercise: "Jumping Jacks", sets: 2, durationSec: 45, restSec: 20 },
      { exercise: "Bodyweight Squat", sets: 2, reps: 15, restSec: 30 },
      { exercise: "Lunges", sets: 2, reps: 10, restSec: 30 },
      { exercise: "Plank", sets: 2, durationSec: 45, restSec: 30 },
      { exercise: "Mountain Climbers", sets: 2, durationSec: 30, restSec: 30 },
    ],
  },
  {
    title: "Leg Day Builder",
    description: "Quads, glutes and hamstrings. Walk out stronger.",
    difficulty: "INTERMEDIATE",
    durationMins: 50,
    category: "Strength",
    thumbnailUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=800&q=80",
    exercises: [
      { exercise: "Bodyweight Squat", sets: 4, reps: 20, restSec: 60 },
      { exercise: "Romanian Deadlift", sets: 4, reps: 12, restSec: 75 },
      { exercise: "Lunges", sets: 3, reps: 12, restSec: 60 },
      { exercise: "Mountain Climbers", sets: 3, durationSec: 40, restSec: 30 },
      { exercise: "Plank", sets: 3, durationSec: 60, restSec: 30 },
    ],
  },
  {
    title: "Core Crusher",
    description: "Abs, obliques and deep stability in 25 focused minutes.",
    difficulty: "ADVANCED",
    durationMins: 25,
    category: "Core",
    thumbnailUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80",
    exercises: [
      { exercise: "Plank", sets: 4, durationSec: 60, restSec: 30 },
      { exercise: "Russian Twist", sets: 4, reps: 20, restSec: 30 },
      { exercise: "Mountain Climbers", sets: 3, durationSec: 45, restSec: 30 },
      { exercise: "Burpees", sets: 2, reps: 8, restSec: 60 },
    ],
  },
  {
    title: "Home HIIT Express",
    description: "No equipment, no excuses. 18 minutes of fire.",
    difficulty: "BEGINNER",
    durationMins: 18,
    category: "Cardio",
    thumbnailUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=80",
    exercises: [
      { exercise: "Jumping Jacks", sets: 3, durationSec: 45, restSec: 15 },
      { exercise: "Bodyweight Squat", sets: 3, reps: 15, restSec: 20 },
      { exercise: "Push-Up", sets: 3, reps: 12, restSec: 20 },
      { exercise: "Mountain Climbers", sets: 3, durationSec: 40, restSec: 20 },
      { exercise: "Plank", sets: 2, durationSec: 45, restSec: 20 },
    ],
  },
];

const CHALLENGES = [
  {
    title: "10K Steps Showdown",
    description: "Walk 70,000 steps this week. Small steps, big win.",
    goal: "Complete 70,000 steps in 7 days",
    rewardXP: 500,
    days: 7,
  },
  {
    title: "21-Day Consistency",
    description: "Log 12 workouts in 21 days. Show up, that's the whole game.",
    goal: "Log 12 workouts in 21 days",
    rewardXP: 1000,
    days: 21,
  },
  {
    title: "Protein Power Week",
    description: "Hit your protein target 7 days straight.",
    goal: "Log 80g+ protein daily for 7 days",
    rewardXP: 750,
    days: 7,
  },
];

async function main() {
  console.log("Seeding exercises...");
  for (const e of EXERCISES) {
    const existing = await prisma.exercise.findFirst({
      where: { name: e.name },
    });
    if (!existing) {
      await prisma.exercise.create({ data: e });
    }
  }

  // Exercise name is not @unique in the schema, so look up IDs for wiring.
  const exerciseRows = await prisma.exercise.findMany({
    select: { id: true, name: true },
  });
  const exerciseIdByName = new Map(exerciseRows.map((r) => [r.name, r.id]));

  console.log("Seeding workouts...");
  for (const w of WORKOUTS) {
    const existing = await prisma.workout.findFirst({
      where: { title: w.title },
    });
    const workout =
      existing ??
      (await prisma.workout.create({
        data: {
          title: w.title,
          description: w.description,
          difficulty: w.difficulty,
          durationMins: w.durationMins,
          category: w.category,
          thumbnailUrl: w.thumbnailUrl,
        },
      }));

    const count = await prisma.workoutExercise.count({
      where: { workoutId: workout.id },
    });
    if (count === 0) {
      await prisma.workoutExercise.createMany({
        data: w.exercises.map((we, i) => ({
          workoutId: workout.id,
          exerciseId: exerciseIdByName.get(we.exercise)!,
          sets: we.sets,
          reps: we.reps,
          durationSec: we.durationSec,
          restSec: we.restSec,
          order: i + 1,
        })),
      });
    }
  }

  console.log("Seeding challenges...");
  const now = new Date();
  for (const c of CHALLENGES) {
    const existing = await prisma.challenge.findFirst({
      where: { title: c.title },
    });
    if (!existing) {
      const end = new Date(now);
      end.setDate(end.getDate() + c.days);
      await prisma.challenge.create({
        data: {
          title: c.title,
          description: c.description,
          goal: c.goal,
          rewardXP: c.rewardXP,
          startDate: now,
          endDate: end,
        },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

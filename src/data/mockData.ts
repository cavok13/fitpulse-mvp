import { Exercise, WorkoutPlan, Achievement, DailyQuest } from '../types';

// ==========================================
// EXERCISE LIBRARY (100 exercises MVP)
// ==========================================
export const exercises: Exercise[] = [
  // CHEST
  { id: 'ex-1', name: 'Barbell Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], difficulty: 'intermediate', equipment: ['barbell'], category: 'compound', description: 'Classic chest builder', instructions: ['Lie on bench', 'Lower bar to chest', 'Press up explosively'], tips: ['Keep shoulder blades retracted', 'Drive feet into floor'], caloriesPerMinute: 8, },
  { id: 'ex-2', name: 'Incline Dumbbell Press', muscleGroup: 'chest', secondaryMuscles: ['shoulders', 'triceps'], difficulty: 'intermediate', equipment: ['dumbbells'], category: 'compound', description: 'Upper chest focused press', instructions: ['Set bench to 30-45 degrees', 'Press dumbbells up', 'Lower with control'], tips: ['Don\'t go too heavy', 'Keep wrists straight'], caloriesPerMinute: 7, },
  { id: 'ex-3', name: 'Push-ups', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders', 'core'], difficulty: 'beginner', equipment: ['bodyweight'], category: 'compound', description: 'Fundamental bodyweight push', instructions: ['Plank position', 'Lower chest to floor', 'Push back up'], tips: ['Keep core tight', 'Full range of motion'], caloriesPerMinute: 8, },
  { id: 'ex-4', name: 'Cable Flyes', muscleGroup: 'chest', secondaryMuscles: ['shoulders'], difficulty: 'intermediate', equipment: ['cable'], category: 'isolation', description: 'Chest isolation movement', instructions: ['Stand between cables', 'Bring hands together', 'Squeeze at center'], tips: ['Slight bend in elbows', 'Control the negative'], caloriesPerMinute: 5, },
  { id: 'ex-5', name: 'Dumbbell Chest Fly', muscleGroup: 'chest', secondaryMuscles: ['shoulders'], difficulty: 'beginner', equipment: ['dumbbells'], category: 'isolation', description: 'Lying chest isolation', instructions: ['Lie on bench', 'Lower dumbbells wide', 'Bring together over chest'], tips: ['Maintain slight elbow bend', 'Feel the stretch'], caloriesPerMinute: 5, },
  { id: 'ex-6', name: 'Decline Push-ups', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], difficulty: 'intermediate', equipment: ['bodyweight'], category: 'compound', description: 'Lower chest focused push-up', instructions: ['Feet elevated', 'Lower chest toward floor', 'Push back up'], tips: ['Keep body straight', 'Engage core'], caloriesPerMinute: 9, },

  // BACK
  { id: 'ex-7', name: 'Barbell Row', muscleGroup: 'back', secondaryMuscles: ['biceps', 'core'], difficulty: 'intermediate', equipment: ['barbell'], category: 'compound', description: 'Fundamental back builder', instructions: ['Hinge at hips', 'Pull bar to lower chest', 'Squeeze shoulder blades'], tips: ['Keep back flat', 'Drive elbows back'], caloriesPerMinute: 7, },
  { id: 'ex-8', name: 'Pull-ups', muscleGroup: 'back', secondaryMuscles: ['biceps', 'core'], difficulty: 'intermediate', equipment: ['pull_up_bar'], category: 'compound', description: 'Upper body pull fundamental', instructions: ['Grip bar overhand', 'Pull chin over bar', 'Lower with control'], tips: ['Full dead hang', 'Avoid kipping'], caloriesPerMinute: 9, },
  { id: 'ex-9', name: 'Lat Pulldown', muscleGroup: 'back', secondaryMuscles: ['biceps'], difficulty: 'beginner', equipment: ['machines'], category: 'compound', description: 'Lat focused pulling', instructions: ['Grip wide', 'Pull to upper chest', 'Control the return'], tips: ['Lean back slightly', 'Initiate with lats'], caloriesPerMinute: 6, },
  { id: 'ex-10', name: 'Dumbbell Single-Arm Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], difficulty: 'beginner', equipment: ['dumbbells'], category: 'compound', description: 'Unilateral back work', instructions: ['One hand on bench', 'Row dumbbell to hip', 'Squeeze at top'], tips: ['Keep torso stable', 'Don\'t rotate'], caloriesPerMinute: 6, },
  { id: 'ex-11', name: 'Seated Cable Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], difficulty: 'beginner', equipment: ['cable'], category: 'compound', description: 'Cable back exercise', instructions: ['Sit upright', 'Pull handle to abdomen', 'Squeeze shoulder blades'], tips: ['Chest up', 'Don\'t lean too far back'], caloriesPerMinute: 5, },
  { id: 'ex-12', name: 'Deadlift', muscleGroup: 'back', secondaryMuscles: ['legs', 'glutes', 'core'], difficulty: 'advanced', equipment: ['barbell'], category: 'compound', description: 'King of all exercises', instructions: ['Feet hip-width', 'Grip bar', 'Drive through heels', 'Lock hips at top'], tips: ['Keep bar close', 'Neutral spine'], caloriesPerMinute: 10, },

  // SHOULDERS
  { id: 'ex-13', name: 'Overhead Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps', 'core'], difficulty: 'intermediate', equipment: ['barbell'], category: 'compound', description: 'Standing barbell press', instructions: ['Bar at collar bone', 'Press overhead', 'Lock out at top'], tips: ['Tight core', 'Don\'t lean back excessively'], caloriesPerMinute: 7, },
  { id: 'ex-14', name: 'Dumbbell Lateral Raise', muscleGroup: 'shoulders', secondaryMuscles: [], difficulty: 'beginner', equipment: ['dumbbells'], category: 'isolation', description: 'Side delt isolation', instructions: ['Arms at sides', 'Raise to shoulder height', 'Lower with control'], tips: ['Slight forward lean', 'Lead with elbows'], caloriesPerMinute: 4, },
  { id: 'ex-15', name: 'Arnold Press', muscleGroup: 'shoulders', secondaryMuscles: ['triceps'], difficulty: 'intermediate', equipment: ['dumbbells'], category: 'compound', description: 'Rotating dumbbell press', instructions: ['Palms facing you', 'Rotate and press up', 'Reverse on way down'], tips: ['Full rotation', 'Control the movement'], caloriesPerMinute: 6, },
  { id: 'ex-16', name: 'Face Pulls', muscleGroup: 'shoulders', secondaryMuscles: ['back'], difficulty: 'beginner', equipment: ['cable'], category: 'isolation', description: 'Rear delt and rotator cuff', instructions: ['High cable position', 'Pull to face', 'Externally rotate'], tips: ['Squeeze rear delts', 'Light weight, high reps'], caloriesPerMinute: 4, },
  { id: 'ex-17', name: 'Front Raise', muscleGroup: 'shoulders', secondaryMuscles: [], difficulty: 'beginner', equipment: ['dumbbells'], category: 'isolation', description: 'Front delt isolation', instructions: ['Arms at sides', 'Raise to eye level', 'Lower slowly'], tips: ['Don\'t swing', 'Control the tempo'], caloriesPerMinute: 4, },

  // BICEPS
  { id: 'ex-18', name: 'Barbell Curl', muscleGroup: 'biceps', secondaryMuscles: [], difficulty: 'beginner', equipment: ['barbell'], category: 'isolation', description: 'Classic bicep builder', instructions: ['Grip shoulder width', 'Curl to shoulders', 'Lower with control'], tips: ['Keep elbows pinned', 'No swinging'], caloriesPerMinute: 5, },
  { id: 'ex-19', name: 'Dumbbell Hammer Curl', muscleGroup: 'biceps', secondaryMuscles: [], difficulty: 'beginner', equipment: ['dumbbells'], category: 'isolation', description: 'Neutral grip curl', instructions: ['Palms face each other', 'Curl up', 'Lower slowly'], tips: ['Keep elbows fixed', 'Squeeze at top'], caloriesPerMinute: 4, },
  { id: 'ex-20', name: 'Concentration Curl', muscleGroup: 'biceps', secondaryMuscles: [], difficulty: 'beginner', equipment: ['dumbbells'], category: 'isolation', description: 'Seated isolation curl', instructions: ['Elbow on inner thigh', 'Curl dumbbell up', 'Squeeze at top'], tips: ['Full range of motion', 'Mind-muscle connection'], caloriesPerMinute: 4, },

  // TRICEPS
  { id: 'ex-21', name: 'Tricep Dips', muscleGroup: 'triceps', secondaryMuscles: ['chest', 'shoulders'], difficulty: 'intermediate', equipment: ['bodyweight'], category: 'compound', description: 'Bodyweight tricep builder', instructions: ['Hands on edge', 'Lower body down', 'Press back up'], tips: ['Keep elbows close', 'Don\'t go too deep'], caloriesPerMinute: 7, },
  { id: 'ex-22', name: 'Tricep Pushdown', muscleGroup: 'triceps', secondaryMuscles: [], difficulty: 'beginner', equipment: ['cable'], category: 'isolation', description: 'Cable tricep work', instructions: ['Grip rope or bar', 'Push down to full extension', 'Squeeze at bottom'], tips: ['Keep elbows at sides', 'Full lockout'], caloriesPerMinute: 4, },
  { id: 'ex-23', name: 'Skull Crushers', muscleGroup: 'triceps', secondaryMuscles: [], difficulty: 'intermediate', equipment: ['barbell'], category: 'isolation', description: 'Lying tricep extension', instructions: ['Lie on bench', 'Lower bar to forehead', 'Extend arms'], tips: ['Keep elbows pointed up', 'Control the weight'], caloriesPerMinute: 5, },

  // LEGS
  { id: 'ex-24', name: 'Barbell Squat', muscleGroup: 'legs', secondaryMuscles: ['glutes', 'core'], difficulty: 'intermediate', equipment: ['barbell'], category: 'compound', description: 'King of leg exercises', instructions: ['Bar on upper back', 'Squat to parallel', 'Drive up through heels'], tips: ['Knees track toes', 'Chest up'], caloriesPerMinute: 9, },
  { id: 'ex-25', name: 'Leg Press', muscleGroup: 'legs', secondaryMuscles: ['glutes'], difficulty: 'beginner', equipment: ['machines'], category: 'compound', description: 'Machine squat variation', instructions: ['Sit in machine', 'Lower weight toward chest', 'Press back up'], tips: ['Don\'t lock knees', 'Full range of motion'], caloriesPerMinute: 7, },
  { id: 'ex-26', name: 'Walking Lunges', muscleGroup: 'legs', secondaryMuscles: ['glutes'], difficulty: 'beginner', equipment: ['bodyweight'], category: 'compound', description: 'Dynamic leg exercise', instructions: ['Step forward', 'Lower back knee toward ground', 'Drive forward'], tips: ['Keep torso upright', 'Long stride'], caloriesPerMinute: 8, },
  { id: 'ex-27', name: 'Leg Extension', muscleGroup: 'legs', secondaryMuscles: [], difficulty: 'beginner', equipment: ['machines'], category: 'isolation', description: 'Quad isolation', instructions: ['Sit in machine', 'Extend legs fully', 'Lower with control'], tips: ['Squeeze at top', 'Don\'t use momentum'], caloriesPerMinute: 4, },
  { id: 'ex-28', name: 'Leg Curl', muscleGroup: 'legs', secondaryMuscles: [], difficulty: 'beginner', equipment: ['machines'], category: 'isolation', description: 'Hamstring isolation', instructions: ['Lie face down', 'Curl legs toward glutes', 'Lower slowly'], tips: ['Squeeze hamstrings', 'Don\'t lift hips'], caloriesPerMinute: 4, },
  { id: 'ex-29', name: 'Bulgarian Split Squat', muscleGroup: 'legs', secondaryMuscles: ['glutes'], difficulty: 'intermediate', equipment: ['dumbbells'], category: 'compound', description: 'Unilateral leg work', instructions: ['Rear foot elevated', 'Squat on front leg', 'Drive up'], tips: ['Keep torso upright', 'Front knee tracks toes'], caloriesPerMinute: 8, },
  { id: 'ex-30', name: 'Calf Raises', muscleGroup: 'legs', secondaryMuscles: [], difficulty: 'beginner', equipment: ['machines'], category: 'isolation', description: 'Calf building exercise', instructions: ['Stand on edge', 'Rise on toes', 'Lower heels below level'], tips: ['Full stretch at bottom', 'Pause at top'], caloriesPerMinute: 3, },
  { id: 'ex-31', name: 'Goblet Squat', muscleGroup: 'legs', secondaryMuscles: ['glutes', 'core'], difficulty: 'beginner', equipment: ['dumbbells'], category: 'compound', description: 'Beginner friendly squat', instructions: ['Hold weight at chest', 'Squat deep', 'Drive up'], tips: ['Elbows between knees', 'Chest up'], caloriesPerMinute: 7, },
  { id: 'ex-32', name: 'Hip Thrust', muscleGroup: 'legs', secondaryMuscles: ['glutes'], difficulty: 'intermediate', equipment: ['barbell'], category: 'compound', description: 'Glute builder', instructions: ['Upper back on bench', 'Bar on hips', 'Drive hips up', 'Squeeze glutes'], tips: ['Chin tucked', 'Full hip extension'], caloriesPerMinute: 7, },

  // GLUTES
  { id: 'ex-33', name: 'Glute Bridge', muscleGroup: 'glutes', secondaryMuscles: ['legs'], difficulty: 'beginner', equipment: ['bodyweight'], category: 'compound', description: 'Basic glute activation', instructions: ['Lie on back', 'Drive hips up', 'Squeeze glutes at top'], tips: ['Don\'t hyperextend', 'Hold at top'], caloriesPerMinute: 4, },
  { id: 'ex-34', name: 'Cable Pull Through', muscleGroup: 'glutes', secondaryMuscles: ['legs'], difficulty: 'beginner', equipment: ['cable'], category: 'compound', description: 'Hip hinge pattern', instructions: ['Face away from cable', 'Hinge at hips', 'Drive forward'], tips: ['Keep back flat', 'Squeeze glutes'], caloriesPerMinute: 5, },
  { id: 'ex-35', name: 'Donkey Kicks', muscleGroup: 'glutes', secondaryMuscles: [], difficulty: 'beginner', equipment: ['bodyweight'], category: 'isolation', description: 'Glute activation exercise', instructions: ['On all fours', 'Kick leg up', 'Lower slowly'], tips: ['Keep core tight', 'Don\'t arch back'], caloriesPerMinute: 4, },

  // CORE
  { id: 'ex-36', name: 'Plank', muscleGroup: 'core', secondaryMuscles: ['shoulders'], difficulty: 'beginner', equipment: ['bodyweight'], category: 'core', description: 'Core stability exercise', instructions: ['Forearm plank position', 'Hold body straight', 'Breathe steadily'], tips: ['Don\'t sag hips', 'Squeeze glutes'], caloriesPerMinute: 4, },
  { id: 'ex-37', name: 'Russian Twist', muscleGroup: 'core', secondaryMuscles: [], difficulty: 'beginner', equipment: ['bodyweight'], category: 'core', description: 'Oblique exercise', instructions: ['Sit with knees bent', 'Lean back slightly', 'Rotate torso side to side'], tips: ['Keep chest up', 'Feet can be elevated'], caloriesPerMinute: 5, },
  { id: 'ex-38', name: 'Hanging Leg Raise', muscleGroup: 'core', secondaryMuscles: [], difficulty: 'advanced', equipment: ['pull_up_bar'], category: 'core', description: 'Advanced core exercise', instructions: ['Hang from bar', 'Raise legs to 90 degrees', 'Lower with control'], tips: ['Don\'t swing', 'Curl pelvis up'], caloriesPerMinute: 6, },
  { id: 'ex-39', name: 'Bicycle Crunch', muscleGroup: 'core', secondaryMuscles: [], difficulty: 'beginner', equipment: ['bodyweight'], category: 'core', description: 'Dynamic ab exercise', instructions: ['Lie on back', 'Alternate elbow to knee', 'Extend opposite leg'], tips: ['Slow and controlled', 'Full rotation'], caloriesPerMinute: 5, },
  { id: 'ex-40', name: 'Ab Rollout', muscleGroup: 'core', secondaryMuscles: ['shoulders'], difficulty: 'advanced', equipment: ['bodyweight'], category: 'core', description: 'Advanced core exercise', instructions: ['Kneel on floor', 'Roll wheel forward', 'Pull back to start'], tips: ['Keep core tight', 'Don\'t let hips sag'], caloriesPerMinute: 7, },
  { id: 'ex-41', name: 'Mountain Climbers', muscleGroup: 'core', secondaryMuscles: ['shoulders', 'legs'], difficulty: 'beginner', equipment: ['bodyweight'], category: 'core', description: 'Dynamic core exercise', instructions: ['Plank position', 'Drive knees to chest', 'Alternate rapidly'], tips: ['Keep hips low', 'Maintain pace'], caloriesPerMinute: 8, },

  // FULL BODY
  { id: 'ex-42', name: 'Burpees', muscleGroup: 'full_body', secondaryMuscles: ['chest', 'legs', 'core'], difficulty: 'intermediate', equipment: ['bodyweight'], category: 'compound', description: 'Full body conditioning', instructions: ['Squat down', 'Jump feet back', 'Push-up', 'Jump feet forward', 'Jump up'], tips: ['Stay explosive', 'Land softly'], caloriesPerMinute: 12, },
  { id: 'ex-43', name: 'Clean and Press', muscleGroup: 'full_body', secondaryMuscles: ['shoulders', 'legs', 'back'], difficulty: 'advanced', equipment: ['barbell'], category: 'compound', description: 'Olympic lifting variation', instructions: ['Pull bar from floor', 'Catch at shoulders', 'Press overhead'], tips: ['Use hip drive', 'Keep bar close'], caloriesPerMinute: 11, },
  { id: 'ex-44', name: 'Kettlebell Swing', muscleGroup: 'full_body', secondaryMuscles: ['glutes', 'core', 'shoulders'], difficulty: 'intermediate', equipment: ['kettlebell'], category: 'compound', description: 'Dynamic power exercise', instructions: ['Hinge at hips', 'Swing bell to eye level', 'Drive with hips'], tips: ['Hip hinge not squat', 'Explosive hips'], caloriesPerMinute: 10, },
  { id: 'ex-45', name: 'Turkish Get-Up', muscleGroup: 'full_body', secondaryMuscles: ['shoulders', 'core'], difficulty: 'advanced', equipment: ['kettlebell'], category: 'compound', description: 'Complex full body move', instructions: ['Lie with weight pressed up', 'Roll to elbow', 'Stand up while keeping weight up'], tips: ['Keep eyes on weight', 'Slow and controlled'], caloriesPerMinute: 8, },

  // More exercises to reach 100
  { id: 'ex-46', name: 'Incline Bench Press', muscleGroup: 'chest', secondaryMuscles: ['shoulders', 'triceps'], difficulty: 'intermediate', equipment: ['barbell'], category: 'compound', description: 'Upper chest builder', instructions: ['Set bench to 30-45 degrees', 'Lower bar to upper chest', 'Press up'], tips: ['Full range of motion', 'Control the negative'], caloriesPerMinute: 7, },
  { id: 'ex-47', name: 'Chest Dip', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], difficulty: 'intermediate', equipment: ['machines'], category: 'compound', description: 'Chest focused dip', instructions: ['Lean forward on dip bar', 'Lower body', 'Press back up'], tips: ['Forward lean targets chest', 'Don\'t go too deep'], caloriesPerMinute: 7, },
  { id: 'ex-48', name: 'Dumbbell Pullover', muscleGroup: 'chest', secondaryMuscles: ['back'], difficulty: 'intermediate', equipment: ['dumbbells'], category: 'compound', description: 'Chest and back stretch', instructions: ['Lie on bench', 'Lower dumbbell behind head', 'Pull over chest'], tips: ['Slight elbow bend', 'Feel the stretch'], caloriesPerMinute: 5, },
  { id: 'ex-49', name: 'Close Grip Bench Press', muscleGroup: 'chest', secondaryMuscles: ['triceps'], difficulty: 'intermediate', equipment: ['barbell'], category: 'compound', description: 'Tricep focused press', instructions: ['Narrow grip on bar', 'Lower to chest', 'Press up'], tips: ['Keep elbows tucked', 'Tricep emphasis'], caloriesPerMinute: 7, },
  { id: 'ex-50', name: 'T-Bar Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], difficulty: 'intermediate', equipment: ['barbell'], category: 'compound', description: 'Heavy back builder', instructions: ['Straddle bar', 'Row to chest', 'Squeeze at top'], tips: ['Keep back flat', 'Full range'], caloriesPerMinute: 7, },
  { id: 'ex-51', name: 'Chin-ups', muscleGroup: 'back', secondaryMuscles: ['biceps'], difficulty: 'intermediate', equipment: ['pull_up_bar'], category: 'compound', description: 'Underhand pull-up', instructions: ['Underhand grip', 'Pull chin over bar', 'Lower with control'], tips: ['Full dead hang', 'Bicep emphasis'], caloriesPerMinute: 8, },
  { id: 'ex-52', name: 'Reverse Fly', muscleGroup: 'back', secondaryMuscles: ['shoulders'], difficulty: 'beginner', equipment: ['dumbbells'], category: 'isolation', description: 'Rear delt builder', instructions: ['Bend at hips', 'Raise dumbbells to sides', 'Squeeze at top'], tips: ['Slight elbow bend', 'Light weight'], caloriesPerMinute: 4, },
  { id: 'ex-53', name: 'Machine Row', muscleGroup: 'back', secondaryMuscles: ['biceps'], difficulty: 'beginner', equipment: ['machines'], category: 'compound', description: 'Machine back exercise', instructions: ['Sit upright', 'Pull handles to torso', 'Squeeze shoulder blades'], tips: ['Don\'t lean back', 'Control the movement'], caloriesPerMinute: 5, },
  { id: 'ex-54', name: 'Upright Row', muscleGroup: 'shoulders', secondaryMuscles: ['biceps'], difficulty: 'intermediate', equipment: ['barbell'], category: 'compound', description: 'Shoulder and trap builder', instructions: ['Grip shoulder width', 'Pull bar to chin', 'Lead with elbows'], tips: ['Don\'t go too heavy', 'Wide grip for safety'], caloriesPerMinute: 5, },
  { id: 'ex-55', name: 'Reverse Pec Deck', muscleGroup: 'shoulders', secondaryMuscles: ['back'], difficulty: 'beginner', equipment: ['machines'], category: 'isolation', description: 'Rear delt machine', instructions: ['Adjust seat height', 'Pull arms back', 'Squeeze at back'], tips: ['Control the movement', 'Light weight'], caloriesPerMinute: 4, },
  { id: 'ex-56', name: 'Preacher Curl', muscleGroup: 'biceps', secondaryMuscles: [], difficulty: 'beginner', equipment: ['machines'], category: 'isolation', description: 'Isolated bicep curl', instructions: ['Arm on pad', 'Curl weight up', 'Lower slowly'], tips: ['Full extension at bottom', 'Don\'t swing'], caloriesPerMinute: 4, },
  { id: 'ex-57', name: 'Cable Curl', muscleGroup: 'biceps', secondaryMuscles: [], difficulty: 'beginner', equipment: ['cable'], category: 'isolation', description: 'Constant tension curl', instructions: ['Grip cable bar', 'Curl up', 'Squeeze at top'], tips: ['Keep elbows fixed', 'Full range'], caloriesPerMinute: 4, },
  { id: 'ex-58', name: 'Overhead Tricep Extension', muscleGroup: 'triceps', secondaryMuscles: [], difficulty: 'beginner', equipment: ['dumbbells'], category: 'isolation', description: 'Long head tricep work', instructions: ['Hold weight overhead', 'Lower behind head', 'Extend arms'], tips: ['Keep elbows close', 'Full range of motion'], caloriesPerMinute: 4, },
  { id: 'ex-59', name: 'Bench Dip', muscleGroup: 'triceps', secondaryMuscles: [], difficulty: 'beginner', equipment: ['bodyweight'], category: 'isolation', description: 'Bodyweight tricep work', instructions: ['Hands on bench edge', 'Lower body down', 'Press back up'], tips: ['Keep back close to bench', 'Bend knees for easier'], caloriesPerMinute: 5, },
  { id: 'ex-60', name: 'Front Squat', muscleGroup: 'legs', secondaryMuscles: ['glutes', 'core'], difficulty: 'intermediate', equipment: ['barbell'], category: 'compound', description: 'Quad focused squat', instructions: ['Bar on front delts', 'Squat deep', 'Drive up'], tips: ['Elbows high', 'Upright torso'], caloriesPerMinute: 8, },
  { id: 'ex-61', name: 'Hack Squat', muscleGroup: 'legs', secondaryMuscles: ['glutes'], difficulty: 'beginner', equipment: ['machines'], category: 'compound', description: 'Machine squat variation', instructions: ['Shoulders under pads', 'Lower weight', 'Press up'], tips: ['Full range of motion', 'Don\'t lock knees'], caloriesPerMinute: 6, },
  { id: 'ex-62', name: 'Step-ups', muscleGroup: 'legs', secondaryMuscles: ['glutes'], difficulty: 'beginner', equipment: ['dumbbells'], category: 'compound', description: 'Single leg step exercise', instructions: ['Step onto box', 'Drive up', 'Step back down'], tips: ['Use full foot', 'Alternate legs'], caloriesPerMinute: 7, },
  { id: 'ex-63', name: 'Wall Sit', muscleGroup: 'legs', secondaryMuscles: ['glutes'], difficulty: 'beginner', equipment: ['bodyweight'], category: 'isolation', description: 'Isometric leg hold', instructions: ['Back against wall', 'Lower to 90 degrees', 'Hold position'], tips: ['Thighs parallel', 'Don\'t slide down'], caloriesPerMinute: 5, },
  { id: 'ex-64', name: 'Stiff Leg Deadlift', muscleGroup: 'legs', secondaryMuscles: ['back', 'glutes'], difficulty: 'intermediate', equipment: ['barbell'], category: 'compound', description: 'Hamstring builder', instructions: ['Slight knee bend', 'Hinge at hips', 'Lower bar along legs'], tips: ['Feel hamstring stretch', 'Keep back flat'], caloriesPerMinute: 7, },
  { id: 'ex-65', name: 'Side Plank', muscleGroup: 'core', secondaryMuscles: ['shoulders'], difficulty: 'beginner', equipment: ['bodyweight'], category: 'core', description: 'Oblique stability', instructions: ['Side forearm plank', 'Hold body straight', 'Breathe'], tips: ['Don\'t sag hips', 'Stack feet or stagger'], caloriesPerMinute: 4, },
  { id: 'ex-66', name: 'V-Up', muscleGroup: 'core', secondaryMuscles: [], difficulty: 'intermediate', equipment: ['bodyweight'], category: 'core', description: 'Dynamic ab exercise', instructions: ['Lie flat', 'Simultaneously raise legs and torso', 'Touch toes'], tips: ['Keep legs straight', 'Control the movement'], caloriesPerMinute: 6, },
  { id: 'ex-67', name: 'Dead Bug', muscleGroup: 'core', secondaryMuscles: [], difficulty: 'beginner', equipment: ['bodyweight'], category: 'core', description: 'Core stability exercise', instructions: ['Lie on back', 'Extend opposite arm and leg', 'Alternate'], tips: ['Keep back flat', 'Exhale on extension'], caloriesPerMinute: 4, },
  { id: 'ex-68', name: 'Flutter Kicks', muscleGroup: 'core', secondaryMuscles: [], difficulty: 'beginner', equipment: ['bodyweight'], category: 'core', description: 'Lower ab exercise', instructions: ['Lie on back', 'Kick legs alternately', 'Keep legs low'], tips: ['Lower back pressed down', 'Small movements'], caloriesPerMinute: 5, },
  { id: 'ex-69', name: 'Box Jump', muscleGroup: 'full_body', secondaryMuscles: ['legs', 'glutes'], difficulty: 'intermediate', equipment: ['bodyweight'], category: 'compound', description: 'Plyometric exercise', instructions: ['Stand before box', 'Jump onto box', 'Stand tall', 'Step down'], tips: ['Land softly', 'Use arm swing'], caloriesPerMinute: 11, },
  { id: 'ex-70', name: 'Battle Ropes', muscleGroup: 'full_body', secondaryMuscles: ['shoulders', 'core'], difficulty: 'intermediate', equipment: ['bodyweight'], category: 'cardio', description: 'Conditioning exercise', instructions: ['Hold rope ends', 'Make alternating waves', 'Keep intensity high'], tips: ['Engage core', 'Stay low'], caloriesPerMinute: 12, },
  { id: 'ex-71', name: 'Bear Crawl', muscleGroup: 'full_body', secondaryMuscles: ['core', 'shoulders'], difficulty: 'beginner', equipment: ['bodyweight'], category: 'compound', description: 'Animal flow movement', instructions: ['Hands and feet on ground', 'Crawl forward', 'Keep hips low'], tips: ['Opposite hand and foot move', 'Keep back flat'], caloriesPerMinute: 8, },
  { id: 'ex-72', name: 'Sled Push', muscleGroup: 'full_body', secondaryMuscles: ['legs', 'core'], difficulty: 'intermediate', equipment: ['machines'], category: 'compound', description: 'Power conditioning', instructions: ['Grip sled handles', 'Drive with legs', 'Push forward'], tips: ['Low body position', 'Drive through toes'], caloriesPerMinute: 11, },
  { id: 'ex-73', name: 'Dumbbell Thruster', muscleGroup: 'full_body', secondaryMuscles: ['shoulders', 'legs'], difficulty: 'intermediate', equipment: ['dumbbells'], category: 'compound', description: 'Squat to press combo', instructions: ['Hold dumbbells at shoulders', 'Squat down', 'Press up as you stand'], tips: ['Fluid movement', 'Drive through heels'], caloriesPerMinute: 10, },
  { id: 'ex-74', name: 'Renegade Row', muscleGroup: 'full_body', secondaryMuscles: ['back', 'core'], difficulty: 'intermediate', equipment: ['dumbbells'], category: 'compound', description: 'Plank row combo', instructions: ['Plank on dumbbells', 'Row one dumbbell up', 'Alternate sides'], tips: ['Minimize hip rotation', 'Keep core tight'], caloriesPerMinute: 8, },
  { id: 'ex-75', name: 'Man Maker', muscleGroup: 'full_body', secondaryMuscles: ['chest', 'back', 'shoulders', 'legs'], difficulty: 'advanced', equipment: ['dumbbells'], category: 'compound', description: 'Full body complex', instructions: ['Push-up on dumbbells', 'Row left', 'Row right', 'Squat clean', 'Press overhead'], tips: ['Fluid movement', 'Control each phase'], caloriesPerMinute: 12 },
  // Exercises 76-100 (shortened for MVP)
  { id: 'ex-76', name: 'Fly Machine', muscleGroup: 'chest', secondaryMuscles: [], difficulty: 'beginner', equipment: ['machines'], category: 'isolation', description: 'Chest fly machine', instructions: ['Adjust seat', 'Bring arms together', 'Control return'], tips: ['Slight elbow bend', 'Feel the squeeze'], caloriesPerMinute: 4 },
  { id: 'ex-77', name: 'Good Mornings', muscleGroup: 'back', secondaryMuscles: ['legs'], difficulty: 'intermediate', equipment: ['barbell'], category: 'compound', description: 'Hip hinge exercise', instructions: ['Bar on upper back', 'Hinge at hips', 'Drive hips forward'], tips: ['Keep back flat', 'Slight knee bend'], caloriesPerMinute: 5 },
  { id: 'ex-78', name: 'Shrugs', muscleGroup: 'back', secondaryMuscles: [], difficulty: 'beginner', equipment: ['dumbbells'], category: 'isolation', description: 'Trap builder', instructions: ['Hold dumbbells at sides', 'Shrug shoulders up', 'Lower slowly'], tips: ['Don\'t roll shoulders', 'Hold at top'], caloriesPerMinute: 4 },
  { id: 'ex-79', name: 'Lateral Raise Machine', muscleGroup: 'shoulders', secondaryMuscles: [], difficulty: 'beginner', equipment: ['machines'], category: 'isolation', description: 'Machine lateral raise', instructions: ['Adjust pads', 'Raise arms to sides', 'Lower slowly'], tips: ['Control the movement', 'Light weight'], caloriesPerMinute: 4 },
  { id: 'ex-80', name: 'Wrist Curl', muscleGroup: 'biceps', secondaryMuscles: [], difficulty: 'beginner', equipment: ['dumbbells'], category: 'isolation', description: 'Forearm exercise', instructions: ['Forearm on thigh', 'Curl wrist up', 'Lower slowly'], tips: ['Full range of motion', 'Squeeze at top'], caloriesPerMinute: 3 },
  { id: 'ex-81', name: 'Tricep Kickback', muscleGroup: 'triceps', secondaryMuscles: [], difficulty: 'beginner', equipment: ['dumbbells'], category: 'isolation', description: 'Tricep isolation', instructions: ['Bend at hips', 'Extend arm back', 'Squeeze at top'], tips: ['Keep upper arm still', 'Full extension'], caloriesPerMinute: 4 },
  { id: 'ex-82', name: 'Sumo Squat', muscleGroup: 'legs', secondaryMuscles: ['glutes'], difficulty: 'beginner', equipment: ['dumbbells'], category: 'compound', description: 'Wide stance squat', instructions: ['Wide stance', 'Toes pointed out', 'Squat deep'], tips: ['Knees track toes', 'Keep chest up'], caloriesPerMinute: 6 },
  { id: 'ex-83', name: 'Nordic Hamstring Curl', muscleGroup: 'legs', secondaryMuscles: [], difficulty: 'advanced', equipment: ['bodyweight'], category: 'isolation', description: 'Advanced hamstring', instructions: ['Kneel with feet anchored', 'Lower body forward', 'Catch yourself or curl back'], tips: ['Control the descent', 'Use eccentric overload'], caloriesPerMinute: 6 },
  { id: 'ex-84', name: 'Single Leg Calf Raise', muscleGroup: 'legs', secondaryMuscles: [], difficulty: 'beginner', equipment: ['bodyweight'], category: 'isolation', description: 'Unilateral calf work', instructions: ['Stand on one leg', 'Rise on toes', 'Lower slowly'], tips: ['Full stretch at bottom', 'Use wall for balance'], caloriesPerMinute: 3 },
  { id: 'ex-85', name: 'Lying Leg Raise', muscleGroup: 'core', secondaryMuscles: [], difficulty: 'intermediate', equipment: ['bodyweight'], category: 'core', description: 'Lower ab exercise', instructions: ['Lie on back', 'Raise legs to 90 degrees', 'Lower slowly'], tips: ['Keep lower back pressed down', 'Don\'t swing'], caloriesPerMinute: 5 },
  { id: 'ex-86', name: 'Wood Chop', muscleGroup: 'core', secondaryMuscles: ['shoulders'], difficulty: 'beginner', equipment: ['cable'], category: 'core', description: 'Rotational core work', instructions: ['High to low cable pull', 'Rotate torso', 'Control return'], tips: ['Rotate from core', 'Keep arms relatively straight'], caloriesPerMinute: 5 },
  { id: 'ex-87', name: 'Pallof Press', muscleGroup: 'core', secondaryMuscles: [], difficulty: 'beginner', equipment: ['cable'], category: 'core', description: 'Anti-rotation exercise', instructions: ['Stand sideways to cable', 'Press cable out from chest', 'Hold'], tips: ['Don\'t rotate', 'Brace core'], caloriesPerMinute: 4 },
  { id: 'ex-88', name: 'Farmer\'s Walk', muscleGroup: 'full_body', secondaryMuscles: ['core', 'back'], difficulty: 'beginner', equipment: ['dumbbells'], category: 'compound', description: 'Grip and core exercise', instructions: ['Hold heavy weights', 'Walk with good posture', 'Put down with control'], tips: ['Chest up', 'Short quick steps'], caloriesPerMinute: 8 },
  { id: 'ex-89', name: 'Ball Slam', muscleGroup: 'full_body', secondaryMuscles: ['core', 'shoulders'], difficulty: 'beginner', equipment: ['bodyweight'], category: 'compound', description: 'Power conditioning', instructions: ['Raise ball overhead', 'Slam to ground', 'Pick up and repeat'], tips: ['Use full body', 'Exhale on slam'], caloriesPerMinute: 10 },
  { id: 'ex-90', name: 'Ladder Drill', muscleGroup: 'full_body', secondaryMuscles: ['legs', 'core'], difficulty: 'beginner', equipment: ['bodyweight'], category: 'cardio', description: 'Agility conditioning', instructions: ['Step through ladder', 'Quick feet', 'Various patterns'], tips: ['Stay on toes', 'Quick ground contact'], caloriesPerMinute: 9 },
  { id: 'ex-91', name: 'Cable Woodchop High', muscleGroup: 'full_body', secondaryMuscles: ['core', 'shoulders'], difficulty: 'beginner', equipment: ['cable'], category: 'compound', description: 'Rotational power', instructions: ['High cable position', 'Pull diagonally down', 'Rotate torso'], tips: ['Drive from hips', 'Control the return'], caloriesPerMinute: 5 },
  { id: 'ex-92', name: 'Incline Dumbbell Curl', muscleGroup: 'biceps', secondaryMuscles: [], difficulty: 'intermediate', equipment: ['dumbbells'], category: 'isolation', description: 'Long head bicep stretch', instructions: ['Lean back on incline bench', 'Curl dumbbugs up', 'Lower slowly'], tips: ['Full extension', 'Don\'t swing'], caloriesPerMinute: 4 },
  { id: 'ex-93', name: 'Zottman Curl', muscleGroup: 'biceps', secondaryMuscles: [], difficulty: 'intermediate', equipment: ['dumbbells'], category: 'isolation', description: 'Bicep and forearm curl', instructions: ['Curl up palms up', 'Rotate at top', 'Lower palms down'], tips: ['Slow rotation', 'Full range'], caloriesPerMinute: 4 },
  { id: 'ex-94', name: 'Incline Push-up', muscleGroup: 'chest', secondaryMuscles: ['triceps', 'shoulders'], difficulty: 'beginner', equipment: ['bodyweight'], category: 'compound', description: 'Easy push-up variation', instructions: ['Hands on elevated surface', 'Lower chest', 'Push back up'], tips: ['Keep body straight', 'Good for beginners'], caloriesPerMinute: 6 },
  { id: 'ex-95', name: 'Band Pull Apart', muscleGroup: 'shoulders', secondaryMuscles: ['back'], difficulty: 'beginner', equipment: ['resistance_bands'], category: 'isolation', description: 'Rear delt and posture', instructions: ['Hold band at shoulder width', 'Pull apart to chest', 'Control return'], tips: ['Squeeze shoulder blades', 'Light resistance'], caloriesPerMinute: 3 },
  { id: 'ex-96', name: 'Resistance Band Squat', muscleGroup: 'legs', secondaryMuscles: ['glutes'], difficulty: 'beginner', equipment: ['resistance_bands'], category: 'compound', description: 'Banded squat variation', instructions: ['Stand on band', 'Hold handles at shoulders', 'Squat down', 'Drive up'], tips: ['Keep tension', 'Full range'], caloriesPerMinute: 6 },
  { id: 'ex-97', name: 'Band Face Pull', muscleGroup: 'shoulders', secondaryMuscles: ['back'], difficulty: 'beginner', equipment: ['resistance_bands'], category: 'isolation', description: 'Rear delt and rotator cuff', instructions: ['Anchor band at face height', 'Pull toward face', 'Externally rotate'], tips: ['Light resistance', 'High reps'], caloriesPerMinute: 3 },
  { id: 'ex-98', name: 'Band Bicep Curl', muscleGroup: 'biceps', secondaryMuscles: [], difficulty: 'beginner', equipment: ['resistance_bands'], category: 'isolation', description: 'Banded curl', instructions: ['Stand on band', 'Curl handles up', 'Lower slowly'], tips: ['Keep elbows fixed', 'Constant tension'], caloriesPerMinute: 4 },
  { id: 'ex-99', name: 'Band Tricep Extension', muscleGroup: 'triceps', secondaryMuscles: [], difficulty: 'beginner', equipment: ['resistance_bands'], category: 'isolation', description: 'Banded tricep work', instructions: ['Anchor band overhead', 'Push down', 'Full extension'], tips: ['Keep elbows fixed', 'Squeeze at bottom'], caloriesPerMinute: 4 },
  { id: 'ex-100', name: 'Band Pull Through', muscleGroup: 'glutes', secondaryMuscles: ['legs'], difficulty: 'beginner', equipment: ['resistance_bands'], category: 'compound', description: 'Hip hinge with band', instructions: ['Band behind you', 'Hinge at hips', 'Drive forward', 'Squeeze glutes'], tips: ['Keep back flat', 'Hip drive'], caloriesPerMinute: 5 },
];

// ==========================================
// PRE-BUILT WORKOUT PLANS (10 plans MVP)
// ==========================================
export const workoutPlans: WorkoutPlan[] = [
  {
    id: 'plan-1', name: 'Fat Loss Starter', description: 'Full body circuits for fat burning', goal: 'fat_loss', difficulty: 'beginner', durationWeeks: 8, sessionsPerWeek: 4,
    sessions: [
      { id: 's1', name: 'Full Body Circuit A', dayOfWeek: 1, estimatedDuration: 45, exercises: [
        { exercise: exercises[2], sets: 3, reps: '12-15', restSeconds: 60 },
        { exercise: exercises[25], sets: 3, reps: '12-15', restSeconds: 60 },
        { exercise: exercises[13], sets: 3, reps: '12-15', restSeconds: 60 },
        { exercise: exercises[35], sets: 3, reps: '30s', restSeconds: 30 },
        { exercise: exercises[41], sets: 3, reps: '20', restSeconds: 30 },
      ]},
      { id: 's2', name: 'Upper Body', dayOfWeek: 3, estimatedDuration: 40, exercises: [
        { exercise: exercises[0], sets: 3, reps: '10-12', restSeconds: 90 },
        { exercise: exercises[7], sets: 3, reps: '8-10', restSeconds: 90 },
        { exercise: exercises[12], sets: 3, reps: '10-12', restSeconds: 60 },
        { exercise: exercises[17], sets: 2, reps: '12', restSeconds: 45 },
        { exercise: exercises[20], sets: 2, reps: '12', restSeconds: 45 },
      ]},
      { id: 's3', name: 'Lower Body', dayOfWeek: 5, estimatedDuration: 40, exercises: [
        { exercise: exercises[23], sets: 3, reps: '10-12', restSeconds: 90 },
        { exercise: exercises[25], sets: 3, reps: '12-15', restSeconds: 60 },
        { exercise: exercises[27], sets: 3, reps: '12', restSeconds: 45 },
        { exercise: exercises[28], sets: 3, reps: '12', restSeconds: 45 },
        { exercise: exercises[29], sets: 3, reps: '15', restSeconds: 30 },
      ]},
      { id: 's4', name: 'Full Body Circuit B', dayOfWeek: 6, estimatedDuration: 45, exercises: [
        { exercise: exercises[41], sets: 3, reps: '10', restSeconds: 60 },
        { exercise: exercises[43], sets: 3, reps: '15', restSeconds: 60 },
        { exercise: exercises[6], sets: 3, reps: '10-12', restSeconds: 60 },
        { exercise: exercises[36], sets: 3, reps: '45s', restSeconds: 30 },
        { exercise: exercises[24], sets: 3, reps: '12', restSeconds: 60 },
      ]},
    ],
  },
  {
    id: 'plan-2', name: 'Muscle Building', description: 'Classic push/pull/legs hypertrophy', goal: 'muscle_gain', difficulty: 'intermediate', durationWeeks: 12, sessionsPerWeek: 5,
    sessions: [
      { id: 's5', name: 'Push Day', dayOfWeek: 1, estimatedDuration: 55, exercises: [
        { exercise: exercises[0], sets: 4, reps: '8-10', restSeconds: 120 },
        { exercise: exercises[1], sets: 3, reps: '10-12', restSeconds: 90 },
        { exercise: exercises[12], sets: 3, reps: '10-12', restSeconds: 90 },
        { exercise: exercises[13], sets: 3, reps: '12-15', restSeconds: 60 },
        { exercise: exercises[20], sets: 3, reps: '12-15', restSeconds: 60 },
      ]},
      { id: 's6', name: 'Pull Day', dayOfWeek: 2, estimatedDuration: 55, exercises: [
        { exercise: exercises[7], sets: 4, reps: '6-8', restSeconds: 120 },
        { exercise: exercises[6], sets: 3, reps: '8-10', restSeconds: 90 },
        { exercise: exercises[10], sets: 3, reps: '10-12', restSeconds: 60 },
        { exercise: exercises[17], sets: 3, reps: '10-12', restSeconds: 60 },
        { exercise: exercises[15], sets: 3, reps: '12-15', restSeconds: 60 },
      ]},
      { id: 's7', name: 'Leg Day', dayOfWeek: 3, estimatedDuration: 55, exercises: [
        { exercise: exercises[23], sets: 4, reps: '8-10', restSeconds: 150 },
        { exercise: exercises[28], sets: 3, reps: '10-12', restSeconds: 90 },
        { exercise: exercises[26], sets: 3, reps: '10-12', restSeconds: 90 },
        { exercise: exercises[27], sets: 3, reps: '12-15', restSeconds: 60 },
        { exercise: exercises[29], sets: 3, reps: '15-20', restSeconds: 45 },
      ]},
      { id: 's8', name: 'Upper Body', dayOfWeek: 5, estimatedDuration: 50, exercises: [
        { exercise: exercises[0], sets: 3, reps: '8-10', restSeconds: 90 },
        { exercise: exercises[7], sets: 3, reps: '8-10', restSeconds: 90 },
        { exercise: exercises[12], sets: 3, reps: '10-12', restSeconds: 60 },
        { exercise: exercises[17], sets: 2, reps: '12', restSeconds: 60 },
        { exercise: exercises[20], sets: 2, reps: '12', restSeconds: 60 },
      ]},
      { id: 's9', name: 'Lower Body', dayOfWeek: 6, estimatedDuration: 50, exercises: [
        { exercise: exercises[31], sets: 3, reps: '8-10', restSeconds: 120 },
        { exercise: exercises[63], sets: 3, reps: '8-10', restSeconds: 90 },
        { exercise: exercises[28], sets: 3, reps: '12', restSeconds: 60 },
        { exercise: exercises[32], sets: 3, reps: '12', restSeconds: 60 },
        { exercise: exercises[39], sets: 3, reps: '15-20', restSeconds: 30 },
      ]},
    ],
  },
  {
    id: 'plan-3', name: 'Beginner Strength', description: 'Foundation strength program', goal: 'general_fitness', difficulty: 'beginner', durationWeeks: 8, sessionsPerWeek: 3,
    sessions: [
      { id: 's10', name: 'Full Body A', dayOfWeek: 1, estimatedDuration: 45, exercises: [
        { exercise: exercises[23], sets: 3, reps: '8-10', restSeconds: 120 },
        { exercise: exercises[0], sets: 3, reps: '8-10', restSeconds: 90 },
        { exercise: exercises[7], sets: 3, reps: '6-8', restSeconds: 90 },
        { exercise: exercises[25], sets: 2, reps: '12', restSeconds: 60 },
        { exercise: exercises[35], sets: 2, reps: '30s', restSeconds: 30 },
      ]},
      { id: 's11', name: 'Full Body B', dayOfWeek: 3, estimatedDuration: 45, exercises: [
        { exercise: exercises[11], sets: 3, reps: '5', restSeconds: 150 },
        { exercise: exercises[12], sets: 3, reps: '8-10', restSeconds: 90 },
        { exercise: exercises[24], sets: 3, reps: '10-12', restSeconds: 90 },
        { exercise: exercises[10], sets: 2, reps: '12', restSeconds: 60 },
        { exercise: exercises[36], sets: 2, reps: '20', restSeconds: 30 },
      ]},
      { id: 's12', name: 'Full Body C', dayOfWeek: 5, estimatedDuration: 45, exercises: [
        { exercise: exercises[2], sets: 3, reps: '12-15', restSeconds: 60 },
        { exercise: exercises[25], sets: 3, reps: '10-12', restSeconds: 90 },
        { exercise: exercises[8], sets: 3, reps: '8-10', restSeconds: 90 },
        { exercise: exercises[14], sets: 3, reps: '12-15', restSeconds: 45 },
        { exercise: exercises[36], sets: 3, reps: '45s', restSeconds: 30 },
      ]},
    ],
  },
  {
    id: 'plan-4', name: '5K Runner', description: 'From couch to 5K in 8 weeks', goal: 'endurance', difficulty: 'beginner', durationWeeks: 8, sessionsPerWeek: 3,
    sessions: [
      { id: 's13', name: 'Easy Run', dayOfWeek: 1, estimatedDuration: 30, exercises: [
        { exercise: exercises[41], sets: 1, reps: '20 min', restSeconds: 0 },
      ]},
      { id: 's14', name: 'Strength', dayOfWeek: 3, estimatedDuration: 30, exercises: [
        { exercise: exercises[23], sets: 2, reps: '15', restSeconds: 60 },
        { exercise: exercises[25], sets: 2, reps: '15', restSeconds: 60 },
        { exercise: exercises[35], sets: 3, reps: '30s', restSeconds: 30 },
        { exercise: exercises[32], sets: 3, reps: '12', restSeconds: 30 },
      ]},
      { id: 's15', name: 'Long Run', dayOfWeek: 6, estimatedDuration: 40, exercises: [
        { exercise: exercises[41], sets: 1, reps: '30 min', restSeconds: 0 },
      ]},
    ],
  },
  {
    id: 'plan-5', name: 'Bodyweight Warrior', description: 'No equipment needed', goal: 'general_fitness', difficulty: 'beginner', durationWeeks: 6, sessionsPerWeek: 4,
    sessions: [
      { id: 's16', name: 'Push Focus', dayOfWeek: 1, estimatedDuration: 35, exercises: [
        { exercise: exercises[2], sets: 3, reps: '15-20', restSeconds: 60 },
        { exercise: exercises[5], sets: 3, reps: '10-15', restSeconds: 60 },
        { exercise: exercises[20], sets: 3, reps: '10-15', restSeconds: 60 },
        { exercise: exercises[35], sets: 3, reps: '20', restSeconds: 30 },
      ]},
      { id: 's17', name: 'Pull Focus', dayOfWeek: 2, estimatedDuration: 35, exercises: [
        { exercise: exercises[7], sets: 3, reps: '8-12', restSeconds: 90 },
        { exercise: exercises[50], sets: 3, reps: '8-12', restSeconds: 90 },
        { exercise: exercises[41], sets: 3, reps: '10', restSeconds: 60 },
        { exercise: exercises[36], sets: 3, reps: '30s', restSeconds: 30 },
      ]},
      { id: 's18', name: 'Leg Focus', dayOfWeek: 4, estimatedDuration: 35, exercises: [
        { exercise: exercises[25], sets: 3, reps: '15-20', restSeconds: 60 },
        { exercise: exercises[28], sets: 3, reps: '15-20', restSeconds: 60 },
        { exercise: exercises[29], sets: 3, reps: '12 each', restSeconds: 60 },
        { exercise: exercises[32], sets: 3, reps: '15', restSeconds: 30 },
      ]},
      { id: 's19', name: 'Full Body', dayOfWeek: 6, estimatedDuration: 40, exercises: [
        { exercise: exercises[41], sets: 3, reps: '10', restSeconds: 60 },
        { exercise: exercises[2], sets: 3, reps: '15-20', restSeconds: 60 },
        { exercise: exercises[7], sets: 3, reps: '8-12', restSeconds: 90 },
        { exercise: exercises[23], sets: 3, reps: '15-20', restSeconds: 60 },
        { exercise: exercises[35], sets: 3, reps: '45s', restSeconds: 30 },
      ]},
    ],
  },
  {
    id: 'plan-6', name: 'Yoga Flow', description: 'Flexibility and mindfulness', goal: 'flexibility', difficulty: 'beginner', durationWeeks: 4, sessionsPerWeek: 5,
    sessions: [
      { id: 's20', name: 'Morning Flow', dayOfWeek: 1, estimatedDuration: 30, exercises: [
        { exercise: exercises[35], sets: 1, reps: '60s', restSeconds: 0 },
        { exercise: exercises[64], sets: 1, reps: '30s each', restSeconds: 0 },
        { exercise: exercises[38], sets: 1, reps: '10 each', restSeconds: 0 },
      ]},
      { id: 's21', name: 'Power Flow', dayOfWeek: 2, estimatedDuration: 30, exercises: [
        { exercise: exercises[41], sets: 3, reps: '10', restSeconds: 30 },
        { exercise: exercises[2], sets: 3, reps: '15', restSeconds: 30 },
        { exercise: exercises[35], sets: 1, reps: '60s', restSeconds: 0 },
      ]},
      { id: 's22', name: 'Deep Stretch', dayOfWeek: 3, estimatedDuration: 30, exercises: [
        { exercise: exercises[35], sets: 1, reps: '60s', restSeconds: 0 },
        { exercise: exercises[64], sets: 1, reps: '45s each', restSeconds: 0 },
        { exercise: exercises[38], sets: 1, reps: '15 each', restSeconds: 0 },
      ]},
      { id: 's23', name: 'Balance & Core', dayOfWeek: 5, estimatedDuration: 30, exercises: [
        { exercise: exercises[35], sets: 1, reps: '60s', restSeconds: 0 },
        { exercise: exercises[64], sets: 1, reps: '30s each', restSeconds: 0 },
        { exercise: exercises[38], sets: 3, reps: '15', restSeconds: 30 },
      ]},
      { id: 's24', name: 'Restorative', dayOfWeek: 6, estimatedDuration: 25, exercises: [
        { exercise: exercises[35], sets: 1, reps: '120s', restSeconds: 0 },
        { exercise: exercises[64], sets: 1, reps: '60s each', restSeconds: 0 },
        { exercise: exercises[36], sets: 1, reps: '20 each', restSeconds: 0 },
      ]},
    ],
  },
  {
    id: 'plan-7', name: 'HIIT Blast', description: 'High intensity interval training', goal: 'fat_loss', difficulty: 'intermediate', durationWeeks: 6, sessionsPerWeek: 4,
    sessions: [
      { id: 's25', name: 'HIIT Upper', dayOfWeek: 1, estimatedDuration: 35, exercises: [
        { exercise: exercises[41], sets: 4, reps: '10', restSeconds: 30 },
        { exercise: exercises[2], sets: 3, reps: '15', restSeconds: 30 },
        { exercise: exercises[20], sets: 3, reps: '15', restSeconds: 30 },
        { exercise: exercises[39], sets: 3, reps: '20', restSeconds: 30 },
      ]},
      { id: 's26', name: 'HIIT Lower', dayOfWeek: 2, estimatedDuration: 35, exercises: [
        { exercise: exercises[41], sets: 4, reps: '15', restSeconds: 30 },
        { exercise: exercises[25], sets: 3, reps: '15', restSeconds: 30 },
        { exercise: exercises[28], sets: 3, reps: '15', restSeconds: 30 },
        { exercise: exercises[40], sets: 3, reps: '20', restSeconds: 30 },
      ]},
      { id: 's27', name: 'HIIT Full Body', dayOfWeek: 4, estimatedDuration: 35, exercises: [
        { exercise: exercises[41], sets: 4, reps: '10', restSeconds: 30 },
        { exercise: exercises[43], sets: 3, reps: '12', restSeconds: 30 },
        { exercise: exercises[42], sets: 3, reps: '15', restSeconds: 30 },
        { exercise: exercises[35], sets: 3, reps: '45s', restSeconds: 15 },
      ]},
      { id: 's28', name: 'Core & Cardio', dayOfWeek: 6, estimatedDuration: 30, exercises: [
        { exercise: exercises[35], sets: 3, reps: '45s', restSeconds: 15 },
        { exercise: exercises[36], sets: 3, reps: '20', restSeconds: 15 },
        { exercise: exercises[38], sets: 3, reps: '15 each', restSeconds: 15 },
        { exercise: exercises[40], sets: 3, reps: '20', restSeconds: 15 },
      ]},
    ],
  },
  {
    id: 'plan-8', name: 'Power Lifting Prep', description: 'Squat, bench, deadlift focus', goal: 'muscle_gain', difficulty: 'advanced', durationWeeks: 12, sessionsPerWeek: 4,
    sessions: [
      { id: 's29', name: 'Squat Day', dayOfWeek: 1, estimatedDuration: 60, exercises: [
        { exercise: exercises[23], sets: 5, reps: '5', restSeconds: 180 },
        { exercise: exercises[59], sets: 3, reps: '8-10', restSeconds: 120 },
        { exercise: exercises[27], sets: 3, reps: '12', restSeconds: 60 },
        { exercise: exercises[32], sets: 3, reps: '12', restSeconds: 60 },
      ]},
      { id: 's30', name: 'Bench Day', dayOfWeek: 2, estimatedDuration: 60, exercises: [
        { exercise: exercises[0], sets: 5, reps: '5', restSeconds: 180 },
        { exercise: exercises[48], sets: 3, reps: '8-10', restSeconds: 120 },
        { exercise: exercises[12], sets: 3, reps: '10', restSeconds: 90 },
        { exercise: exercises[20], sets: 3, reps: '12', restSeconds: 60 },
      ]},
      { id: 's31', name: 'Deadlift Day', dayOfWeek: 4, estimatedDuration: 60, exercises: [
        { exercise: exercises[11], sets: 5, reps: '3', restSeconds: 240 },
        { exercise: exercises[6], sets: 3, reps: '8-10', restSeconds: 120 },
        { exercise: exercises[63], sets: 3, reps: '10', restSeconds: 90 },
        { exercise: exercises[35], sets: 3, reps: '60s', restSeconds: 30 },
      ]},
      { id: 's32', name: 'Accessory Day', dayOfWeek: 6, estimatedDuration: 50, exercises: [
        { exercise: exercises[13], sets: 3, reps: '12-15', restSeconds: 60 },
        { exercise: exercises[17], sets: 3, reps: '12', restSeconds: 60 },
        { exercise: exercises[21], sets: 3, reps: '12-15', restSeconds: 60 },
        { exercise: exercises[28], sets: 3, reps: '12', restSeconds: 60 },
        { exercise: exercises[35], sets: 3, reps: '60s', restSeconds: 30 },
      ]},
    ],
  },
  {
    id: 'plan-9', name: 'Athletic Performance', description: 'Sports conditioning program', goal: 'endurance', difficulty: 'intermediate', durationWeeks: 8, sessionsPerWeek: 5,
    sessions: [
      { id: 's33', name: 'Speed & Agility', dayOfWeek: 1, estimatedDuration: 45, exercises: [
        { exercise: exercises[68], sets: 3, reps: '10 each', restSeconds: 60 },
        { exercise: exercises[69], sets: 4, reps: '8', restSeconds: 60 },
        { exercise: exercises[70], sets: 3, reps: '20', restSeconds: 60 },
        { exercise: exercises[25], sets: 3, reps: '12', restSeconds: 60 },
      ]},
      { id: 's34', name: 'Strength', dayOfWeek: 2, estimatedDuration: 50, exercises: [
        { exercise: exercises[11], sets: 4, reps: '5', restSeconds: 180 },
        { exercise: exercises[0], sets: 3, reps: '8', restSeconds: 120 },
        { exercise: exercises[12], sets: 3, reps: '10', restSeconds: 90 },
        { exercise: exercises[23], sets: 3, reps: '8', restSeconds: 120 },
      ]},
      { id: 's35', name: 'Plyometrics', dayOfWeek: 3, estimatedDuration: 40, exercises: [
        { exercise: exercises[68], sets: 4, reps: '8', restSeconds: 60 },
        { exercise: exercises[41], sets: 3, reps: '12', restSeconds: 60 },
        { exercise: exercises[69], sets: 3, reps: '10', restSeconds: 60 },
        { exercise: exercises[40], sets: 3, reps: '20', restSeconds: 30 },
      ]},
      { id: 's36', name: 'Endurance', dayOfWeek: 5, estimatedDuration: 50, exercises: [
        { exercise: exercises[41], sets: 1, reps: '30 min', restSeconds: 0 },
      ]},
      { id: 's37', name: 'Recovery', dayOfWeek: 6, estimatedDuration: 30, exercises: [
        { exercise: exercises[35], sets: 1, reps: '60s', restSeconds: 0 },
        { exercise: exercises[64], sets: 1, reps: '30s each', restSeconds: 0 },
        { exercise: exercises[32], sets: 2, reps: '15', restSeconds: 30 },
      ]},
    ],
  },
  {
    id: 'plan-10', name: 'Core Destroyer', description: 'Abs and core focused', goal: 'general_fitness', difficulty: 'intermediate', durationWeeks: 6, sessionsPerWeek: 4,
    sessions: [
      { id: 's38', name: 'Core Circuit', dayOfWeek: 1, estimatedDuration: 30, exercises: [
        { exercise: exercises[35], sets: 3, reps: '45s', restSeconds: 15 },
        { exercise: exercises[36], sets: 3, reps: '20', restSeconds: 15 },
        { exercise: exercises[38], sets: 3, reps: '15 each', restSeconds: 15 },
        { exercise: exercises[37], sets: 3, reps: '12', restSeconds: 15 },
        { exercise: exercises[39], sets: 3, reps: '15', restSeconds: 15 },
      ]},
      { id: 's39', name: 'Anti-Movement', dayOfWeek: 2, estimatedDuration: 25, exercises: [
        { exercise: exercises[35], sets: 3, reps: '60s', restSeconds: 30 },
        { exercise: exercises[64], sets: 3, reps: '30s each', restSeconds: 30 },
        { exercise: exercises[86], sets: 3, reps: '12 each', restSeconds: 30 },
        { exercise: exercises[87], sets: 3, reps: '30s each', restSeconds: 30 },
      ]},
      { id: 's40', name: 'Dynamic Core', dayOfWeek: 4, estimatedDuration: 30, exercises: [
        { exercise: exercises[40], sets: 3, reps: '20', restSeconds: 30 },
        { exercise: exercises[41], sets: 3, reps: '15', restSeconds: 30 },
        { exercise: exercises[36], sets: 3, reps: '20', restSeconds: 15 },
        { exercise: exercises[67], sets: 3, reps: '15', restSeconds: 15 },
        { exercise: exercises[39], sets: 3, reps: '20', restSeconds: 15 },
      ]},
      { id: 's41', name: 'Core & Recovery', dayOfWeek: 6, estimatedDuration: 25, exercises: [
        { exercise: exercises[35], sets: 1, reps: '120s', restSeconds: 0 },
        { exercise: exercises[66], sets: 3, reps: '10', restSeconds: 30 },
        { exercise: exercises[38], sets: 3, reps: '12 each', restSeconds: 30 },
        { exercise: exercises[64], sets: 1, reps: '60s each', restSeconds: 0 },
      ]},
    ],
  },
];

// ==========================================
// ACHIEVEMENTS (30 foundational badges)
// ==========================================
export const achievements: Achievement[] = [
  // Foundation
  { id: 'ach-1', name: 'Welcome Aboard', description: 'Complete account setup', icon: 'rocket', category: 'foundation', rarity: 'bronze', xpReward: 50, unlocked: false, progress: 0, target: 1 },
  { id: 'ach-2', name: 'First Steps', description: 'Complete your first workout', icon: 'fitness', category: 'foundation', rarity: 'bronze', xpReward: 100, unlocked: false, progress: 0, target: 1 },
  { id: 'ach-3', name: 'Profile Complete', description: 'Fill out your profile 100%', icon: 'person', category: 'foundation', rarity: 'bronze', xpReward: 50, unlocked: false, progress: 0, target: 1 },
  // Consistency
  { id: 'ach-4', name: 'Week Warrior', description: '7-day workout streak', icon: 'flame', category: 'consistency', rarity: 'bronze', xpReward: 200, unlocked: false, progress: 0, target: 7 },
  { id: 'ach-5', name: 'Fortnight Fighter', description: '14-day workout streak', icon: 'flame', category: 'consistency', rarity: 'silver', xpReward: 500, unlocked: false, progress: 0, target: 14 },
  { id: 'ach-6', name: 'Monthly Master', description: '30-day workout streak', icon: 'flame', category: 'consistency', rarity: 'gold', xpReward: 1000, unlocked: false, progress: 0, target: 30 },
  { id: 'ach-7', name: 'Quarter Champion', description: '90-day workout streak', icon: 'flame', category: 'consistency', rarity: 'platinum', xpReward: 2500, unlocked: false, progress: 0, target: 90 },
  { id: 'ach-8', name: 'Year Legend', description: '365-day workout streak', icon: 'flame', category: 'consistency', rarity: 'diamond', xpReward: 10000, unlocked: false, progress: 0, target: 365 },
  // Strength
  { id: 'ach-9', name: 'First PR', description: 'Achieve your first personal record', icon: 'trophy', category: 'strength', rarity: 'bronze', xpReward: 100, unlocked: false, progress: 0, target: 1 },
  { id: 'ach-10', name: 'PR Machine', description: 'Achieve 10 personal records', icon: 'trophy', category: 'strength', rarity: 'silver', xpReward: 500, unlocked: false, progress: 0, target: 10 },
  { id: 'ach-11', name: 'PR Legend', description: 'Achieve 50 personal records', icon: 'trophy', category: 'strength', rarity: 'gold', xpReward: 2000, unlocked: false, progress: 0, target: 50 },
  { id: 'ach-12', name: 'Squat King', description: 'Squat 1.5x bodyweight', icon: 'barbell', category: 'strength', rarity: 'gold', xpReward: 500, unlocked: false, progress: 0, target: 1 },
  { id: 'ach-13', name: 'Bench Boss', description: 'Bench press 1x bodyweight', icon: 'barbell', category: 'strength', rarity: 'gold', xpReward: 500, unlocked: false, progress: 0, target: 1 },
  { id: 'ach-14', name: 'Deadlift Dominator', description: 'Deadlift 2x bodyweight', icon: 'barbell', category: 'strength', rarity: 'gold', xpReward: 500, unlocked: false, progress: 0, target: 1 },
  // Endurance
  { id: 'ach-15', name: 'First Mile', description: 'Run your first mile', icon: 'walk', category: 'endurance', rarity: 'bronze', xpReward: 100, unlocked: false, progress: 0, target: 1 },
  { id: 'ach-16', name: '5K Finisher', description: 'Complete a 5K', icon: 'walk', category: 'endurance', rarity: 'silver', xpReward: 300, unlocked: false, progress: 0, target: 1 },
  { id: 'ach-17', name: '10K Champion', description: 'Complete a 10K', icon: 'walk', category: 'endurance', rarity: 'gold', xpReward: 500, unlocked: false, progress: 0, target: 1 },
  { id: 'ach-18', name: 'Marathon Ready', description: 'Run a half marathon', icon: 'walk', category: 'endurance', rarity: 'platinum', xpReward: 2000, unlocked: false, progress: 0, target: 1 },
  { id: 'ach-19', name: '100 Mile Club', description: 'Run 100 total miles', icon: 'walk', category: 'endurance', rarity: 'gold', xpReward: 1000, unlocked: false, progress: 0, target: 100 },
  // Social
  { id: 'ach-20', name: 'Social Butterfly', description: 'Add 5 friends', icon: 'people', category: 'social', rarity: 'bronze', xpReward: 100, unlocked: false, progress: 0, target: 5 },
  { id: 'ach-21', name: 'Community Star', description: 'Post 10 workout updates', icon: 'chatbubbles', category: 'social', rarity: 'silver', xpReward: 200, unlocked: false, progress: 0, target: 10 },
  { id: 'ach-22', name: 'Challenge Accepted', description: 'Complete 5 challenges', icon: 'flag', category: 'social', rarity: 'silver', xpReward: 300, unlocked: false, progress: 0, target: 5 },
  { id: 'ach-23', name: 'Encourager', description: 'React to 50 friend workouts', icon: 'heart', category: 'social', rarity: 'bronze', xpReward: 150, unlocked: false, progress: 0, target: 50 },
  // Nutrition
  { id: 'ach-24', name: 'Food Logger', description: 'Log meals for 7 days', icon: 'restaurant', category: 'nutrition', rarity: 'bronze', xpReward: 200, unlocked: false, progress: 0, target: 7 },
  { id: 'ach-25', name: 'Hydration Hero', description: 'Hit water goal for 14 days', icon: 'water', category: 'nutrition', rarity: 'silver', xpReward: 300, unlocked: false, progress: 0, target: 14 },
  { id: 'ach-26', name: 'Macro Master', description: 'Hit macro targets for 7 days', icon: 'nutrition', category: 'nutrition', rarity: 'silver', xpReward: 400, unlocked: false, progress: 0, target: 7 },
  // Legendary
  { id: 'ach-27', name: 'Workout Machine', description: 'Complete 100 workouts', icon: 'trophy', category: 'legendary', rarity: 'gold', xpReward: 3000, unlocked: false, progress: 0, target: 100 },
  { id: 'ach-28', name: 'Iron Will', description: 'Complete 500 workouts', icon: 'trophy', category: 'legendary', rarity: 'platinum', xpReward: 10000, unlocked: false, progress: 0, target: 500 },
  { id: 'ach-29', name: 'Level 25', description: 'Reach level 25', icon: 'star', category: 'legendary', rarity: 'gold', xpReward: 2000, unlocked: false, progress: 0, target: 25 },
  { id: 'ach-30', name: 'Level 50', description: 'Reach max level', icon: 'star', category: 'legendary', rarity: 'diamond', xpReward: 10000, unlocked: false, progress: 0, target: 50 },
];

// ==========================================
// DAILY QUESTS
// ==========================================
export const dailyQuests: DailyQuest[] = [
  { id: 'q-1', name: 'Morning Workout', description: 'Complete a workout before noon', category: 'fitness', xpReward: 30, completed: false, progress: 0, target: 1 },
  { id: 'q-2', name: 'Hydration Goal', description: 'Drink 8 glasses of water', category: 'nutrition', xpReward: 20, completed: false, progress: 0, target: 8 },
  { id: 'q-3', name: 'Log All Meals', description: 'Log breakfast, lunch, and dinner', category: 'nutrition', xpReward: 25, completed: false, progress: 0, target: 3 },
  { id: 'q-4', name: 'Social Boost', description: 'React to 3 friend workouts', category: 'social', xpReward: 15, completed: false, progress: 0, target: 3 },
  { id: 'q-5', name: 'New Exercise', description: 'Try an exercise from the library', category: 'exploration', xpReward: 20, completed: false, progress: 0, target: 1 },
];

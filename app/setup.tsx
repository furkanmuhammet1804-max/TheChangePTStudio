import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/src/components/ui/Button';
import { useUser } from '@/src/contexts/UserContext';
import {
  DIFFICULTY_LABELS,
  GOAL_LABELS,
  LOCATION_LABELS,
} from '@/src/constants/strings';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { Difficulty, Gender, TrainingLocation, UserGoal, WeeklyDays } from '@/src/types';
import { UserProfile } from '@/src/types';

const TOTAL_STEPS = 4;

export default function SetupScreen() {
  const { saveProfile } = useUser();
  const [step, setStep] = useState(0);

  // Step 0 - Basic info
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<Gender>('male');

  // Step 1 - Goal
  const [goal, setGoal] = useState<UserGoal>('fat_burn');

  // Step 2 - Schedule & location
  const [weeklyDays, setWeeklyDays] = useState<WeeklyDays>(3);
  const [location, setLocation] = useState<TrainingLocation>('gym');

  // Step 3 - Level & target weight
  const [level, setLevel] = useState<Difficulty>('beginner');
  const [targetWeight, setTargetWeight] = useState('');

  const canContinue = () => {
    if (step === 0) return name.trim().length > 0 && age.trim() && height.trim() && weight.trim();
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    const profile: UserProfile = {
      name: name.trim(),
      age: parseInt(age) || 25,
      height: parseInt(height) || 170,
      weight: parseFloat(weight) || 70,
      gender,
      goal,
      weeklyDays,
      trainingLocation: location,
      level,
      startingWeight: parseFloat(weight) || 70,
      targetWeight: parseFloat(targetWeight) || parseFloat(weight) || 70,
      createdAt: new Date().toISOString(),
    };
    await saveProfile(profile);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          {step > 0 && (
            <TouchableOpacity onPress={() => setStep((s) => s - 1)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <View style={styles.progressTrack}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[styles.progressStep, i <= step && styles.progressStepActive]}
              />
            ))}
          </View>
          <Text style={styles.stepLabel}>
            {step + 1}/{TOTAL_STEPS}
          </Text>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 0 && <StepBasicInfo
            name={name} setName={setName}
            age={age} setAge={setAge}
            height={height} setHeight={setHeight}
            weight={weight} setWeight={setWeight}
            gender={gender} setGender={setGender}
          />}
          {step === 1 && <StepGoal goal={goal} setGoal={setGoal} />}
          {step === 2 && <StepSchedule weeklyDays={weeklyDays} setWeeklyDays={setWeeklyDays} location={location} setLocation={setLocation} />}
          {step === 3 && <StepLevel level={level} setLevel={setLevel} targetWeight={targetWeight} setTargetWeight={setTargetWeight} />}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={step === TOTAL_STEPS - 1 ? 'BAŞLA' : 'DEVAM'}
            onPress={handleNext}
            fullWidth
            size="lg"
            disabled={!canContinue()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---- Step Components ----

function StepBasicInfo({ name, setName, age, setAge, height, setHeight, weight, setWeight, gender, setGender }: {
  name: string; setName: (v: string) => void;
  age: string; setAge: (v: string) => void;
  height: string; setHeight: (v: string) => void;
  weight: string; setWeight: (v: string) => void;
  gender: Gender; setGender: (v: Gender) => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Seni tanıyalım.</Text>
      <Text style={styles.stepSubtitle}>Bu bilgiler sana özel program oluşturmak için kullanılır.</Text>

      <FormInput label="İsim" value={name} onChangeText={setName} placeholder="Adın" autoCapitalize="words" />
      <FormInput label="Yaş" value={age} onChangeText={setAge} placeholder="25" keyboardType="numeric" />
      <FormInput label="Boy (cm)" value={height} onChangeText={setHeight} placeholder="175" keyboardType="numeric" />
      <FormInput label="Kilo (kg)" value={weight} onChangeText={setWeight} placeholder="70" keyboardType="decimal-pad" />

      <Text style={styles.fieldLabel}>Cinsiyet</Text>
      <View style={styles.optionRow}>
        {(['male', 'female', 'other'] as Gender[]).map((g) => (
          <OptionChip
            key={g}
            label={g === 'male' ? 'Erkek' : g === 'female' ? 'Kadın' : 'Diğer'}
            selected={gender === g}
            onPress={() => setGender(g)}
          />
        ))}
      </View>
    </View>
  );
}

function StepGoal({ goal, setGoal }: { goal: UserGoal; setGoal: (v: UserGoal) => void }) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Hedefin ne?</Text>
      <Text style={styles.stepSubtitle}>Program sana göre özelleştirilecek.</Text>
      {(Object.keys(GOAL_LABELS) as UserGoal[]).map((g) => (
        <TouchableOpacity
          key={g}
          style={[styles.goalCard, goal === g && styles.goalCardActive]}
          onPress={() => setGoal(g)}
          activeOpacity={0.85}
        >
          <Text style={[styles.goalLabel, goal === g && styles.goalLabelActive]}>
            {GOAL_LABELS[g]}
          </Text>
          {goal === g && <Ionicons name="checkmark-circle" size={22} color={colors.accent} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function StepSchedule({ weeklyDays, setWeeklyDays, location, setLocation }: {
  weeklyDays: WeeklyDays; setWeeklyDays: (v: WeeklyDays) => void;
  location: TrainingLocation; setLocation: (v: TrainingLocation) => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Antrenman planın.</Text>
      <Text style={styles.stepSubtitle}>Haftada kaç gün spor yapabilirsin?</Text>

      <View style={styles.dayGrid}>
        {([2, 3, 4, 5] as WeeklyDays[]).map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.dayBox, weeklyDays === d && styles.dayBoxActive]}
            onPress={() => setWeeklyDays(d)}
            activeOpacity={0.85}
          >
            <Text style={[styles.dayNumber, weeklyDays === d && styles.dayNumberActive]}>{d}</Text>
            <Text style={[styles.dayText, weeklyDays === d && styles.dayTextActive]}>gün</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.fieldLabel, { marginTop: spacing.xl }]}>Antrenman yeri</Text>
      <View style={styles.optionRow}>
        {(Object.keys(LOCATION_LABELS) as TrainingLocation[]).map((l) => (
          <OptionChip
            key={l}
            label={LOCATION_LABELS[l]}
            selected={location === l}
            onPress={() => setLocation(l)}
          />
        ))}
      </View>
    </View>
  );
}

function StepLevel({ level, setLevel, targetWeight, setTargetWeight }: {
  level: Difficulty; setLevel: (v: Difficulty) => void;
  targetWeight: string; setTargetWeight: (v: string) => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Seviyeni belirle.</Text>
      <Text style={styles.stepSubtitle}>Dürüst ol, program sana uyarlanacak.</Text>

      {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((l) => (
        <TouchableOpacity
          key={l}
          style={[styles.goalCard, level === l && styles.goalCardActive]}
          onPress={() => setLevel(l)}
          activeOpacity={0.85}
        >
          <Text style={[styles.goalLabel, level === l && styles.goalLabelActive]}>
            {DIFFICULTY_LABELS[l]}
          </Text>
          {level === l && <Ionicons name="checkmark-circle" size={22} color={colors.accent} />}
        </TouchableOpacity>
      ))}

      <FormInput
        label="Hedef kilo (kg) — isteğe bağlı"
        value={targetWeight}
        onChangeText={setTargetWeight}
        placeholder="Örn: 75"
        keyboardType="decimal-pad"
      />
    </View>
  );
}

// ---- Shared small components ----

function FormInput({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: 'numeric' | 'decimal-pad'; autoCapitalize?: 'words';
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        selectionColor={colors.accent}
      />
    </View>
  );
}

function OptionChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  backBtn: {
    padding: spacing.xs,
  },
  progressTrack: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressStep: {
    flex: 1,
    height: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceTertiary,
  },
  progressStepActive: {
    backgroundColor: colors.accent,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  stepContainer: {
    gap: spacing.md,
  },
  stepTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    color: colors.text,
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  chipLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  chipLabelSelected: {
    color: colors.accent,
  },
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  goalCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  goalLabel: {
    ...typography.h4,
    color: colors.textSecondary,
  },
  goalLabelActive: {
    color: colors.accent,
  },
  dayGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayBoxActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  dayNumber: {
    ...typography.h2,
    color: colors.textSecondary,
  },
  dayNumberActive: {
    color: colors.accent,
  },
  dayText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  dayTextActive: {
    color: colors.accentDark,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: 36,
  },
});

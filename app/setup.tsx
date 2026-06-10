import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/src/components/ui/Button';
import { useUser } from '@/src/contexts/UserContext';
import {
  DIFFICULTY_LABELS,
  GOAL_LABELS,
  LOCATION_LABELS,
} from '@/src/constants/strings';
import { borderRadius, colors, shadows, spacing, typography } from '@/src/theme';
import { Difficulty, Gender, TrainingLocation, UserGoal, UserProfile, WeeklyDays } from '@/src/types';

const TOTAL_STEPS = 4;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const STEP_EYEBROWS = ['TEMEL BİLGİLER', 'HEDEFİN', 'PROGRAMIN', 'SEVİYEN'];

const GOAL_ICONS: Record<UserGoal, IconName> = {
  fat_burn: 'flame',
  muscle_gain: 'barbell',
  maintain: 'shield-checkmark',
  strength: 'fitness',
  beginner: 'leaf',
};

const GOAL_DESCRIPTIONS: Record<UserGoal, string> = {
  fat_burn: 'Yağ yak, tanımlı bir vücuda kavuş',
  muscle_gain: 'Kas kütleni artır, hacim kazan',
  maintain: 'Mevcut formunu koru ve dengede kal',
  strength: 'Daha güçlü ol, performansını yükselt',
  beginner: 'Temelden başla, alışkanlık kazan',
};

const LEVEL_ICONS: Record<Difficulty, IconName> = {
  beginner: 'leaf-outline',
  intermediate: 'flash-outline',
  advanced: 'flame-outline',
  all: 'ellipse-outline',
};

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  beginner: 'Yeni başlıyorum, temelden gidelim',
  intermediate: 'Düzenli antrenman yapıyorum',
  advanced: 'Deneyimliyim, beni zorla',
};

export default function SetupScreen() {
  const { saveProfile } = useUser();
  const insets = useSafeAreaInsets();
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

  // Smooth step transition animation
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [step, anim]);

  const stepTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  const canContinue = () => {
    if (step === 0) return name.trim().length > 0 && !!age.trim() && !!height.trim() && !!weight.trim();
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
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          {step > 0 ? (
            <TouchableOpacity onPress={() => setStep((s) => s - 1)} style={styles.backBtn} hitSlop={10}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
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
          <Animated.View style={{ opacity: anim, transform: [{ translateX: stepTranslate }] }}>
            <Text style={styles.eyebrow}>{STEP_EYEBROWS[step]}</Text>

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
          </Animated.View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button
            title={step === TOTAL_STEPS - 1 ? 'BAŞLA' : 'DEVAM'}
            onPress={handleNext}
            fullWidth
            size="lg"
            disabled={!canContinue()}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ---- Step Components ----

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.stepHead}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepSubtitle}>{subtitle}</Text>
    </View>
  );
}

function StepBasicInfo({ name, setName, age, setAge, height, setHeight, weight, setWeight, gender, setGender }: {
  name: string; setName: (v: string) => void;
  age: string; setAge: (v: string) => void;
  height: string; setHeight: (v: string) => void;
  weight: string; setWeight: (v: string) => void;
  gender: Gender; setGender: (v: Gender) => void;
}) {
  return (
    <View style={styles.stepContainer}>
      <StepHeader title="Seni tanıyalım." subtitle="Bu bilgiler sana özel bir program kurmamız için ilk adım." />

      <FormInput label="İsim" value={name} onChangeText={setName} placeholder="Adın" autoCapitalize="words" />
      <View style={styles.inputRow}>
        <View style={styles.inputCol}>
          <FormInput label="Yaş" value={age} onChangeText={setAge} placeholder="25" keyboardType="numeric" />
        </View>
        <View style={styles.inputCol}>
          <FormInput label="Boy (cm)" value={height} onChangeText={setHeight} placeholder="175" keyboardType="numeric" />
        </View>
      </View>
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
      <StepHeader title="Hedefin ne?" subtitle="Programını bu hedefe göre özelleştireceğiz." />
      {(Object.keys(GOAL_LABELS) as UserGoal[]).map((g) => (
        <SelectCard
          key={g}
          icon={GOAL_ICONS[g]}
          label={GOAL_LABELS[g]}
          description={GOAL_DESCRIPTIONS[g]}
          selected={goal === g}
          onPress={() => setGoal(g)}
        />
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
      <StepHeader title="Antrenman planın." subtitle="Haftada kaç gün ayırabilirsin?" />

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

      <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Antrenman yeri</Text>
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
      <StepHeader title="Seviyeni belirle." subtitle="Dürüst ol — program tam sana göre ayarlanacak." />

      {(['beginner', 'intermediate', 'advanced'] as Difficulty[]).map((l) => (
        <SelectCard
          key={l}
          icon={LEVEL_ICONS[l]}
          label={DIFFICULTY_LABELS[l]}
          description={LEVEL_DESCRIPTIONS[l]}
          selected={level === l}
          onPress={() => setLevel(l)}
        />
      ))}

      <View style={{ marginTop: spacing.sm }}>
        <FormInput
          label="Hedef kilo (kg) — isteğe bağlı"
          value={targetWeight}
          onChangeText={setTargetWeight}
          placeholder="Örn: 75"
          keyboardType="decimal-pad"
        />
      </View>
    </View>
  );
}

// ---- Shared small components ----

function SelectCard({
  icon, label, description, selected, onPress,
}: {
  icon: IconName; label: string; description: string; selected: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.selectCard, selected && styles.selectCardActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.selectIcon, selected && styles.selectIconActive]}>
        <Ionicons name={icon} size={22} color={selected ? colors.background : colors.textSecondary} />
      </View>
      <View style={styles.selectBody}>
        <Text style={[styles.selectLabel, selected && styles.selectLabelActive]}>{label}</Text>
        <Text style={styles.selectDesc}>{description}</Text>
      </View>
      <Ionicons
        name={selected ? 'checkmark-circle' : 'ellipse-outline'}
        size={22}
        color={selected ? colors.accent : colors.textMuted}
      />
    </TouchableOpacity>
  );
}

function FormInput({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: 'numeric' | 'decimal-pad'; autoCapitalize?: 'words';
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'none'}
        selectionColor={colors.accent}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

function OptionChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceTertiary,
  },
  progressStepActive: {
    backgroundColor: colors.accent,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    width: 32,
    textAlign: 'right',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  eyebrow: {
    ...typography.label,
    color: colors.accent,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  stepContainer: {
    gap: spacing.md,
  },
  stepHead: {
    marginBottom: spacing.sm,
  },
  stepTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputCol: {
    flex: 1,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 1,
    color: colors.text,
    ...typography.bodyMedium,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  inputFocused: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceSecondary,
  },
  optionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
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
    fontWeight: '700',
  },
  chipLabelSelected: {
    color: colors.accent,
  },
  selectCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.sm,
  },
  selectCardActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  selectIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectIconActive: {
    backgroundColor: colors.accent,
  },
  selectBody: {
    flex: 1,
    gap: 2,
  },
  selectLabel: {
    ...typography.h4,
    color: colors.text,
  },
  selectLabelActive: {
    color: colors.accent,
  },
  selectDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  dayGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dayBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: 2,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dayBoxActive: {
    backgroundColor: colors.accentSoft,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

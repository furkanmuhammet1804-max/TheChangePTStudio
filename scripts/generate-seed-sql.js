/**
 * Statik katalog verisinden (src/data) Supabase seed migration'ı üretir:
 *   supabase/migrations/0002_seed_catalog.sql
 *
 * Canlı modda içerik tek kaynaktan (Supabase) okunur; bu seed, mevcut
 * egzersiz/program kataloğunu veritabanına taşır. Tekrar çalıştırmak
 * güvenlidir (insert ... on conflict do nothing).
 *
 * Çalıştırma: node scripts/generate-seed-sql.js
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const ROOT = path.join(__dirname, '..');

/** TS data modülünü transpile edip exportlarını döndürür (tip importları silinir) */
function loadDataModule(relPath) {
  const source = fs.readFileSync(path.join(ROOT, relPath), 'utf8');
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  }).outputText;
  const module = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', 'require', js)(module, module.exports, require);
  return module.exports;
}

const { exercises } = loadDataModule('src/data/exercises.ts');
const { programs } = loadDataModule('src/data/programs.ts');

// ─── SQL yardımcıları ────────────────────────────────────────────────────────

function sqlText(value) {
  if (value === undefined || value === null) return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlInt(value) {
  return value === undefined || value === null ? 'null' : String(value);
}

function sqlBool(value) {
  return value ? 'true' : 'false';
}

function sqlTextArray(arr) {
  if (!arr || arr.length === 0) return `'{}'::text[]`;
  return `array[${arr.map(sqlText).join(', ')}]::text[]`;
}

// ─── Egzersizler ─────────────────────────────────────────────────────────────

const exerciseRows = exercises.map((e) =>
  `  (${[
    sqlText(e.id),
    sqlText(e.name),
    sqlText(e.description ?? ''),
    sqlText(e.muscleGroup),
    sqlTextArray(e.environments),
    sqlText(e.equipment),
    sqlText(e.difficulty),
    sqlTextArray(e.howTo),
    sqlTextArray(e.tips),
    sqlTextArray(e.commonMistakes),
    sqlTextArray(e.alternatives),
    sqlInt(e.sets),
    sqlText(e.reps),
    sqlInt(e.rest),
    sqlText(e.imageUrl),
    sqlText(e.gifUrl),
    sqlText(e.videoUrl),
    sqlText(e.thumbnailUrl),
    sqlText(e.mediaStatus),
  ].join(', ')})`,
);

const exercisesSql = `insert into public.exercises
  (id, name, description_tr, muscle_group, environments, equipment, difficulty,
   instructions_tr, tips_tr, mistakes_tr, alternatives, sets, reps, rest_seconds,
   image_url, gif_url, video_url, thumbnail_url, media_status)
values
${exerciseRows.join(',\n')}
on conflict (id) do nothing;`;

// ─── Programlar ──────────────────────────────────────────────────────────────

const programRows = programs.map((p) =>
  `  (${[
    sqlText(p.id),
    sqlText(p.title),
    sqlText(p.description ?? ''),
    sqlText(p.category),
    sqlText(p.level),
    sqlInt(p.durationWeeks),
    sqlInt(p.weeklyDays),
    'true',  // katalog programları premium
    'true',  // katalog programları yayında
    sqlTextArray(p.equipment),
    sqlTextArray(p.targetMuscles),
    sqlText(p.badge),
  ].join(', ')})`,
);

const programsSql = `insert into public.programs
  (id, title, description_tr, goal, level, duration_weeks, weekly_days,
   is_premium, is_published, equipment, target_muscles, badge)
values
${programRows.join(',\n')}
on conflict (id) do nothing;`;

// ─── Program haftalık planları ───────────────────────────────────────────────

const workoutRows = programs.flatMap((p) =>
  p.weeks.flatMap((week) =>
    week.workouts.map((w) =>
      `  (${[
        sqlText(p.id),
        sqlInt(week.weekNumber),
        sqlInt(w.day),
        sqlText(w.workoutId),
        sqlText(w.name),
      ].join(', ')})`,
    ),
  ),
);

const programWorkoutsSql = `insert into public.program_workouts
  (program_id, week_number, day_index, workout_id, workout_title)
values
${workoutRows.join(',\n')}
on conflict (program_id, week_number, day_index) do nothing;`;

// ─── Dosyayı yaz ─────────────────────────────────────────────────────────────

const output = `-- ════════════════════════════════════════════════════════════════════════════
-- The Change PT Studio — katalog seed verisi
-- scripts/generate-seed-sql.js tarafından üretildi (elle düzenlemeyin).
-- Kaynak: src/data/exercises.ts (${exercises.length} egzersiz),
--         src/data/programs.ts (${programs.length} program)
-- ════════════════════════════════════════════════════════════════════════════

${exercisesSql}

${programsSql}

${programWorkoutsSql}
`;

const outPath = path.join(ROOT, 'supabase', 'migrations', '0002_seed_catalog.sql');
fs.writeFileSync(outPath, output, 'utf8');
console.log(
  `${path.relative(ROOT, outPath)} üretildi: ${exercises.length} egzersiz, ` +
  `${programs.length} program, ${workoutRows.length} haftalık plan satırı.`,
);

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} dk`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}s ${m}dk` : `${h} saat`;
}

export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatWeight(weight: number): string {
  return `${weight} kg`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Günaydın, ${name}`;
  if (hour < 18) return `İyi günler, ${name}`;
  return `İyi akşamlar, ${name}`;
}

export function getDayName(): string {
  const days = [
    'Pazar',
    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi',
  ];
  return days[new Date().getDay()];
}

export function getWeekStartDate(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export function isThisWeek(dateString: string): boolean {
  const weekStart = getWeekStartDate();
  return dateString >= weekStart;
}

export function calcBMI(weight: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weight / (h * h)) * 10) / 10;
}

export function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

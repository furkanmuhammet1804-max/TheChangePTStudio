/**
 * Admin panel iskeleti: sol sidebar + üst bar + içerik alanı.
 * >= 1024px genişlikte kalıcı sidebar (desktop öncelikli),
 * altında üst bara bitişik yatay menü (mobil/tablet).
 */
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isAdminApp } from '@/src/lib/appVariant';
import { logoutAdmin } from '@/src/services/adminAuth';
import { useAppState } from '@/src/services/appStore';
import { borderRadius, colors, spacing, typography } from '@/src/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface NavItem {
  route: string;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { route: '/admin',               label: 'Dashboard',          icon: 'grid-outline' },
  { route: '/admin/users',         label: 'Kullanıcılar',       icon: 'people-outline' },
  { route: '/admin/memberships',   label: 'Premium Üyelikler',  icon: 'star-outline' },
  { route: '/admin/programs',      label: 'Program Yönetimi',   icon: 'albums-outline' },
  { route: '/admin/exercises',     label: 'Egzersiz Yönetimi',  icon: 'barbell-outline' },
  { route: '/admin/notifications', label: 'Bildirim Yönetimi',  icon: 'notifications-outline' },
  { route: '/admin/settings',      label: 'Ayarlar',            icon: 'settings-outline' },
];

const SIDEBAR_BREAKPOINT = 1024;
const CONTENT_MAX_WIDTH  = 1180;

function isActive(route: string, pathname: string): boolean {
  return route === '/admin' ? pathname === '/admin' : pathname.startsWith(route);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const { width } = useWindowDimensions();
  const wide      = width >= SIDEBAR_BREAKPOINT;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.body}>
        {wide && <Sidebar pathname={pathname} />}

        <View style={styles.main}>
          <TopBar showBrand={!wide} />
          {!wide && <MobileNav pathname={pathname} />}

          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentInner}>{children}</View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Sidebar (desktop) ───────────────────────────────────────────────────────

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <View style={styles.sidebar}>
      {/* Brand */}
      <View style={styles.brand}>
        <View style={styles.brandLogo}>
          <Ionicons name="barbell" size={20} color={colors.background} />
        </View>
        <View>
          <Text style={styles.brandTitle}>THE CHANGE</Text>
          <Text style={styles.brandSub}>PT STUDIO · ADMIN</Text>
        </View>
      </View>

      {/* Nav */}
      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.route, pathname);
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => router.push(item.route as never)}
              activeOpacity={0.8}
            >
              {active && <View style={styles.navIndicator} />}
              <Ionicons
                name={item.icon}
                size={18}
                color={active ? colors.accent : colors.textSecondary}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.sidebarFooter}>
        {!isAdminApp && (
          <TouchableOpacity
            style={styles.backToApp}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.8}
          >
            <Ionicons name="phone-portrait-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.backToAppLabel}>Uygulamaya Dön</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.versionText}>Admin Panel v1.0</Text>
      </View>
    </View>
  );
}

// ─── Top bar ─────────────────────────────────────────────────────────────────

function TopBar({ showBrand }: { showBrand: boolean }) {
  const settings = useAppState((s) => s.settings);

  return (
    <View style={styles.topBar}>
      <Text style={styles.topBarTitle} numberOfLines={1}>
        {showBrand ? `${settings.companyName} · Admin` : `${settings.companyName} Admin`}
      </Text>

      <View style={styles.topBarRight}>
        <View style={styles.adminUser}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {settings.companyName.charAt(0).toUpperCase()}
            </Text>
          </View>
          {!showBrand && (
            <View>
              <Text style={styles.adminName}>{settings.adminEmail}</Text>
              <Text style={styles.adminRole}>Yönetici</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => logoutAdmin()} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={16} color={colors.textSecondary} />
          {!showBrand && <Text style={styles.logoutLabel}>Çıkış Yap</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Mobile nav (dar ekran) ──────────────────────────────────────────────────

function MobileNav({ pathname }: { pathname: string }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.mobileNav}
      contentContainerStyle={styles.mobileNavContent}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.route, pathname);
        return (
          <TouchableOpacity
            key={item.route}
            style={[styles.mobileNavItem, active && styles.mobileNavItemActive]}
            onPress={() => router.push(item.route as never)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={item.icon}
              size={14}
              color={active ? colors.background : colors.textSecondary}
            />
            <Text style={[styles.mobileNavLabel, active && styles.mobileNavLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1 },

  // Sidebar
  sidebar: {
    width: 248,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    justifyContent: 'flex-start',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  brandLogo: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: { ...typography.h4, color: colors.text, letterSpacing: 1 },
  brandSub: { ...typography.caption, color: colors.accent, letterSpacing: 1.2, marginTop: 1 },

  nav: { gap: 2, flex: 1 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm + 3,
    borderRadius: borderRadius.md,
  },
  navItemActive: { backgroundColor: colors.accentMuted },
  navIndicator: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  navLabel: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  navLabelActive: { color: colors.accent, fontWeight: '800' },

  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  backToApp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  backToAppLabel: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  versionText: { ...typography.caption, color: colors.textMuted, paddingHorizontal: spacing.sm },

  // Top bar
  topBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  topBarTitle: { ...typography.h4, color: colors.text, flexShrink: 1 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  adminUser: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accentMuted,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...typography.bodyMedium, color: colors.accent, fontWeight: '800' },
  adminName: { ...typography.bodySmall, color: colors.text, fontWeight: '700' },
  adminRole: { ...typography.caption, color: colors.textSecondary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  logoutLabel: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '700' },

  // Mobile nav
  mobileNav: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  mobileNavContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  mobileNavItemActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  mobileNavLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '700' },
  mobileNavLabelActive: { color: colors.background },

  // Content
  contentScroll: { flex: 1 },
  contentContainer: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xxl },
  contentInner: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    gap: spacing.md,
  },
});

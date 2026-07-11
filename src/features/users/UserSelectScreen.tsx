import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '../../strings';
import { useAppStyles, useAppTheme } from '../../ThemeProvider';
import type { AppThemeColors } from '../../theme/colors';
import type { AppUser } from '../../types';

type UserSelectScreenProps = {
  currentUserId: string | null;
  onBack?: () => void;
  onSelectUser: (user: AppUser) => void;
  users: AppUser[];
};

const userImages: Partial<Record<string, ImageSourcePropType>> = {
  'gymbro-user-nastya': require('../../../assets/users/nastya.png'),
  'gymbro-user-zhenya': require('../../../assets/users/zhenya.png'),
};

const userDisplayOrder = ['gymbro-user-nastya', 'gymbro-user-zhenya'];

export function UserSelectScreen({
  currentUserId,
  onBack,
  onSelectUser,
  users,
}: UserSelectScreenProps) {
  const { colors } = useAppTheme();
  const styles = useAppStyles(createStyles);
  const orderedUsers = [...users].sort(
    (firstUser, secondUser) =>
      getUserDisplayIndex(firstUser.id) - getUserDisplayIndex(secondUser.id),
  );

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.secondaryHeader}>
          {onBack === undefined ? null : (
            <Pressable
              accessibilityLabel={strings.accessibility.back}
              onPress={onBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
          )}
          <Text style={styles.secondaryTitle}>{strings.users.selectTitle}</Text>
        </View>

        <Text style={styles.helperText}>{strings.users.selectMessage}</Text>

        <View style={styles.userList}>
          {orderedUsers.map((user) => {
            const isSelected = user.id === currentUserId;
            const userImage = userImages[user.id];
            const imageFrameStyle =
              user.id === 'gymbro-user-zhenya'
                ? styles.zhenyaImageFrame
                : styles.nastyaImageFrame;

            return (
              <Pressable
                accessibilityLabel={strings.users.selectUser(user.name)}
                key={user.id}
                onPress={() => onSelectUser(user)}
                style={({ pressed }) => [
                  styles.userButton,
                  isSelected && styles.selectedUserButton,
                  pressed && styles.pressedButton,
                ]}
              >
                {userImage === undefined ? null : (
                  <View style={[styles.userImageFrame, imageFrameStyle]}>
                    <Image
                      resizeMode="contain"
                      source={userImage}
                      style={styles.userImage}
                    />
                  </View>
                )}
                <Text
                  style={[
                    styles.userButtonText,
                    isSelected && styles.selectedUserButtonText,
                  ]}
                >
                  {user.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getUserDisplayIndex(userId: string): number {
  const userIndex = userDisplayOrder.indexOf(userId);

  return userIndex === -1 ? userDisplayOrder.length : userIndex;
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.userSelectBackground,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  secondaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 37,
    justifyContent: 'center',
    width: 37,
  },
  secondaryTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
  },
  helperText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 18,
  },
  userList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  userButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 258,
    minWidth: 140,
    overflow: 'hidden',
    padding: 8,
  },
  selectedUserButton: {
    backgroundColor: colors.active,
    borderColor: colors.activeBorder,
  },
  userImageFrame: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderColor: colors.border,
    borderRadius: 7,
    borderWidth: 1,
    height: 198,
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  nastyaImageFrame: {
    backgroundColor: colors.subtleBackground,
  },
  zhenyaImageFrame: {
    backgroundColor: colors.appBackground,
  },
  userImage: {
    height: '100%',
    width: '100%',
  },
  userButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  selectedUserButtonText: {
    color: colors.primary,
  },
  pressedButton: {
    opacity: 0.7,
  },
  });
}

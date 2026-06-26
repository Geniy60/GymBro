import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { strings } from '../../strings';
import { colors } from '../../theme/colors';
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
  const orderedUsers = [...users].sort(
    (firstUser, secondUser) =>
      getUserDisplayIndex(firstUser.id) - getUserDisplayIndex(secondUser.id),
  );

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <View style={styles.content}>
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
                  <View style={styles.userImageFrame}>
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
      </View>
    </SafeAreaView>
  );
}

function getUserDisplayIndex(userId: string): number {
  const userIndex = userDisplayOrder.indexOf(userId);

  return userIndex === -1 ? userDisplayOrder.length : userIndex;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  secondaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: '700',
  },
  helperText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 16,
  },
  userList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  userButton: {
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 250,
    minWidth: 140,
    overflow: 'hidden',
    padding: 10,
  },
  selectedUserButton: {
    backgroundColor: '#DCFCE7',
    borderColor: colors.primary,
  },
  userImageFrame: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    height: 190,
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  userImage: {
    height: '100%',
    width: '100%',
  },
  userButtonText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  selectedUserButtonText: {
    color: '#166534',
  },
  pressedButton: {
    opacity: 0.7,
  },
});

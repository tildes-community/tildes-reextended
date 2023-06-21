import {Migration} from '@holllo/migration-helper';

export const migrations: Array<Migration<string>> = [
  {
    version: '1.1.2',
    async migrate(data: Record<string, any>) {
      const migrated: Record<string, any> = {
        data: {
          hideVotes: data.data.hideVotes as Record<string, boolean>,
          knownGroups: data.data.knownGroups as string[],
          latestActiveFeatureTab: data.data.latestActiveFeatureTab as string,
        },
        features: (data.features as Record<string, string>) ?? {},
        version: '1.1.2',
      };

      const userLabels = data.data.userLabels as UserLabel[];
      for (const label of userLabels) {
        migrated[`userLabel${label.id}`] = label;
      }

      const usernameColors = data.data.usernameColors as UsernameColor[];
      for (const color of usernameColors) {
        migrated[`usernameColor${color.id}`] = color;
      }

      return migrated;
    },
  },
];

export function deserializeData(data: Record<string, any>): {
  userLabels: UserLabel[];
  usernameColors: UsernameColor[];
} {
  const deserialized: ReturnType<typeof deserializeData> = {
    userLabels: [],
    usernameColors: [],
  };

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('userLabel')) {
      deserialized.userLabels.push(value);
    } else if (key.startsWith('usernameColor')) {
      deserialized.usernameColors.push(value);
    }
  }

  return deserialized;
}

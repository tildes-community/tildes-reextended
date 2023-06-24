export function v112DeserializeData(data: Record<string, any>): {
  userLabels: V112Settings["data"]["userLabels"];
  usernameColors: V112Settings["data"]["usernameColors"];
} {
  const deserialized: ReturnType<typeof v112DeserializeData> = {
    userLabels: [],
    usernameColors: [],
  };

  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith("userLabel")) {
      deserialized.userLabels.push(
        value as (typeof deserialized)["userLabels"][number],
      );
    } else if (key.startsWith("usernameColor")) {
      deserialized.usernameColors.push(
        value as (typeof deserialized)["usernameColors"][number],
      );
    }
  }

  return deserialized;
}

export type V112Settings = {
  [index: string]: any;
  data: {
    hideVotes: {
      comments: boolean;
      topics: boolean;
      ownComments: boolean;
      ownTopics: boolean;
    };
    knownGroups: string[];
    latestActiveFeatureTab: string;
    userLabels: Array<{
      color: string;
      id: number;
      priority: number;
      text: string;
      username: string;
    }>;
    usernameColors: Array<{
      color: string;
      id: number;
      username: string;
    }>;
  };
  features: {
    anonymizeUsernames: boolean;
    autocomplete: boolean;
    backToTop: boolean;
    debug: boolean;
    hideVotes: boolean;
    jumpToNewComment: boolean;
    markdownToolbar: boolean;
    themedLogo: boolean;
    userLabels: boolean;
    usernameColors: boolean;
  };
  version: string;
};

export const v112Sample: V112Settings = {
  data: {
    hideVotes: {
      comments: true,
      ownComments: true,
      ownTopics: false,
      topics: true,
    },
    knownGroups: ["~group", "~group.subgroup", "~test"],
    latestActiveFeatureTab: "userLabels",
    userLabels: [],
    usernameColors: [],
  },
  features: {
    anonymizeUsernames: false,
    autocomplete: true,
    backToTop: true,
    debug: true,
    hideVotes: true,
    jumpToNewComment: true,
    markdownToolbar: true,
    themedLogo: true,
    userLabels: true,
    usernameColors: false,
  },
  version: "1.1.2",
  userLabel1: {
    color: "#ff00ff",
    id: 1,
    priority: 0,
    text: "Test Label",
    username: "Test",
  },
  userLabel15: {
    id: 15,
    color: "var(--syntax-string-color)",
    priority: 0,
    text: "Another Label",
    username: "AnotherTest",
  },
  usernameColor4: {
    color: "red",
    id: 4,
    username: "Test",
  },
  usernameColor18: {
    color: "green",
    id: 18,
    username: "AnotherTest",
  },
};

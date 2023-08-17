/**
 * The different types of username replacements for the Anonymize Usernames
 * feature.
 */
export enum ReplacementType {
  Hashed = "hashed",
  Numerical = "numerical",
}

/**
 * Type guard check to see if a string is a valid {@link ReplacementType}.
 * @param input The string to check.
 */
export function isReplacementType(input: string): input is ReplacementType {
  return Object.values(ReplacementType).includes(input as ReplacementType);
}

/**
 * The data stored for the Anonymize Usernames feature.
 */
export type AnonymizeUsernamesData = {
  replacementType: ReplacementType;
};

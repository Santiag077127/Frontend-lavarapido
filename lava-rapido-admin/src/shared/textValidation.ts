const EMOJI_PATTERN = /(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F|[0-9#*]\uFE0F?\u20E3|\p{Regional_Indicator}{2})/u;

export const containsEmoji = (value: string): boolean => EMOJI_PATTERN.test(value);

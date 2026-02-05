import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class OnboardingStatusDto {
  @ApiProperty({
    description: 'Whether the user has accepted the Terms and Conditions',
    example: true,
  })
  hasAcceptedTerms: boolean;

  @ApiProperty({
    description: 'Whether the user has completed their basic profile (name, avatar, etc.)',
    example: true,
  })
  isProfileComplete: boolean;

  @ApiProperty({
    description: 'Whether the user has completed preference selection (goals, topics, interests)',
    example: false,
  })
  isPreferencesComplete: boolean;

  @ApiProperty({
    description: 'Whether the user has fully completed onboarding',
    example: false,
  })
  isOnboardingComplete: boolean;

  @ApiPropertyOptional({
    description: 'Timestamp when the user accepted the Terms and Conditions',
    example: '2026-02-05T11:33:18.234Z',
  })
  termsAcceptedAt?: Date;

  @ApiProperty({
    description: 'Whether all required metadata for the user account is complete',
    example: true,
  })
  isMetaComplete: boolean;
}


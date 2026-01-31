'use client'

import { Button, Paragraph, YStack } from '@my/ui'
import { useRouter } from 'solito/navigation'
import { PageHeader } from '@my/ui'
import { PAGE_DESCRIPTIONS } from 'app/constants/page-descriptions'

export function UserDetailScreen({ id }: { id: string }) {
  const router = useRouter()
  if (!id) {
    return null
  }
  return (
    <YStack
      flex={1}
      bg="$background"
    >
      <PageHeader
        title="User Profile"
        description={PAGE_DESCRIPTIONS['view-profile']}
        onBack={() => router.back()}
      />
      <YStack
        flex={1}
        justify="center"
        items="center"
        gap="$4"
      >
        <Paragraph
          text="center"
          fontWeight="700"
          color="$blue10"
        >{`User ID: ${id}`}</Paragraph>
      </YStack>
    </YStack>
  )
}

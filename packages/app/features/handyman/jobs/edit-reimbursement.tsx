'use client'

import { useState, useEffect } from 'react'
import {
  YStack,
  XStack,
  ScrollView,
  Text,
  Button,
  Spinner,
  View,
  Image,
  TextArea,
  Input,
} from '@my/ui'
import { GradientBackground } from '@my/ui'
import {
  ArrowLeft,
  Receipt,
  DollarSign,
  FileText,
  Tag,
  ImagePlus,
  X,
  Check,
  ChevronDown,
  Trash2,
} from '@tamagui/lucide-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastController } from '@tamagui/toast'
import * as ImagePicker from 'expo-image-picker'
import { Modal, Pressable } from 'react-native'
import {
  useHandymanReimbursement,
  useUpdateReimbursement,
  useReimbursementCategories,
} from '@my/api'
import type { ReimbursementCategory, RNFile, ReimbursementAttachment } from '@my/api'

export function EditReimbursementScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const toast = useToastController()
  const { jobId, reimbursementId } = useLocalSearchParams<{
    jobId: string
    reimbursementId: string
  }>()

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ReimbursementCategory | null>(null)
  const [existingAttachments, setExistingAttachments] = useState<ReimbursementAttachment[]>([])
  const [newAttachments, setNewAttachments] = useState<RNFile[]>([])
  const [attachmentsToRemove, setAttachmentsToRemove] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCategorySheet, setShowCategorySheet] = useState(false)

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useReimbursementCategories()

  // Fetch existing reimbursement
  const { data: reimbursement, isLoading: reimbursementLoading } = useHandymanReimbursement(
    jobId || '',
    reimbursementId || ''
  )

  const updateReimbursementMutation = useUpdateReimbursement()

  // Populate form with existing data
  useEffect(() => {
    if (reimbursement) {
      setName(reimbursement.name)
      setAmount(reimbursement.amount.toString())
      setNotes(reimbursement.notes || '')
      setSelectedCategory(reimbursement.category)
      setExistingAttachments(reimbursement.attachments)
    }
  }, [reimbursement])

  const handleAddAttachment = async () => {
    const totalAttachments =
      existingAttachments.length - attachmentsToRemove.length + newAttachments.length
    if (totalAttachments >= 5) {
      toast.show('Maximum attachments reached', {
        message: 'You can upload up to 5 files',
        native: false,
      })
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5 - totalAttachments,
    })

    if (!result.canceled && result.assets) {
      const attachments: RNFile[] = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `attachment_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      }))
      setNewAttachments((prev) => [...prev, ...attachments])
    }
  }

  const handleRemoveExistingAttachment = (attachmentId: string) => {
    setAttachmentsToRemove((prev) => [...prev, attachmentId])
  }

  const handleRemoveNewAttachment = (index: number) => {
    setNewAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!jobId || !reimbursementId) return

    // Validation
    if (!name.trim()) {
      toast.show('Name required', {
        message: 'Please enter a name for this expense',
        native: false,
      })
      return
    }

    if (!selectedCategory) {
      toast.show('Category required', {
        message: 'Please select a category',
        native: false,
      })
      return
    }

    const amountNum = Number.parseFloat(amount)
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      toast.show('Invalid amount', {
        message: 'Please enter a valid amount greater than 0',
        native: false,
      })
      return
    }

    // Check that at least one attachment remains
    const remainingAttachments =
      existingAttachments.length - attachmentsToRemove.length + newAttachments.length
    if (remainingAttachments === 0) {
      toast.show('Attachment required', {
        message: 'At least one attachment must remain',
        native: false,
      })
      return
    }

    setIsSubmitting(true)
    try {
      await updateReimbursementMutation.mutateAsync({
        jobId,
        reimbursementId,
        data: {
          name: name.trim(),
          category_id: selectedCategory.public_id,
          amount: amountNum,
          notes: notes.trim() || undefined,
          attachments: newAttachments.length > 0 ? newAttachments : undefined,
          attachments_to_remove: attachmentsToRemove.length > 0 ? attachmentsToRemove : undefined,
        },
      })

      toast.show('Reimbursement updated', {
        message: 'Your changes have been saved',
        native: false,
      })
      router.back()
    } catch (error: any) {
      toast.show('Failed to update', {
        message: error?.message || 'Please try again',
        native: false,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!jobId || !reimbursementId) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <Text color="$error">Invalid parameters</Text>
        </YStack>
      </GradientBackground>
    )
  }

  if (reimbursementLoading) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          gap="$md"
        >
          <Spinner
            size="large"
            color="$primary"
          />
          <Text color="$colorSubtle">Loading...</Text>
        </YStack>
      </GradientBackground>
    )
  }

  // Check if editable (only pending status can be edited)
  if (reimbursement && reimbursement.status !== 'pending') {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          pt={insets.top}
        >
          <XStack
            px="$5"
            py="$4"
            alignItems="center"
            gap="$3"
          >
            <Button
              unstyled
              onPress={() => router.back()}
              p="$2"
              hitSlop={12}
              pressStyle={{ opacity: 0.7 }}
            >
              <ArrowLeft
                size={22}
                color="$color"
              />
            </Button>
            <Text
              flex={1}
              fontSize={17}
              fontWeight="700"
              color="$color"
              textAlign="center"
            >
              Edit Reimbursement
            </Text>
            <View width={38} />
          </XStack>
          <YStack
            flex={1}
            justifyContent="center"
            alignItems="center"
            px="$lg"
            gap="$md"
          >
            <Text
              fontSize="$5"
              fontWeight="600"
              color="$color"
              textAlign="center"
            >
              Cannot Edit
            </Text>
            <Text
              fontSize="$3"
              color="$colorSubtle"
              textAlign="center"
            >
              This reimbursement has been {reimbursement.status} and cannot be modified.
            </Text>
            <Button
              bg="$primary"
              borderRadius="$lg"
              px="$xl"
              py="$md"
              onPress={() => router.back()}
              mt="$md"
            >
              <Text
                color="white"
                fontWeight="600"
              >
                Go Back
              </Text>
            </Button>
          </YStack>
        </YStack>
      </GradientBackground>
    )
  }

  const visibleExistingAttachments = existingAttachments.filter(
    (a) => !attachmentsToRemove.includes(a.public_id)
  )
  const totalAttachments = visibleExistingAttachments.length + newAttachments.length

  return (
    <GradientBackground>
      <YStack
        flex={1}
        pt={insets.top}
      >
        {/* Header */}
        <XStack
          px="$5"
          py="$4"
          alignItems="center"
          gap="$3"
        >
          <Button
            unstyled
            onPress={() => router.back()}
            p="$2"
            hitSlop={12}
            pressStyle={{ opacity: 0.7 }}
          >
            <ArrowLeft
              size={22}
              color="$color"
            />
          </Button>
          <Text
            flex={1}
            fontSize={17}
            fontWeight="700"
            color="$color"
            textAlign="center"
          >
            Edit Reimbursement
          </Text>
          <View width={38} />
        </XStack>

        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
        >
          <YStack
            px="$lg"
            pb="$2xl"
            gap="$lg"
          >
            {/* Expense Name */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$sm"
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <FileText
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Expense Name
                </Text>
              </XStack>
              <Input
                placeholder="e.g., Plumbing materials, Tools rental"
                value={name}
                onChangeText={setName}
                bg="$backgroundMuted"
                borderWidth={0}
                borderRadius="$4"
                px="$md"
                py="$sm"
              />
            </YStack>

            {/* Category */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$sm"
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <Tag
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Category
                </Text>
              </XStack>
              <Pressable onPress={() => setShowCategorySheet(true)}>
                <XStack
                  bg="$backgroundMuted"
                  borderRadius="$4"
                  px="$md"
                  py="$sm"
                  minHeight={44}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text
                    fontSize="$3"
                    color={selectedCategory ? '$color' : '$colorMuted'}
                  >
                    {selectedCategory ? selectedCategory.name : 'Select a category'}
                  </Text>
                  <ChevronDown
                    size={18}
                    color="$colorMuted"
                  />
                </XStack>
              </Pressable>
            </YStack>

            {/* Amount */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$sm"
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <DollarSign
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Amount
                </Text>
              </XStack>
              <XStack
                bg="$backgroundMuted"
                borderRadius="$4"
                px="$md"
                py="$sm"
                alignItems="center"
                gap="$sm"
              >
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$colorSubtle"
                >
                  $
                </Text>
                <Input
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  flex={1}
                  bg="transparent"
                  borderWidth={0}
                  px={0}
                />
              </XStack>
            </YStack>

            {/* Notes */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$sm"
            >
              <XStack
                alignItems="center"
                gap="$sm"
              >
                <Receipt
                  size={18}
                  color="$primary"
                />
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color="$color"
                >
                  Notes (Optional)
                </Text>
              </XStack>
              <TextArea
                placeholder="Additional details about this expense..."
                value={notes}
                onChangeText={setNotes}
                bg="$backgroundMuted"
                borderWidth={0}
                borderRadius="$4"
                px="$md"
                py="$sm"
                minHeight={80}
              />
            </YStack>

            {/* Attachments */}
            <YStack
              bg="rgba(255,255,255,0.95)"
              borderRadius={16}
              p="$md"
              borderWidth={1}
              borderColor="rgba(0,0,0,0.08)"
              gap="$md"
            >
              <XStack
                alignItems="center"
                justifyContent="space-between"
              >
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <ImagePlus
                    size={18}
                    color="$primary"
                  />
                  <Text
                    fontSize="$4"
                    fontWeight="600"
                    color="$color"
                  >
                    Attachments
                  </Text>
                  <Text
                    fontSize="$2"
                    color="$error"
                  >
                    *
                  </Text>
                </XStack>
                <Text
                  fontSize="$2"
                  color="$colorSubtle"
                >
                  {totalAttachments}/5
                </Text>
              </XStack>

              <Text
                fontSize="$2"
                color="$colorSubtle"
              >
                Upload receipts or proof of purchase (minimum 1 required)
              </Text>

              <XStack
                flexWrap="wrap"
                gap="$sm"
              >
                {/* Existing attachments */}
                {visibleExistingAttachments.map((attachment) => (
                  <View
                    key={attachment.public_id}
                    position="relative"
                  >
                    <Image
                      source={{ uri: attachment.file }}
                      width={80}
                      height={80}
                      borderRadius={8}
                    />
                    <Button
                      unstyled
                      position="absolute"
                      top={-8}
                      right={-8}
                      width={24}
                      height={24}
                      borderRadius={12}
                      bg="$error"
                      alignItems="center"
                      justifyContent="center"
                      onPress={() => handleRemoveExistingAttachment(attachment.public_id)}
                    >
                      <Trash2
                        size={12}
                        color="white"
                      />
                    </Button>
                  </View>
                ))}

                {/* New attachments */}
                {newAttachments.map((attachment, index) => (
                  <View
                    key={`new-${index}`}
                    position="relative"
                  >
                    <Image
                      source={{ uri: attachment.uri }}
                      width={80}
                      height={80}
                      borderRadius={8}
                    />
                    <Button
                      unstyled
                      position="absolute"
                      top={-8}
                      right={-8}
                      width={24}
                      height={24}
                      borderRadius={12}
                      bg="$error"
                      alignItems="center"
                      justifyContent="center"
                      onPress={() => handleRemoveNewAttachment(index)}
                    >
                      <X
                        size={14}
                        color="white"
                      />
                    </Button>
                  </View>
                ))}

                {totalAttachments < 5 && (
                  <Pressable onPress={handleAddAttachment}>
                    <View
                      width={80}
                      height={80}
                      borderRadius={8}
                      borderWidth={2}
                      borderStyle="dashed"
                      borderColor="$borderColor"
                      alignItems="center"
                      justifyContent="center"
                      bg="$backgroundMuted"
                    >
                      <ImagePlus
                        size={24}
                        color="$colorMuted"
                      />
                    </View>
                  </Pressable>
                )}
              </XStack>
            </YStack>

            {/* Submit Button */}
            <Button
              bg="$primary"
              borderRadius="$lg"
              py="$md"
              onPress={handleSubmit}
              disabled={isSubmitting}
              opacity={isSubmitting ? 0.7 : 1}
            >
              {isSubmitting ? (
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <Spinner
                    size="small"
                    color="white"
                  />
                  <Text
                    color="white"
                    fontWeight="600"
                  >
                    Saving...
                  </Text>
                </XStack>
              ) : (
                <XStack
                  alignItems="center"
                  gap="$sm"
                >
                  <Check
                    size={18}
                    color="white"
                  />
                  <Text
                    color="white"
                    fontWeight="600"
                  >
                    Save Changes
                  </Text>
                </XStack>
              )}
            </Button>
          </YStack>
        </ScrollView>

        {/* Category Bottom Sheet */}
        <Modal
          visible={showCategorySheet}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCategorySheet(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            onPress={() => setShowCategorySheet(false)}
          >
            <View
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg="$background"
              borderTopLeftRadius={24}
              borderTopRightRadius={24}
              pb={insets.bottom + 20}
            >
              <Pressable>
                <YStack
                  p="$lg"
                  gap="$md"
                >
                  <XStack
                    justifyContent="space-between"
                    alignItems="center"
                    pb="$sm"
                    borderBottomWidth={1}
                    borderBottomColor="rgba(0,0,0,0.08)"
                  >
                    <Text
                      fontSize="$5"
                      fontWeight="700"
                      color="$color"
                    >
                      Select Category
                    </Text>
                    <Button
                      unstyled
                      onPress={() => setShowCategorySheet(false)}
                      p="$sm"
                    >
                      <X
                        size={22}
                        color="$colorSubtle"
                      />
                    </Button>
                  </XStack>

                  {categoriesLoading ? (
                    <YStack
                      py="$xl"
                      alignItems="center"
                    >
                      <Spinner
                        size="large"
                        color="$primary"
                      />
                    </YStack>
                  ) : (
                    <YStack gap="$xs">
                      {categories?.map((category) => (
                        <Pressable
                          key={category.public_id}
                          onPress={() => {
                            setSelectedCategory(category)
                            setShowCategorySheet(false)
                          }}
                        >
                          <XStack
                            bg={
                              selectedCategory?.public_id === category.public_id
                                ? '$primaryBackground'
                                : '$backgroundMuted'
                            }
                            p="$md"
                            borderRadius={12}
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <YStack
                              flex={1}
                              gap="$xs"
                            >
                              <Text
                                fontSize="$4"
                                fontWeight="600"
                                color={
                                  selectedCategory?.public_id === category.public_id
                                    ? '$primary'
                                    : '$color'
                                }
                              >
                                {category.name}
                              </Text>
                              {category.description && (
                                <Text
                                  fontSize="$2"
                                  color="$colorSubtle"
                                  numberOfLines={1}
                                >
                                  {category.description}
                                </Text>
                              )}
                            </YStack>
                            {selectedCategory?.public_id === category.public_id && (
                              <Check
                                size={20}
                                color="$primary"
                              />
                            )}
                          </XStack>
                        </Pressable>
                      ))}
                    </YStack>
                  )}
                </YStack>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </YStack>
    </GradientBackground>
  )
}

'use client'

import { useState } from 'react'
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
} from '@tamagui/lucide-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useSafeArea } from 'app/provider/safe-area/use-safe-area'
import { useToastController } from '@tamagui/toast'
import * as ImagePicker from 'expo-image-picker'
import { Modal, Pressable } from 'react-native'
import { useCreateReimbursement, useReimbursementCategories } from '@my/api'
import type { ReimbursementCategory, RNFile } from '@my/api'

export function CreateReimbursementScreen() {
  const router = useRouter()
  const insets = useSafeArea()
  const toast = useToastController()
  const { jobId } = useLocalSearchParams<{ jobId: string }>()

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ReimbursementCategory | null>(null)
  const [attachments, setAttachments] = useState<RNFile[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCategorySheet, setShowCategorySheet] = useState(false)

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useReimbursementCategories()

  const createReimbursementMutation = useCreateReimbursement()

  const handleAddAttachment = async () => {
    if (attachments.length >= 5) {
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
      selectionLimit: 5 - attachments.length,
    })

    if (!result.canceled && result.assets) {
      const newAttachments: RNFile[] = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `attachment_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      }))
      setAttachments((prev) => [...prev, ...newAttachments])
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!jobId) return

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

    if (attachments.length === 0) {
      toast.show('Attachment required', {
        message: 'Please upload at least one receipt or proof',
        native: false,
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createReimbursementMutation.mutateAsync({
        jobId,
        data: {
          name: name.trim(),
          category_id: selectedCategory.public_id,
          amount: amountNum,
          notes: notes.trim() || undefined,
          attachments,
        },
      })

      toast.show('Reimbursement submitted', {
        message: 'Your request has been sent to the homeowner',
        native: false,
      })
      router.back()
    } catch (error: any) {
      toast.show('Failed to submit', {
        message: error?.message || 'Please try again',
        native: false,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!jobId) {
    return (
      <GradientBackground>
        <YStack
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <Text color="$error">Invalid job ID</Text>
        </YStack>
      </GradientBackground>
    )
  }

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
            New Reimbursement
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
                borderWidth={1}
                borderColor="$borderColor"
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
                  borderWidth={1}
                  borderColor="$borderColor"
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
                borderWidth={1}
                borderColor="$borderColor"
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
                borderWidth={1}
                borderColor="$borderColor"
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
                  {attachments.length}/5
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
                {attachments.map((attachment, index) => (
                  <View
                    key={index}
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
                      onPress={() => handleRemoveAttachment(index)}
                    >
                      <X
                        size={14}
                        color="white"
                      />
                    </Button>
                  </View>
                ))}

                {attachments.length < 5 && (
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
                    Submitting...
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
                    Submit Request
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

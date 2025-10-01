'use client'

import { Box, Text, Tooltip } from '@chakra-ui/react'

interface CircularProgressProps {
  value: number // 0-100
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showText?: boolean
  label?: string
}

export function CircularProgress({
  value,
  size = 40,
  strokeWidth = 4,
  color = '#805AD5', // purple.500
  backgroundColor = '#E2E8F0', // gray.300
  showText = true,
  label = '',
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (value / 100) * circumference

  const progressColor = value === 100 ? '#38A169' : color // green.500 when complete

  return (
    <Tooltip
      label={label}
      isDisabled={!label}
    >
      <Box
        position="relative"
        display="inline-block"
      >
        <svg
          width={size}
          height={size}
          style={{
            transform: 'rotate(-90deg)',
            transition: 'stroke-dashoffset 0.3s ease-in-out',
          }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.3s ease-in-out, stroke 0.3s ease-in-out',
            }}
          />
        </svg>

        {showText && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            textAlign="center"
          >
            <Text
              fontSize={size > 30 ? 'xs' : '2xs'}
              fontWeight="bold"
              color={value === 100 ? 'green.600' : 'purple.600'}
              lineHeight="1"
            >
              {Math.round(value)}%
            </Text>
          </Box>
        )}
      </Box>
    </Tooltip>
  )
}

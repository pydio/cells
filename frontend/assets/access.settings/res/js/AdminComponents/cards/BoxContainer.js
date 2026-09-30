import { Box } from '@mantine/core';

export default function BoxContainer({ children, ...props }) {
  return (
    <Box p="sm" {...props}>
      {children}
    </Box>
  )
}
